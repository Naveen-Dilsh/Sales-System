const express = require("express")
const cors = require("cors")
const sql = require("mssql")
const dotenv = require("dotenv")

// Import routes
const agentsRoutes = require("./routes/agents")
const inventoryRoutes = require("./routes/inventory")
const ordersRoutes = require("./routes/orders")
const productsRoutes = require("./routes/products")
const usersRoutes = require("./routes/users") // Add this line
const biRoutes = require("./routes/business-intelligence") // Add this line

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000 // Use a different port than SQL Server

// Middleware
app.use(cors())
app.use(express.json())

// SQL Server Configuration
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  port: 1433, // This is the SQL Server port
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true, // change to false for production
  },
}

// Store SQL config in app locals for route access
app.locals.sqlConfig = sqlConfig

// Test database connection
async function testConnection() {
  try {
    await sql.connect(sqlConfig)
    console.log("Connected to SQL Server successfully!")
  } catch (err) {
    console.error("Database connection failed:", err)
  }
}

testConnection()

// API Routes
app.use("/api/agents", agentsRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/orders", ordersRoutes)
app.use("/api/products", productsRoutes)
app.use("/api/users", usersRoutes) // Add this line
app.use("/api/bi", biRoutes) // Add this line

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Sales System API is running!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app
