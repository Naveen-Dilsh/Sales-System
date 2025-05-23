"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { businessIntelligenceAPI } from "@/lib/api"

// Define interfaces for our data
interface SalesForecast {
  productName: string
  forecastDate: string
  predictedQuantity: number
  confidenceLevel: number
}

interface ProductAssociation {
  association_id: number
  Product1: string
  Product2: string
  support: number
  confidence: number
  lift: number
  relationship: string
}

interface CustomerSegment {
  segment_id: number
  ShopName: string
  recency_score: number
  frequency_score: number
  monetary_score: number
  rfm_score: number
  segment_name: string
}

interface ProductRecommendation {
  recommendation_id: number
  shopName: string
  productName: string
  description: string
  price: number
  supplierName: string
  score: number
  reason: string
}

export default function BusinessIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState("forecasting")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedShop, setSelectedShop] = useState<string>("")
  const [products, setProducts] = useState<any[]>([])
  const [shops, setShops] = useState<any[]>([])
  const [salesForecasts, setSalesForecasts] = useState<SalesForecast[]>([])
  const [productAssociations, setProductAssociations] = useState<ProductAssociation[]>([])
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([])
  const [productRecommendations, setProductRecommendations] = useState<ProductRecommendation[]>([])
  const [selectedInterval, setSelectedInterval] = useState<string>('month')
  const [selectedMinutes, setSelectedMinutes] = useState<string>('5')
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    products: false,
    shops: false,
    forecasts: false,
    associations: false,
    segments: false,
    recommendations: false,
  })
  const [error, setError] = useState<string | null>(null)

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]
  const SEGMENT_COLORS = {
    Champions: "#4CAF50",
    "Loyal Customers": "#2196F3",
    "Recent Customers": "#9C27B0",
    Promising: "#00BCD4",
    "Customers Needing Attention": "#FFC107",
    "At Risk": "#FF9800",
    "Can't Lose Them": "#F44336",
    Hibernating: "#795548",
    Lost: "#9E9E9E",
    Other: "#607D8B",
  }

  // Fetch products and shops on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading((prev) => ({ ...prev, products: true, shops: true }))

        const productsResponse = await businessIntelligenceAPI.getProducts()
        const shopsResponse = await businessIntelligenceAPI.getShops()

        setProducts(productsResponse)
        setShops(shopsResponse)

        if (productsResponse.length > 0) {
          setSelectedProduct(productsResponse[0].product_id.toString())
        }

        if (shopsResponse.length > 0) {
          setSelectedShop(shopsResponse[0].shop_id.toString())
        }
      } catch (err) {
        console.error("Error fetching initial data:", err)
        setError("Failed to load initial data. Please try again later.")
        toast.error("Failed to load initial data")
      } finally {
        setLoading((prev) => ({ ...prev, products: false, shops: false }))
      }
    }

    fetchInitialData()
  }, [])

  // Fetch sales forecasts when selected product changes
  useEffect(() => {
    if (selectedProduct && activeTab === "forecasting") {
      fetchSalesForecasts(Number.parseInt(selectedProduct))
    }
  }, [selectedProduct, activeTab])

  // Fetch product associations when tab changes to associations
  useEffect(() => {
    if (activeTab === "associations") {
      fetchProductAssociations()
    }
  }, [activeTab])

  // Fetch customer segments when tab changes to segmentation
  useEffect(() => {
    if (activeTab === "segmentation") {
      fetchCustomerSegments()
    }
  }, [activeTab])

  // Fetch product recommendations when selected shop changes
  useEffect(() => {
    if (selectedShop && activeTab === "recommendations") {
      fetchProductRecommendations(Number.parseInt(selectedShop))
    }
  }, [selectedShop, activeTab])

  // Re-fetch when interval changes
  useEffect(() => {
    if (selectedProduct && activeTab === "forecasting") {
      fetchSalesForecasts(Number.parseInt(selectedProduct))
    }
  }, [selectedProduct, selectedInterval, selectedMinutes, activeTab])

  const fetchSalesForecasts = async (productId: number) => {
  try {
    setLoading((prev) => ({ ...prev, forecasts: true }))

    let intervalParam = ''
    if (selectedInterval === 'minute') {
      intervalParam = `?interval=minute&minutes=${selectedMinutes}`
    } else {
      intervalParam = `?interval=month`
    }
    
    console.log(`Fetching forecast with interval: ${intervalParam}`)
    
    const response = await businessIntelligenceAPI.getSalesForecast(productId, intervalParam)
    
    if (!response || !Array.isArray(response)) {
      console.warn("Invalid response format:", response)
      setSalesForecasts([])
      return
    }
    
    const transformedForecasts = response.map(forecast => ({
      productName: products.find(p => p.product_id === forecast.product_id)?.name || "Unknown Product",
      forecastDate: forecast.forecast_date,
      predictedQuantity: forecast.forecasted_quantity,
      confidenceLevel: forecast.confidence_level / 100
    }))
    
    console.log("Transformed forecasts:", transformedForecasts)
    setSalesForecasts(transformedForecasts)
  } catch (err) {
    console.error("Error fetching sales forecasts:", err)
    toast.error("Failed to load sales forecasts")
    setSalesForecasts([]) // Set empty array on error
  } finally {
    setLoading((prev) => ({ ...prev, forecasts: false }))
  }
}


  const fetchProductAssociations = async () => {
    try {
      setLoading((prev) => ({ ...prev, associations: true }))

      const response = await businessIntelligenceAPI.getProductAssociations()
      
      const transformedAssociations = response.map((association: { Product1: any; Product2: any; Relationship: any }) => ({
        ...association,
        product1: association.Product1,
        product2: association.Product2,
        relationship: association.Relationship
      }))
      
      setProductAssociations(transformedAssociations)
    } catch (err) {
      console.error("Error fetching product associations:", err)
      toast.error("Failed to load product associations")
    } finally {
      setLoading((prev) => ({ ...prev, associations: false }))
    }
  }

  const fetchCustomerSegments = async () => {
    try {
      setLoading((prev) => ({ ...prev, segments: true }))

      const response = await businessIntelligenceAPI.getCustomerSegments()
      
      const transformedSegments = response.map((segment: { segment_id: any; ShopName: any; recency_score: any; frequency_score: any; monetary_score: any; rfm_score: any; segment_name: any }) => ({
        segment_id: segment.segment_id,
        shopName: segment.ShopName,
        recencyScore: segment.recency_score,
        frequencyScore: segment.frequency_score,
        monetaryScore: segment.monetary_score,
        rfmScore: segment.rfm_score,
        segmentName: segment.segment_name
      }))
      
      setCustomerSegments(transformedSegments)
    } catch (err) {
      console.error("Error fetching customer segments:", err)
      toast.error("Failed to load customer segments")
    } finally {
      setLoading((prev) => ({ ...prev, segments: false }))
    }
  }

  const fetchProductRecommendations = async (shopId: number) => {
    try {
      setLoading((prev) => ({ ...prev, recommendations: true }))

      const response = await businessIntelligenceAPI.getProductRecommendations(shopId)
      setProductRecommendations(response)
    } catch (err) {
      console.error("Error fetching product recommendations:", err)
      toast.error("Failed to load product recommendations")
    } finally {
      setLoading((prev) => ({ ...prev, recommendations: false }))
    }
  }

  const generateDemoSalesForecast = () => {
    const product = products.find((p) => p.product_id.toString() === selectedProduct)
    const productName = product ? product.name : "Product"

    const today = new Date()
    const forecasts = []

    for (let i = 1; i <= 12; i++) {
      const forecastDate = new Date(today)
      forecastDate.setMonth(today.getMonth() + i)

      const baseQuantity = Math.floor(Math.random() * 100) + 50
      const seasonalFactor = 1 + 0.2 * Math.sin((i / 12) * 2 * Math.PI)
      const trendFactor = 1 + i / 24
      const randomFactor = 0.9 + Math.random() * 0.2

      const predictedQuantity = Math.floor(baseQuantity * seasonalFactor * trendFactor * randomFactor)
      const confidenceLevel = 0.95 - i * 0.02

      forecasts.push({
        productName,
        forecastDate: forecastDate.toISOString().split("T")[0],
        predictedQuantity,
        confidenceLevel,
      })
    }

    return forecasts
  }

  const generateDemoProductAssociations = () => {
    const associations = []
    const numAssociations = Math.min(15, (products.length * (products.length - 1)) / 2)

    for (let i = 0; i < numAssociations; i++) {
      const idx1 = Math.floor(Math.random() * products.length)
      let idx2 = Math.floor(Math.random() * products.length)
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * products.length)
      }

      const Product1 = products[idx1]
      const Product2 = products[idx2]

      const support = 0.01 + Math.random() * 0.2
      const confidence = 0.2 + Math.random() * 0.6
      const lift = 0.5 + Math.random() * 2.5

      associations.push({
        association_id: i + 1,
        Product1: Product1.name,
        Product2: Product2.name,
        support,
        confidence,
        lift,
        relationship: lift > 1 ? "Complementary" : lift < 1 ? "Substitute" : "Independent",
      })
    }

    return associations.sort((a, b) => b.lift - a.lift)
  }

  const generateDemoCustomerSegments = () => {
    const segments = []
    const segmentNames = [
      "Champions",
      "Loyal Customers",
      "Recent Customers",
      "Promising",
      "Customers Needing Attention",
      "At Risk",
      "Can't Lose Them",
      "Hibernating",
      "Lost",
      "Other",
    ]

    for (let i = 0; i < shops.length; i++) {
      const shop = shops[i]
      const segmentIndex = i % segmentNames.length
      const segmentName = segmentNames[segmentIndex]

      let recencyScore, frequencyScore, monetaryScore

      switch (segmentName) {
        case "Champions":
          recencyScore = 4 + Math.floor(Math.random() * 2)
          frequencyScore = 4 + Math.floor(Math.random() * 2)
          monetaryScore = 4 + Math.floor(Math.random() * 2)
          break
        case "Loyal Customers":
          recencyScore = 3 + Math.floor(Math.random() * 3)
          frequencyScore = 3 + Math.floor(Math.random() * 3)
          monetaryScore = 3 + Math.floor(Math.random() * 3)
          break
        case "Recent Customers":
          recencyScore = 4 + Math.floor(Math.random() * 2)
          frequencyScore = 1 + Math.floor(Math.random() * 3)
          monetaryScore = 1 + Math.floor(Math.random() * 3)
          break
        case "At Risk":
          recencyScore = 1 + Math.floor(Math.random() * 2)
          frequencyScore = 4 + Math.floor(Math.random() * 2)
          monetaryScore = 4 + Math.floor(Math.random() * 2)
          break
        case "Lost":
          recencyScore = 1 + Math.floor(Math.random() * 2)
          frequencyScore = 1 + Math.floor(Math.random() * 2)
          monetaryScore = 1 + Math.floor(Math.random() * 2)
          break
        default:
          recencyScore = 1 + Math.floor(Math.random() * 5)
          frequencyScore = 1 + Math.floor(Math.random() * 5)
          monetaryScore = 1 + Math.floor(Math.random() * 5)
      }

      const rfmScore = recencyScore * 100 + frequencyScore * 10 + monetaryScore

      segments.push({
        segment_id: i + 1,
        shopName: shop.name,
        recencyScore,
        frequencyScore,
        monetaryScore,
        rfmScore,
        segmentName,
      })
    }

    return segments
  }

  const generateDemoProductRecommendations = () => {
    const recommendations = []
    
    if (!shops || !Array.isArray(shops) || shops.length === 0) {
      return []
    }
    
    const shopName = shops?.find(s => s.shop_id.toString() === selectedShop)?.name || "Unknown Shop"

    const numRecommendations = 5 + Math.floor(Math.random() * 6)

    const reasons = [
      "Frequently bought with products you purchased",
      "Popular in categories you shop",
      "New product from suppliers you trust",
      "Trending in your area",
      "Seasonal recommendation",
    ]

    for (let i = 0; i < numRecommendations; i++) {
      const productIndex = Math.floor(Math.random() * products.length)
      const product = products[productIndex]

      const score = 0.5 + Math.random() * 0.5
      const reasonIndex = Math.floor(Math.random() * reasons.length)

      recommendations.push({
        recommendation_id: i + 1,
        shopName,
        productName: product.name,
        description: product.description || "Product description",
        price: product.price || 5 + Math.random() * 20,
        supplierName: product.supplier_name || "Supplier",
        score,
        reason: reasons[reasonIndex],
      })
    }

    return recommendations.sort((a, b) => b.score - a.score)
  }

  // If no real data, use demo data
  if (products.length === 0 && !loading.products) {
    const demoProducts = [
      { product_id: 1, name: "Premium Coffee Beans", price: 12.99 },
      { product_id: 2, name: "Organic Green Tea", price: 8.5 },
      { product_id: 3, name: "Artisanal Chocolate Bar", price: 4.99 },
      { product_id: 4, name: "Gourmet Pasta", price: 6.75 },
      { product_id: 5, name: "Extra Virgin Olive Oil", price: 15.99 },
      { product_id: 6, name: "Aged Balsamic Vinegar", price: 18.5 },
      { product_id: 7, name: "Specialty Honey", price: 9.99 },
      { product_id: 8, name: "Truffle Salt", price: 14.5 },
    ]
    setProducts(demoProducts)
    setSelectedProduct("1")
  }

  if (shops.length === 0 && !loading.shops) {
    const demoShops = [
      { shop_id: 1, name: "Downtown Mart" },
      { shop_id: 2, name: "West Side Shop" },
      { shop_id: 3, name: "Windy City Store" },
      { shop_id: 4, name: "Gulf Coast Outlet" },
      { shop_id: 5, name: "Desert Trading Co" },
    ]
    setShops(demoShops)
    setSelectedShop("1")
  }

  // Use demo data if no real data is available
  const forecasts = salesForecasts.length > 0 ? salesForecasts : generateDemoSalesForecast()
  const associations = productAssociations.length > 0 ? productAssociations : generateDemoProductAssociations()
  const segments = customerSegments.length > 0 ? customerSegments : generateDemoCustomerSegments()
  const recommendations = productRecommendations.length > 0 ? productRecommendations : generateDemoProductRecommendations()

  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Business Intelligence Dashboard</h2>
            <p className="text-muted-foreground">Advanced analytics and insights for your business</p>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <Tabs defaultValue="forecasting" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forecasting">Sales Forecasting</TabsTrigger>
              <TabsTrigger value="associations">Market Basket Analysis</TabsTrigger>
              <TabsTrigger value="segmentation">Customer Segmentation</TabsTrigger>
              <TabsTrigger value="recommendations">Product Recommendations</TabsTrigger>
            </TabsList>

            {/* Sales Forecasting Tab */}
            <TabsContent value="forecasting" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Sales Forecast</CardTitle>
                      <CardDescription>
                        Predicted sales for the selected time interval
                      </CardDescription>
                    </div>
                    <div className="flex gap-4">
                      {/* Product Selection */}
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.product_id} value={product.product_id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Interval Type Selection */}
                      <Select value={selectedInterval} onValueChange={setSelectedInterval}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Monthly</SelectItem>
                          <SelectItem value="minute">Minutes</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Minutes Selection (only show when interval is 'minute') */}
                      {selectedInterval === 'minute' && (
                        <Select value={selectedMinutes} onValueChange={setSelectedMinutes}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Minutes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 min</SelectItem>
                            <SelectItem value="5">5 min</SelectItem>
                            <SelectItem value="10">10 min</SelectItem>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">60 min</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-96">
                  {loading.forecasts ? (
                    <p className="text-center py-10">Loading forecast data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={forecasts}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
  dataKey="forecastDate"
  angle={-45}
  textAnchor="end"
  height={70}
  tickFormatter={(dateStr) => {
    const date = new Date(dateStr);
    if (selectedInterval === 'minute') {
      return date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString(undefined, { 
        month: "short", 
        year: "2-digit" 
      });
    }
  }}
/>

                        <YAxis />
                        <Tooltip
  formatter={(value) => [`${value} units`, "Predicted Quantity"]}
  labelFormatter={(dateStr) => {
    const date = new Date(dateStr);
    if (selectedInterval === 'minute') {
      return date.toLocaleString();
    } else {
      return date.toLocaleDateString(undefined, { 
        month: "long", 
        day: "numeric", 
        year: "numeric" 
      });
    }
  }}
/>

                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="predictedQuantity"
                          name="Predicted Sales"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Forecast Confidence</CardTitle>
                  <CardDescription>Confidence level decreases over time</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {loading.forecasts ? (
                    <p className="text-center py-10">Loading confidence data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={forecasts}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="forecastDate"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString(undefined, { month: "short", year: "2-digit" })
                          }
                        />
                        <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                        <Tooltip
                          formatter={(value) => [`${(value * 100).toFixed(1)}%`, "Confidence Level"]}
                          labelFormatter={(dateStr) => {
                            const date = new Date(dateStr);
                            return date.toLocaleDateString();
                          }}
                        />
                        <Legend />
                        <Bar dataKey="confidenceLevel" name="Confidence Level" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Market Basket Analysis Tab */}
            <TabsContent value="associations" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Associations</CardTitle>
                  <CardDescription>Products frequently purchased together</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  {loading.associations ? (
                    <p className="text-center py-10">Loading association data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 10,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey="support"
                          name="Support"
                          domain={[0, Math.max(...associations.map((a) => a.support)) * 1.1]}
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        />
                        <YAxis
                          type="number"
                          dataKey="confidence"
                          name="Confidence"
                          domain={[0, Math.max(...associations.map((a) => a.confidence)) * 1.1]}
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        />
                        <ZAxis type="number" dataKey="lift" range={[50, 400]} name="Lift" />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "Support" || name === "Confidence") {
                              return [`${(value * 100).toFixed(1)}%`, name]
                            }
                            return [value.toFixed(2), name]
                          }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white p-3 border rounded shadow-sm">
                                  <p className="font-bold">{`${data.product1} → ${data.product2}`}</p>
                                  <p>{`Support: ${(data.support * 100).toFixed(1)}%`}</p>
                                  <p>{`Confidence: ${(data.confidence * 100).toFixed(1)}%`}</p>
                                  <p>{`Lift: ${data.lift.toFixed(2)}`}</p>
                                  <p>{`Relationship: ${data.relationship}`}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend />
                        <Scatter name="Product Associations" data={associations} fill="#8884d8" shape="circle" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Top Product Associations</CardTitle>
                  <CardDescription>Strongest relationships between products</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.associations ? (
                    <p className="text-center py-10">Loading association data...</p>
                  ) : (
                    <div className="rounded-md border">
                      <div className="w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <th className="h-12 px-4 text-left align-middle font-medium">Product Pair</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Support</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Confidence</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Lift</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Relationship</th>
                            </tr>
                          </thead>
                          <tbody className="[&_tr:last-child]:border-0">
                            {associations.slice(0, 10).map((association) => (
                              <tr
                                key={association.association_id}
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              >
                                <td className="p-4 align-middle">{`${association.product1} → ${association.product2}`}</td>
                                <td className="p-4 align-middle">{`${(association.support * 100).toFixed(1)}%`}</td>
                                <td className="p-4 align-middle">{`${(association.confidence * 100).toFixed(1)}%`}</td>
                                <td className="p-4 align-middle">{association.lift.toFixed(2)}</td>
                                <td className="p-4 align-middle">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      association.relationship === "Complementary"
                                        ? "bg-green-100 text-green-800"
                                        : association.relationship === "Substitute"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {association.relationship}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customer Segmentation Tab */}
            <TabsContent value="segmentation" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Segments</CardTitle>
                  <CardDescription>RFM analysis of your customer base</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  {loading.segments ? (
                    <p className="text-center py-10">Loading segmentation data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            segments.reduce(
                              (acc, segment) => {
                                acc[segment.segmentName] = (acc[segment.segmentName] || 0) + 1
                                return acc
                              },
                              {} as Record<string, number>,
                            ),
                          ).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(
                            segments.reduce(
                              (acc, segment) => {
                                acc[segment.segmentName] = (acc[segment.segmentName] || 0) + 1
                                return acc
                              },
                              {} as Record<string, number>,
                            ),
                          ).map(([name], index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={(SEGMENT_COLORS as Record<string, string>)[name] || COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>RFM Analysis</CardTitle>
                  <CardDescription>Recency, Frequency, and Monetary value by segment</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {loading.segments ? (
                    <p className="text-center py-10">Loading RFM data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(
                          segments.reduce(
                            (acc, segment) => {
                              if (!acc[segment.segmentName]) {
                                acc[segment.segmentName] = {
                                  name: segment.segmentName,
                                  recency: 0,
                                  frequency: 0,
                                  monetary: 0,
                                  count: 0,
                                }
                              }
                              acc[segment.segmentName].recency += segment.recencyScore
                              acc[segment.segmentName].frequency += segment.frequencyScore
                              acc[segment.segmentName].monetary += segment.monetaryScore
                              acc[segment.segmentName].count += 1
                              return acc
                            },
                            {} as Record<string, any>,
                          ),
                        )
                          .map(([name, data]) => ({
                            name,
                            recency: data.recency / data.count,
                            frequency: data.frequency / data.count,
                            monetary: data.monetary / data.count,
                          }))
                          .sort((a, b) => {
                            const scoreA = a.recency + a.frequency + a.monetary
                            const scoreB = b.recency + b.frequency + b.monetary
                            return scoreB - scoreA
                          })}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 30,
                          left: 120,
                          bottom: 10,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 5]} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="recency" name="Recency" fill="#8884d8" />
                        <Bar dataKey="frequency" name="Frequency" fill="#82ca9d" />
                        <Bar dataKey="monetary" name="Monetary" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Product Recommendations Tab */}
            <TabsContent value="recommendations" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Product Recommendations</CardTitle>
                      <CardDescription>Personalized recommendations for each shop</CardDescription>
                    </div>
                    <Select value={selectedShop} onValueChange={setSelectedShop}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a shop" />
                      </SelectTrigger>
                      <SelectContent>
                        {shops.map((shop) => (
                          <SelectItem key={shop.shop_id} value={shop.shop_id.toString()}>
                            {shop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading.recommendations ? (
                    <p className="text-center py-10">Loading recommendation data...</p>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map((recommendation) => (
                        <div
                          key={recommendation.recommendation_id}
                          className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg"
                        >
                          <div className="md:w-1/4">
                            <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-500">Product Image</span>
                            </div>
                          </div>
                          <div className="md:w-3/4">
                            <h3 className="text-lg font-semibold">{recommendation.productName}</h3>
                            <p className="text-sm text-gray-500 mb-2">{recommendation.description}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                ${recommendation.price.toFixed(2)}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                {recommendation.supplierName}
                              </span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                Score: {(recommendation.score * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-sm italic">{recommendation.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Recommendation Scores</CardTitle>
                  <CardDescription>Relevance scores for recommended products</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {loading.recommendations ? (
                    <p className="text-center py-10">Loading recommendation data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={recommendations
                          .slice()
                          .sort((a, b) => b.score - a.score)
                          .map((rec) => ({
                            name: rec.productName,
                            score: rec.score,
                          }))}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                        <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, "Relevance Score"]} />
                        <Legend />
                        <Bar dataKey="score" name="Relevance Score" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
