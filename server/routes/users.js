const express = require("express")
const sql = require("mssql")
const router = express.Router()

// Get all agents
router.get("/agents", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().query("SELECT agent_id, name FROM Agent")
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching agents:", err)
    res.status(500).json({ error: "Failed to fetch agents" })
  }
})

// Get all sales reps
router.get("/sales-reps", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().query("SELECT sales_rep_id, name FROM Sales_Rep")
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching sales reps:", err)
    res.status(500).json({ error: "Failed to fetch sales reps" })
  }
})

// Get all suppliers
router.get("/suppliers", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().query("SELECT supplier_id, name FROM Supplier")
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching suppliers:", err)
    res.status(500).json({ error: "Failed to fetch suppliers" })
  }
})

// Create new agent
router.post("/agents", async (req, res) => {
  const { name, address, phone_number, email, supplier_id } = req.body

  if (!name) {
    return res.status(400).json({ error: "Agent name is required" })
  }

  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("name", sql.VarChar(100), name)
      .input("phone_no", sql.VarChar(20), phone_number || null)
      .input("location", sql.VarChar(100), email || null)
      .query(`
        INSERT INTO Agent (name, phone_no, location)
        OUTPUT INSERTED.*
        VALUES (@name, @phone_no, @location)
      `)
    console.log(result.recordset[0])
    res.status(201).json(result.recordset[0])
  } catch (err) {
    console.error("Error creating agent:", err)
    res.status(500).json({ error: "Failed to create agent" })
  }
})

// Create new sales rep
router.post("/sales-reps", async (req, res) => {
  const { name, email, phone_number, territory } = req.body

  if (!name) {
    return res.status(400).json({ error: "Sales rep name is required" })
  }

  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("name", sql.VarChar(100), name)
      .input("territory", sql.VarChar(100), territory || null)
      .input("phone_number", sql.VarChar(20), phone_number || null)
      .query(`
        INSERT INTO Sales_Rep (name, territory, phone_number)
        OUTPUT INSERTED.*
        VALUES (@name, @territory, @phone_number )
      `)

    res.status(201).json(result.recordset[0])
  } catch (err) {
    console.error("Error creating sales rep:", err)
    res.status(500).json({ error: "Failed to create sales rep" })
  }
})

// Create new shop
// Create new shop
router.post("/shops", async (req, res) => {
  const { name, address, phone_number, sales_rep_id } = req.body
  console.log("Creating shop with data:", req.body);
  
  if (!name) {
    return res.status(400).json({ error: "Shop name is required" })
  }

  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("name", sql.VarChar(100), name)
      .input("address", sql.VarChar(200), address || null)
      .input("phone_number", sql.VarChar(20), phone_number || null)
      .input("sales_rep_id", sql.Int, sales_rep_id || null)
      .query(`
        INSERT INTO Shop (name, address, phone_number, sales_rep_id)
        OUTPUT INSERTED.*
        VALUES (@name, @address, @phone_number, @sales_rep_id)
      `)

    res.status(201).json(result.recordset[0])
    console.log("Shop created successfully:", result.recordset[0])
  } catch (err) {
    console.error("Error creating shop:", err)
    res.status(500).json({ error: "Failed to create shop" })
  }
})


// Get all shops
// Get all shops
router.get("/shops", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().query(`
      SELECT s.shop_id, s.name, s.address, s.phone_number, s.sales_rep_id, 
             sr.name as sales_rep_name
      FROM Shop s
      LEFT JOIN Sales_Rep sr ON s.sales_rep_id = sr.sales_rep_id
    `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching shops:", err)
    res.status(500).json({ error: "Failed to fetch shops" })
  }
})
// Get shops by sales rep ID
router.get("/shops/sales-rep/:id", async (req, res) => {
  const salesRepId = req.params.id
  
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("sales_rep_id", sql.Int, salesRepId)
      .query(`
        SELECT shop_id, name, address, phone_number, sales_rep_id
        FROM Shop
        WHERE sales_rep_id = @sales_rep_id
      `)
    res.json(result.recordset)
  } catch (err) {
    console.error(`Error fetching shops for sales rep ${salesRepId}:`, err)
    res.status(500).json({ error: "Failed to fetch shops" })
  }
})



module.exports = router
