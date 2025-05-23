const express = require("express")
const sql = require("mssql")
const router = express.Router()

// Get all orders with summary
router.get("/summary", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const query = `SELECT o.order_id, o.agent_id, o.sales_rep_id, a.name as AgentName, s.name as ShopName, 
                sr.name as SalesRepName, p.method as PaymentMethod, p.amount as PaymentAmount, 
                o.status, COUNT(oi.product_id) as TotalItems, SUM(oi.quantity) as TotalQuantity, 
                SUM(oi.quantity * oi.price) as TotalOrderValue, MAX(oi.order_date) as OrderDate
                FROM [Order] o
                JOIN Agent a ON o.agent_id = a.agent_id
                JOIN Shop s ON o.shop_id = s.shop_id
                JOIN Sales_Rep sr ON o.sales_rep_id = sr.sales_rep_id
                JOIN Payment p ON o.payment_id = p.payment_id
                JOIN Order_Item oi ON o.order_id = oi.order_id
                GROUP BY o.order_id, o.agent_id, o.sales_rep_id, a.name, s.name, sr.name, p.method, p.amount, o.status`

    // We'll handle filtering on the client side to avoid query parameter issues
    const result = await pool.request().query(query)

    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching order summaries:", err)
    res.status(500).json({ error: "Failed to fetch order summaries" })
  }
})

// Get orders by agent ID
router.get("/agent/:id", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("agent_id", sql.Int, req.params.id)
      .query(`
        SELECT o.* FROM [Order] o
        WHERE o.agent_id = @agent_id
      `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching orders:", err)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// Add this route to get orders by sales rep ID
router.get("/sales-rep/:id", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("sales_rep_id", sql.Int, req.params.id)
      .query(`
        SELECT o.* FROM [Order] o
        WHERE o.sales_rep_id = @sales_rep_id
      `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching orders:", err)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// Get order items by order ID
router.get("/:id/items", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("order_id", sql.Int, req.params.id)
      .query(`
        SELECT oi.*, p.name as product_name
        FROM Order_Item oi
        JOIN Product p ON oi.product_id = p.product_id
        WHERE oi.order_id = @order_id
      `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching order items:", err)
    res.status(500).json({ error: "Failed to fetch order items" })
  }
})

// Create new order
router.post("/", async (req, res) => {
  const { agentId, shopId, salesRepId, paymentMethod, paymentAmount, productIds, quantities, prices, orderStatus } =
    req.body

  if (!agentId || !shopId || !salesRepId || !paymentMethod || !paymentAmount || !productIds || !quantities || !prices) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  // Validate arrays have the same length
  if (productIds.length !== quantities.length || productIds.length !== prices.length) {
    return res.status(400).json({ error: "Product IDs, quantities, and prices arrays must have the same length" })
  }

  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)

    // Start a transaction
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      // 1. Create payment record
      const paymentRequest = new sql.Request(transaction)
      paymentRequest.input("method", sql.VarChar(50), paymentMethod)
      paymentRequest.input("amount", sql.Decimal(10, 2), paymentAmount)

      const paymentResult = await paymentRequest.query(`
        INSERT INTO Payment (method, amount, payment_date)
        OUTPUT INSERTED.payment_id
        VALUES (@method, @amount, GETDATE())
      `)

      const paymentId = paymentResult.recordset[0].payment_id

      // 2. Create order record
      const orderRequest = new sql.Request(transaction)
      orderRequest.input("agent_id", sql.Int, agentId)
      orderRequest.input("shop_id", sql.Int, shopId)
      orderRequest.input("sales_rep_id", sql.Int, salesRepId)
      orderRequest.input("payment_id", sql.Int, paymentId)
      orderRequest.input("status", sql.VarChar(50), orderStatus || "Processing")

      const orderResult = await orderRequest.query(`
        INSERT INTO [Order] (agent_id, shop_id, sales_rep_id, payment_id, status)
        OUTPUT INSERTED.order_id
        VALUES (@agent_id, @shop_id, @sales_rep_id, @payment_id, @status)
      `)

      const orderId = orderResult.recordset[0].order_id

      // 3. Create order items and update inventory
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i]
        const quantity = quantities[i]
        const price = prices[i]

        // Check inventory availability
        const inventoryRequest = new sql.Request(transaction)
        inventoryRequest.input("product_id", sql.Int, productId)
        inventoryRequest.input("agent_id", sql.Int, agentId)

        const inventoryResult = await inventoryRequest.query(`
          SELECT quantity FROM Inventory
          WHERE product_id = @product_id AND agent_id = @agent_id
        `)

        if (inventoryResult.recordset.length === 0) {
          throw new Error(`No inventory record found for product ID ${productId} and agent ID ${agentId}`)
        }

        const availableQuantity = inventoryResult.recordset[0].quantity

        if (availableQuantity < quantity) {
          throw new Error(
            `Insufficient inventory for product ID ${productId}. Available: ${availableQuantity}, Requested: ${quantity}`,
          )
        }

        // Create order item
        const orderItemRequest = new sql.Request(transaction)
        orderItemRequest.input("order_id", sql.Int, orderId)
        orderItemRequest.input("product_id", sql.Int, productId)
        orderItemRequest.input("quantity", sql.Int, quantity)
        orderItemRequest.input("price", sql.Decimal(10, 2), price)

        await orderItemRequest.query(`
          INSERT INTO Order_Item (order_id, product_id, quantity, price, order_date)
          VALUES (@order_id, @product_id, @quantity, @price, GETDATE())
        `)

        // Update inventory
        const updateInventoryRequest = new sql.Request(transaction)
        updateInventoryRequest.input("product_id", sql.Int, productId)
        updateInventoryRequest.input("agent_id", sql.Int, agentId)
        updateInventoryRequest.input("quantity", sql.Int, quantity)

        await updateInventoryRequest.query(`
          UPDATE Inventory
          SET quantity = quantity - @quantity, last_update_date = GETDATE()
          WHERE product_id = @product_id AND agent_id = @agent_id
        `)
      }

      // Commit the transaction
      await transaction.commit()

      res.status(201).json({ orderId })
    } catch (err) {
      // If there's an error, roll back the transaction
      await transaction.rollback()
      throw err
    }
  } catch (err) {
    console.error("Error creating order:", err)
    res.status(500).json({ error: err.message || "Failed to create order" })
  }
})

// Update order status
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ error: "Status is required" })
  }

  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("order_id", sql.Int, req.params.id)
      .input("status", sql.VarChar(50), status)
      .query(`
        UPDATE [Order]
        SET status = @status
        OUTPUT INSERTED.*
        WHERE order_id = @order_id
      `)

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Order not found" })
    }

    res.json(result.recordset[0])
  } catch (err) {
    console.error("Error updating order status:", err)
    res.status(500).json({ error: "Failed to update order status" })
  }
})

module.exports = router
