"use client"

import { useEffect, useState } from "react"
import { BarChart, LineChart, PieChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { productAPI, orderAPI } from "@/lib/api"
import { toast } from "sonner"
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Update interface to match the actual API response
interface ProductSalesAnalysis {
  product_id: number
  ProductName: string
  SupplierName: string
  TotalQuantitySold: number
  TotalRevenue: number
  NumberOfOrders: number
  NumberOfShops: number
}

interface OrderSummary {
  order_id: number
  agent_id: number
  AgentName: string
  ShopName: string
  SalesRepName: string
  PaymentMethod: string
  PaymentAmount: number
  status: string
  TotalItems: number
  TotalQuantity: number
  TotalOrderValue: number
  OrderDate: string
}

interface Product {
  product_id: number
  supplier_id: number
  name: string
  description: string
  price: number
  supplier_name?: string
}

interface PriceHistory {
  history_id: number
  product_id: number
  product_name: string
  old_price: number
  new_price: number
  change_date: string
}

interface PriceHistoryPoint {
  date: string
  price: number
  product_name: string
  product_id: number
}

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function SupplierDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supplierName, setSupplierName] = useState<string>("Global Goods Inc.")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedProductId, setSelectedProductId] = useState<string>("all")
  const [priceHistoryData, setPriceHistoryData] = useState<PriceHistoryPoint[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the logged-in user name
        const storedUserName = localStorage.getItem("userName")
        if (storedUserName) {
          setSupplierName(storedUserName)
        }

        console.log("Fetching all products, orders, and price history data")

        // Fetch all products, orders, and price history
        const [allProducts, allOrders, allPriceHistory] = await Promise.all([
          productAPI.getAll(),
          orderAPI.getSummaries(),
          productAPI.getPriceHistory(),
        ])

        console.log("All products:", allProducts)
        console.log("All orders:", allOrders)
        console.log("All price history:", allPriceHistory)

        // Set all products, orders, and price history
        setProducts(allProducts)
        setOrders(allOrders)
        setPriceHistory(allPriceHistory)

        // Process price history data
        const processedData = preparePriceHistoryData(allPriceHistory, allProducts)
        setPriceHistoryData(processedData)

        // Set the first product as selected by default if products exist
        if (allProducts.length > 0) {
          setSelectedProductId(allProducts[0].product_id.toString())
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error instanceof Error ? error.message : "Failed to load dashboard data")
        toast.error("Failed to load dashboard data", {
          description: "Please check your connection and try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate product analysis data from products and orders
  const productAnalysis = products.map((product) => {
    // Find orders for this product (in a real app, you'd have order items)
    // For demo, we'll assume each order has one product
    const productOrders = orders.filter((_, index) => index % products.length === product.product_id % products.length)

    // Calculate metrics
    const totalQuantitySold = productOrders.reduce((sum, order) => sum + (order.TotalQuantity || 0), 0)
    const totalRevenue = productOrders.reduce((sum, order) => sum + (order.TotalOrderValue || 0), 0)

    // Get unique shops
    const uniqueShops = new Set(productOrders.map((order) => order.ShopName))

    return {
      product_id: product.product_id,
      ProductName: product.name,
      SupplierName: product.supplier_name || supplierName,
      TotalQuantitySold: totalQuantitySold,
      TotalRevenue: totalRevenue,
      NumberOfOrders: productOrders.length,
      NumberOfShops: uniqueShops.size,
    }
  })

  // Safely calculate metrics with null checks
  const totalProducts = products?.length || 0

  const totalRevenue = productAnalysis.reduce((sum, product) => {
    const revenue = typeof product?.TotalRevenue === "number" ? product.TotalRevenue : 0
    return sum + revenue
  }, 0)

  const totalQuantitySold = productAnalysis.reduce((sum, product) => {
    const quantity = typeof product?.TotalQuantitySold === "number" ? product.TotalQuantitySold : 0
    return sum + quantity
  }, 0)

  // Get unique shops across all products
  const uniqueShops = new Set()
  productAnalysis.forEach((product) => {
    // In a real app, you'd have the actual shop IDs
    // For demo, we'll use the NumberOfShops as a proxy
    for (let i = 0; i < product.NumberOfShops; i++) {
      uniqueShops.add(`Shop-${product.product_id}-${i}`)
    }
  })
  const totalShops = uniqueShops.size

  // Format numbers safely
  const formatNumber = (num: number): string => {
    try {
      return num.toFixed(2)
    } catch (error) {
      console.error("Error formatting number:", error)
      return "0.00"
    }
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Prepare data for revenue chart
  const revenueChartData = productAnalysis.map((product) => ({
    name: product.ProductName,
    revenue: product.TotalRevenue,
  }))

  // Prepare data for quantity sold chart
  const quantityChartData = productAnalysis.map((product) => ({
    name: product.ProductName,
    quantity: product.TotalQuantitySold,
  }))

  // Prepare data for pie chart
  const pieChartData = productAnalysis.map((product) => ({
    name: product.ProductName,
    value: product.TotalRevenue,
  }))

  // Prepare data for price history chart
  const preparePriceHistoryData = (priceHistoryData: PriceHistory[], productsData: Product[]): PriceHistoryPoint[] => {
    // Group price history by product
    const productHistories: { [key: number]: PriceHistoryPoint[] } = {}

    // If no real data, create demo data
    if (priceHistoryData.length === 0) {
      // Create demo price history data
      const demoProducts =
        productsData.length > 0
          ? productsData
          : [
              { product_id: 1, name: "Premium Coffee Beans", price: 12.99, supplier_id: 1, description: "" },
              { product_id: 2, name: "Organic Green Tea", price: 8.5, supplier_id: 1, description: "" },
              { product_id: 3, name: "Artisanal Chocolate Bar", price: 4.99, supplier_id: 1, description: "" },
            ]

      const today = new Date()

      demoProducts.forEach((product) => {
        const history = []
        let price = 10 + Math.random() * 20

        // Generate 6 price points over the last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today)
          date.setMonth(date.getMonth() - i)

          const oldPrice = price
          // Random price change between -2 and +5
          price = price + (Math.random() * 7 - 2)
          price = Math.max(5, Math.round(price * 100) / 100) // Ensure price doesn't go below 5

          history.push({
            date: date.toISOString().split("T")[0],
            price: price,
            product_name: product.name,
            product_id: product.product_id,
          })
        }

        productHistories[product.product_id] = history
      })
    } else {
      // Process real data
      priceHistoryData.forEach((record) => {
        if (!productHistories[record.product_id]) {
          productHistories[record.product_id] = []
        }

        // Add the initial price point if this is the first record
        if (productHistories[record.product_id].length === 0) {
          productHistories[record.product_id].push({
            date: new Date(new Date(record.change_date).getTime() - 86400000).toISOString().split("T")[0], // 1 day before
            price: record.old_price,
            product_name: record.product_name,
            product_id: record.product_id,
          })
        }

        // Add the new price point
        productHistories[record.product_id].push({
          date: record.change_date.split("T")[0],
          price: record.new_price,
          product_name: record.product_name,
          product_id: record.product_id,
        })
      })
    }

    // Flatten the data for the chart
    const chartData: PriceHistoryPoint[] = []
    Object.keys(productHistories).forEach((productId) => {
      productHistories[Number(productId)].forEach((record) => {
        chartData.push(record)
      })
    })

    return chartData
  }

  // Handle product selection change
  const handleProductChange = (value: string) => {
    setSelectedProductId(value)
  }

  // Filter price history data based on selected product
  const getFilteredPriceHistoryData = () => {
    if (selectedProductId === "all") {
      return priceHistoryData
    }
    return priceHistoryData.filter((item) => item.product_id.toString() === selectedProductId)
  }

  // Get the color for the selected product
  const getProductColor = () => {
    if (selectedProductId === "all") {
      return COLORS[0]
    }
    const productIndex = products.findIndex((p) => p.product_id.toString() === selectedProductId)
    return COLORS[productIndex % COLORS.length]
  }

  // Get the name of the selected product
  const getSelectedProductName = () => {
    if (selectedProductId === "all") {
      return "All Products"
    }
    const product = products.find((p) => p.product_id.toString() === selectedProductId)
    return product ? product.name : "Unknown Product"
  }

  // If there's no real data, use demo data
  if (products.length === 0 && !loading && !error) {
    // Create demo products
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

    // Create demo revenue and quantity data
    const demoRevenueData = demoProducts.map((product) => ({
      name: product.name,
      revenue: Math.floor(Math.random() * 1000) + 500,
    }))

    const demoQuantityData = demoProducts.map((product) => ({
      name: product.name,
      quantity: Math.floor(Math.random() * 100) + 50,
    }))

    const demoPieData = demoProducts.map((product) => ({
      name: product.name,
      value: Math.floor(Math.random() * 1000) + 500,
    }))

    // Create demo price history data
    const demoPriceHistoryData: PriceHistoryPoint[] = []
    const today = new Date()

    demoProducts.forEach((product) => {
      let price = product.price

      // Generate 6 price points over the last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today)
        date.setMonth(date.getMonth() - i)

        // Random price change between -2 and +5
        price = price + (Math.random() * 7 - 2)
        price = Math.max(5, Math.round(price * 100) / 100) // Ensure price doesn't go below 5

        demoPriceHistoryData.push({
          date: date.toISOString().split("T")[0],
          price: price,
          product_name: product.name,
          product_id: product.product_id,
        })
      }
    })

    // Filter demo price history data based on selected product
    const filteredDemoPriceHistoryData =
      selectedProductId === "all"
        ? demoPriceHistoryData
        : demoPriceHistoryData.filter((item) => item.product_id.toString() === selectedProductId)

    // Use the demo data
    return (
      <DashboardLayout role="supplier">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h2>
              <p className="text-muted-foreground">Welcome, {supplierName}</p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="units">Units Sold</TabsTrigger>
              <TabsTrigger value="price-history">Price History</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{demoProducts.length}</div>
                    <p className="text-xs text-muted-foreground">Your active products</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${formatNumber(demoRevenueData.reduce((sum, item) => sum + item.revenue, 0))}
                    </div>
                    <p className="text-xs text-muted-foreground">Your revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {demoQuantityData.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Your units sold</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shops Reached</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.floor(Math.random() * 20) + 10}</div>
                    <p className="text-xs text-muted-foreground">Shops selling your products</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Percentage of revenue by product</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={demoPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {demoPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Product</CardTitle>
                  <CardDescription>Comparison of revenue across your products</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={demoRevenueData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue ($)" fill="#0088FE" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="units" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Units Sold by Product</CardTitle>
                  <CardDescription>Comparison of units sold across your products</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={demoQuantityData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" name="Units Sold" fill="#00C49F" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="price-history" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Product Price History</CardTitle>
                      <CardDescription>Track price changes over time</CardDescription>
                    </div>
                    <Select value={selectedProductId} onValueChange={handleProductChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {demoProducts.map((product) => (
                          <SelectItem key={product.product_id} value={product.product_id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={filteredDemoPriceHistoryData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString(undefined, { month: "short", year: "2-digit" })
                        }
                      />
                      <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                      <Tooltip
                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Legend />
                      {selectedProductId === "all" ? (
                        demoProducts.map((product, index) => (
                          <Line
                            key={product.product_id}
                            type="monotone"
                            dataKey="price"
                            name={product.name}
                            stroke={COLORS[index % COLORS.length]}
                            activeDot={{ r: 8 }}
                            connectNulls
                            data={filteredDemoPriceHistoryData.filter((item) => item.product_id === product.product_id)}
                          />
                        ))
                      ) : (
                        <Line
                          type="monotone"
                          dataKey="price"
                          name={
                            demoProducts.find((p) => p.product_id.toString() === selectedProductId)?.name ||
                            "Unknown Product"
                          }
                          stroke={
                            COLORS[
                              demoProducts.findIndex((p) => p.product_id.toString() === selectedProductId) %
                                COLORS.length
                            ]
                          }
                          activeDot={{ r: 8 }}
                          connectNulls
                        />
                      )}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Sales analysis for your products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium">Product</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Units Sold</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Revenue</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Orders</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Shops</th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                          {demoProducts.map((product, index) => {
                            const revenue = demoRevenueData[index].revenue
                            const quantity = demoQuantityData[index].quantity
                            const orders = Math.floor(quantity / 5)
                            const shops = Math.floor(Math.random() * 5) + 1

                            return (
                              <tr
                                key={product.product_id}
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              >
                                <td className="p-4 align-middle">{product.name}</td>
                                <td className="p-4 align-middle">{quantity}</td>
                                <td className="p-4 align-middle">${formatNumber(revenue)}</td>
                                <td className="p-4 align-middle">{orders}</td>
                                <td className="p-4 align-middle">{shops}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    )
  }

  // Filter price history data based on selected product
  const filteredPriceHistoryData = getFilteredPriceHistoryData()

  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h2>
            <p className="text-muted-foreground">Showing data for {supplierName}</p>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="units">Units Sold</TabsTrigger>
              <TabsTrigger value="price-history">Price History</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                    <p className="text-xs text-muted-foreground">Your active products</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${formatNumber(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">Your revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalQuantitySold}</div>
                    <p className="text-xs text-muted-foreground">Your units sold</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shops Reached</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalShops}</div>
                    <p className="text-xs text-muted-foreground">Shops selling your products</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Percentage of revenue by product</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {loading ? (
                    <p>Loading chart data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Product</CardTitle>
                  <CardDescription>Comparison of revenue across your products</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {loading ? (
                    <p>Loading chart data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={revenueChartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue ($)" fill="#0088FE" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="units" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Units Sold by Product</CardTitle>
                  <CardDescription>Comparison of units sold across your products</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {loading ? (
                    <p>Loading chart data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={quantityChartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantity" name="Units Sold" fill="#00C49F" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="price-history" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle>Product Price History</CardTitle>
                      <CardDescription>Track price changes over time</CardDescription>
                    </div>
                    <Select value={selectedProductId} onValueChange={handleProductChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.product_id} value={product.product_id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  {loading ? (
                    <p>Loading price history data...</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          type="category"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString(undefined, { month: "short", year: "2-digit" })
                          }
                        />
                        <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                        <Tooltip
                          formatter={(value) => `$${Number(value).toFixed(2)}`}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Legend />
                        {selectedProductId === "all" ? (
                          products.map((product, index) => (
                            <Line
                              key={product.product_id}
                              type="monotone"
                              dataKey="price"
                              name={product.name}
                              stroke={COLORS[index % COLORS.length]}
                              activeDot={{ r: 8 }}
                              connectNulls
                              data={filteredPriceHistoryData.filter((item) => item.product_id === product.product_id)}
                            />
                          ))
                        ) : (
                          <Line
                            type="monotone"
                            dataKey="price"
                            name={getSelectedProductName()}
                            stroke={getProductColor()}
                            activeDot={{ r: 8 }}
                            connectNulls
                            data={filteredPriceHistoryData}
                          />
                        )}
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Sales analysis for your products</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading product data...</p>
                  ) : productAnalysis.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <th className="h-12 px-4 text-left align-middle font-medium">Product</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Units Sold</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Revenue</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Orders</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Shops</th>
                            </tr>
                          </thead>
                          <tbody className="[&_tr:last-child]:border-0">
                            {productAnalysis.map((product) => (
                              <tr
                                key={product.product_id}
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              >
                                <td className="p-4 align-middle">{product.ProductName}</td>
                                <td className="p-4 align-middle">{product.TotalQuantitySold}</td>
                                <td className="p-4 align-middle">${formatNumber(product.TotalRevenue)}</td>
                                <td className="p-4 align-middle">{product.NumberOfOrders}</td>
                                <td className="p-4 align-middle">{product.NumberOfShops}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p>No product data found.</p>
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
