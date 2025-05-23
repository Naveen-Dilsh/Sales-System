const express = require("express")
const sql = require("mssql")
const router = express.Router()

// Get all products
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().query(`
      SELECT p.*, s.name as supplier_name
      FROM Product p
      JOIN Supplier s ON p.supplier_id = s.supplier_id
    `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching products:", err)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// Get products by supplier ID
router.get("/supplier/:id", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("supplier_id", sql.Int, req.params.id)
      .query(`
        SELECT p.*, s.name as supplier_name
        FROM Product p
        JOIN Supplier s ON p.supplier_id = s.supplier_id
        WHERE p.supplier_id = @supplier_id
      `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching products:", err)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// Get product sales analysis
router.get("/analysis", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)

    let query = `SELECT * FROM vw_ProductSalesAnalysis`

    // Add filter if supplier_id is provided
    if (req.query.supplier_id) {
      query += ` WHERE supplier_id = @supplier_id`
    }

    const request = pool.request()

    if (req.query.supplier_id) {
      request.input("supplier_id", sql.Int, req.query.supplier_id)
    }

    const result = await request.query(query)

    // Ensure consistent property names in the response
    const formattedResults = result.recordset.map((product) => ({
      product_id: product.product_id,
      ProductName: product.product_name || product.ProductName,
      SupplierName: product.supplier_name || product.SupplierName,
      TotalQuantitySold: product.total_quantity_sold || product.TotalQuantitySold,
      TotalRevenue: product.total_revenue || product.TotalRevenue,
      NumberOfOrders: product.number_of_orders || product.NumberOfOrders,
      NumberOfShops: product.number_of_shops || product.NumberOfShops,
    }))

    res.json(formattedResults)
  } catch (err) {
    console.error("Error fetching product sales analysis:", err)
    res.status(500).json({ error: "Failed to fetch product sales analysis" })
  }
})

// Get price history for products
router.get("/price-history", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().query(`
      SELECT pph.history_id, pph.product_id, p.name as product_name, 
             pph.old_price, pph.new_price, pph.change_date
      FROM Product_Price_History pph
      JOIN Product p ON pph.product_id = p.product_id
      ORDER BY p.product_id, pph.change_date
    `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching price history:", err)
    res.status(500).json({ error: "Failed to fetch price history" })
  }
})

// Create new product
router.post("/", async (req, res) => {
  const { supplier_id, name, description, price, initial_quantity = 100 } = req.body

  if (!supplier_id || !name || !price) {
    return res.status(400).json({ error: "Supplier ID, name, and price are required" })
  }

  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)

    // Start a transaction
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      // 1. Insert the product
      const productRequest = new sql.Request(transaction)
      productRequest.input("supplier_id", sql.Int, supplier_id)
      productRequest.input("name", sql.VarChar(100), name)
      productRequest.input("description", sql.VarChar(500), description || null)
      productRequest.input("price", sql.Decimal(10, 2), price)

      const productResult = await productRequest.query(`
        INSERT INTO Product (supplier_id, name, description, price)
        OUTPUT INSERTED.*
        VALUES (@supplier_id, @name, @description, @price)
      `)

      const newProduct = productResult.recordset[0]
      console.log("Created new product:", newProduct)

      // 2. Get all agents
      const agentsRequest = new sql.Request(transaction)
      const agentsResult = await agentsRequest.query(`SELECT agent_id FROM Agent`)
      const agents = agentsResult.recordset
      console.log(`Found ${agents.length} agents for inventory creation`)

      // 3. Create inventory entries for each agent
      for (const agent of agents) {
        const inventoryRequest = new sql.Request(transaction)
        inventoryRequest.input("product_id", sql.Int, newProduct.product_id)
        inventoryRequest.input("agent_id", sql.Int, agent.agent_id)
        inventoryRequest.input("quantity", sql.Int, initial_quantity)

        await inventoryRequest.query(`
          INSERT INTO Inventory (product_id, agent_id, quantity, last_update_date)
          VALUES (@product_id, @agent_id, @quantity, GETDATE())
        `)
        console.log(`Created inventory for agent ${agent.agent_id} with quantity ${initial_quantity}`)
      }

      // Commit the transaction
      await transaction.commit()
      console.log("Transaction committed successfully")

      res.status(201).json({
        ...newProduct,
        message: `Product created with initial inventory of ${initial_quantity} units for ${agents.length} agents`,
      })
    } catch (err) {
      // If there's an error, roll back the transaction
      await transaction.rollback()
      console.error("Transaction rolled back due to error:", err)
      throw err
    }
  } catch (err) {
    console.error("Error creating product:", err)
    res.status(500).json({ error: `Failed to create product: ${err.message}` })
  }
})

// Update product
router.put("/:id", async (req, res) => {
  const { name, description, price } = req.body

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" })
  }

  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)

    // First update the product without OUTPUT clause
    const updateResult = await pool
      .request()
      .input("product_id", sql.Int, req.params.id)
      .input("name", sql.VarChar(100), name)
      .input("description", sql.VarChar(500), description || null)
      .input("price", sql.Decimal(10, 2), price)
      .query(`
        UPDATE Product
        SET name = @name, description = @description, price = @price
        WHERE product_id = @product_id
      `)

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Then fetch the updated product
    const selectResult = await pool
      .request()
      .input("product_id", sql.Int, req.params.id)
      .query(`
        SELECT p.*, s.name as supplier_name
        FROM Product p
        JOIN Supplier s ON p.supplier_id = s.supplier_id
        WHERE p.product_id = @product_id
      `)

    if (selectResult.recordset.length === 0) {
      return res.status(404).json({ error: "Product not found after update" })
    }

    // Add price history record
    try {
      const oldPriceResult = await pool
        .request()
        .input("product_id", sql.Int, req.params.id)
        .query(`
          SELECT TOP 1 new_price 
          FROM Product_Price_History 
          WHERE product_id = @product_id 
          ORDER BY change_date DESC
        `)

      const oldPrice = oldPriceResult.recordset.length > 0 ? oldPriceResult.recordset[0].new_price : null

      // Only add history if price has changed
      if (oldPrice === null || oldPrice !== price) {
        await pool
          .request()
          .input("product_id", sql.Int, req.params.id)
          .input("old_price", sql.Decimal(10, 2), oldPrice || price)
          .input("new_price", sql.Decimal(10, 2), price)
          .query(`
            INSERT INTO Product_Price_History (product_id, old_price, new_price, change_date)
            VALUES (@product_id, @old_price, @new_price, GETDATE())
          `)
      }
    } catch (historyErr) {
      console.warn("Could not update price history:", historyErr)
      // Continue with the response even if price history update fails
    }

    res.json(selectResult.recordset[0])
  } catch (err) {
    console.error("Error updating product:", err)
    res.status(500).json({ error: "Failed to update product" })
  }
})

module.exports = router
