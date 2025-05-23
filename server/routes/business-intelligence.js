const express = require("express")
const sql = require("mssql")
const router = express.Router()

// Get sales forecast for a product
// Get sales forecast for a product with customizable time intervals
router.get("/sales-forecast/:productId", async (req, res) => {
  try {
    const interval = req.query.interval || 'month'; // Default to month if not specified
    const intervalMinutes = req.query.minutes || 5; // Default to 5 minutes if using minute intervals
    
    console.log(`Fetching forecast for product ID: ${req.params.productId} with interval: ${interval}`);
    const pool = await sql.connect(req.app.locals.sqlConfig);
    console.log("SQL connection successful");
    
    const request = pool.request()
      .input("ProductID", sql.Int, parseInt(req.params.productId));
      
    // Add interval parameters if using minute intervals
    if (interval === 'minute') {
      request.input("IntervalType", sql.VarChar(10), 'minute');
      request.input("IntervalValue", sql.Int, parseInt(intervalMinutes));
    } else {
      request.input("IntervalType", sql.VarChar(10), 'month');
      request.input("IntervalValue", sql.Int, 1);
    }
    
    const result = await request.execute("sp_GenerateSalesForecast");
    
    if (result && result.recordsets && result.recordsets.length > 0) {
      console.log(`Forecast data retrieved: ${result.recordsets[0].length} records`);
      res.json(result.recordsets[0]);
    } else {
      console.log("No data returned from stored procedure");
      res.json([]);
    }
  } catch (err) {
    console.error("Error fetching sales forecast:", err);
    res.status(500).json({ error: `Failed to fetch sales forecast: ${err.message}` });
  }
});




// Generate sales forecast for a product
router.post("/generate-sales-forecast/:productId", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("ProductID", sql.Int, req.params.productId)
      .input("ForecastPeriods", sql.Int, req.body.forecastPeriods || 12)
      .input("Alpha", sql.Decimal(3, 2), req.body.alpha || 0.3)
      .execute("sp_GenerateSalesForecast")

    res.json(result.recordset)
  } catch (err) {
    console.error("Error generating sales forecast:", err)
    res.status(500).json({ error: "Failed to generate sales forecast" })
  }
})

// Get product associations
router.get("/product-associations", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().execute("sp_GenerateProductAssociations")

    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching product associations:", err)
    res.status(500).json({ error: "Failed to fetch product associations" })
  }
})

// Generate product associations
router.post("/generate-product-associations", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("MinSupport", sql.Decimal(5, 4), req.body.minSupport || 0.01)
      .input("MinConfidence", sql.Decimal(5, 4), req.body.minConfidence || 0.2)
      .execute("sp_GenerateProductAssociations")

    res.json(result.recordset)
  } catch (err) {
    console.error("Error generating product associations:", err)
    res.status(500).json({ error: "Failed to generate product associations" })
  }
})

// Get customer segments
router.get("/customer-segments", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().execute("sp_GenerateCustomerSegments")

    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching customer segments:", err)
    res.status(500).json({ error: "Failed to fetch customer segments" })
  }
})

// Generate customer segments
router.post("/generate-customer-segments", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool.request().execute("sp_GenerateCustomerSegments")

    res.json(result.recordset)
  } catch (err) {
    console.error("Error generating customer segments:", err)
    res.status(500).json({ error: "Failed to generate customer segments" })
  }
})

// Get product recommendations for a shop
router.get("/product-recommendations/:shopId", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("ShopID", sql.Int, req.params.shopId)
      .execute("sp_GenerateProductRecommendations")

    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching product recommendations:", err)
    res.status(500).json({ error: "Failed to fetch product recommendations" })
  }
})

// Generate product recommendations for a shop
router.post("/generate-product-recommendations/:shopId", async (req, res) => {
  try {
    const pool = await sql.connect(req.app.locals.sqlConfig)
    const result = await pool
      .request()
      .input("ShopID", sql.Int, req.params.shopId)
      .execute("sp_GenerateProductRecommendations")

    res.json(result.recordset)
  } catch (err) {
    console.error("Error generating product recommendations:", err)
    res.status(500).json({ error: "Failed to generate product recommendations" })
  }
})

module.exports = router
