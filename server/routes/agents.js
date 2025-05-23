const express = require("express")
const sql = require("mssql")
const router = express.Router()

// Get all agents
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().query("SELECT * FROM Agent")
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching agents:", err)
    res.status(500).json({ error: "Failed to fetch agents" })
  }
})

// Get agent by ID
router.get("/:id", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("agent_id", sql.Int, req.params.id)
      .query("SELECT * FROM Agent WHERE agent_id = @agent_id")

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Agent not found" })
    }

    res.json(result.recordset[0])
  } catch (err) {
    console.error("Error fetching agent:", err)
    res.status(500).json({ error: "Failed to fetch agent" })
  }
})

// Create new agent
router.post("/", async (req, res) => {
  const { name, phone_no, location } = req.body

  if (!name) {
    return res.status(400).json({ error: "Agent name is required" })
  }

  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("name", sql.VarChar(100), name)
      .input("phone_no", sql.VarChar(20), phone_no || null)
      .input("location", sql.VarChar(100), location || null)
      .query(`
        INSERT INTO Agent (name, phone_no, location)
        OUTPUT INSERTED.*
        VALUES (@name, @phone_no, @location)
      `)

    res.status(201).json(result.recordset[0])
  } catch (err) {
    console.error("Error creating agent:", err)
    res.status(500).json({ error: "Failed to create agent" })
  }
})

// Update agent
router.put("/:id", async (req, res) => {
  const { name, phone_no, location } = req.body

  if (!name) {
    return res.status(400).json({ error: "Agent name is required" })
  }

  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("agent_id", sql.Int, req.params.id)
      .input("name", sql.VarChar(100), name)
      .input("phone_no", sql.VarChar(20), phone_no || null)
      .input("location", sql.VarChar(100), location || null)
      .query(`
        UPDATE Agent
        SET name = @name, phone_no = @phone_no, location = @location
        OUTPUT INSERTED.*
        WHERE agent_id = @agent_id
      `)

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Agent not found" })
    }

    res.json(result.recordset[0])
  } catch (err) {
    console.error("Error updating agent:", err)
    res.status(500).json({ error: "Failed to update agent" })
  }
})

// Delete agent
router.delete("/:id", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("agent_id", sql.Int, req.params.id)
      .query("DELETE FROM Agent WHERE agent_id = @agent_id")

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Agent not found" })
    }

    res.json({ message: "Agent deleted successfully" })
  } catch (err) {
    console.error("Error deleting agent:", err)
    res.status(500).json({ error: "Failed to delete agent" })
  }
})

module.exports = router
