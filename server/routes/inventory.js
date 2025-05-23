const express = require("express")
const sql = require("mssql")
const router = express.Router()

// Get all inventory items
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().query(`
      SELECT i.*, p.name as product_name, a.name as agent_name, s.name as supplier_name
      FROM Inventory i
      JOIN Product p ON i.product_id = p.product_id
      JOIN Agent a ON i.agent_id = a.agent_id
      JOIN Supplier s ON p.supplier_id = s.supplier_id
    `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching inventory:", err)
    res.status(500).json({ error: "Failed to fetch inventory" })
  }
})

// Get inventory by agent ID
router.get("/agent/:id", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("agent_id", sql.Int, req.params.id)
      .query(`
        SELECT i.*, p.name as product_name, a.name as agent_name, s.name as supplier_name
        FROM Inventory i
        JOIN Product p ON i.product_id = p.product_id
        JOIN Agent a ON i.agent_id = a.agent_id
        JOIN Supplier s ON p.supplier_id = s.supplier_id
        WHERE i.agent_id = @agent_id
      `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching inventory:", err)
    res.status(500).json({ error: "Failed to fetch inventory" })
  }
})

// Get low inventory products
router.get("/low/:threshold", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("threshold", sql.Int, req.params.threshold)
      .query(`
        SELECT i.product_id, i.agent_id, p.name as ProductName, i.quantity, 
               a.name as AgentName, s.name as SupplierName
        FROM Inventory i
        JOIN Product p ON i.product_id = p.product_id
        JOIN Agent a ON i.agent_id = a.agent_id
        JOIN Supplier s ON p.supplier_id = s.supplier_id
        WHERE i.quantity <= @threshold
      `)

    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching low inventory products:", err)
    res.status(500).json({ error: "Failed to fetch low inventory products" })
  }
})

// Add restock inventory endpoint using stored procedure
router.post("/restock", async (req, res) => {
  try {
    const { agent_id, product_id, quantity } = req.body

    if (!agent_id || !product_id) {
      return res.status(400).json({ error: "Agent ID and Product ID are required" })
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Valid quantity is required" })
    }

    const pool = await sql.connect(req.app.locals.sqlConfig)

    // Call the stored procedure
    const result = await pool
      .request()
      .input("AgentID", sql.Int, agent_id)
      .input("ProductID", sql.Int, product_id)
      .input("QuantityToAdd", sql.Int, quantity)
      .execute("sp_RestockInventory")

    // The stored procedure returns the updated inventory information
    if (result.recordset && result.recordset.length > 0) {
      res.json({
        message: "Inventory restocked successfully",
        inventory: result.recordset[0],
      })
    } else {
      res.status(500).json({ error: "Failed to restock inventory" })
    }
  } catch (err) {
    console.error("Error restocking inventory:", err)
    res.status(500).json({ error: `Failed to restock inventory: ${err.message}` })
  }
})

module.exports = router
