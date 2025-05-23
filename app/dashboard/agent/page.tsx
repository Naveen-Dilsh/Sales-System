"use client"

import { useEffect, useState } from "react"
import { BarChart, LineChart, PieChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { orderAPI, inventoryAPI } from "@/lib/api"
import { toast } from "sonner"

// Update interface to match your actual API response
interface OrderSummary {
  order_id: number
  agent_id?: number
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

interface LowInventoryProduct {
  product_id: number
  agent_id?: number
  ProductName: string
  quantity: number
  AgentName: string
  SupplierName: string
}

export default function AgentDashboard() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [lowInventory, setLowInventory] = useState<LowInventoryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get the logged-in user ID
    const storedUserId = localStorage.getItem("userId")
    setUserId(storedUserId)

    const fetchData = async () => {
      if (!storedUserId) {
        console.error("No user ID found")
        return
      }

      const agentId = Number.parseInt(storedUserId)

      try {
        console.log("Fetching dashboard data for agent ID:", agentId)

        // Fetch all order summaries and filter on client side
        const allOrderData = await orderAPI.getSummaries()
        console.log("All order data:", allOrderData)

        // Filter orders for this agent
        const filteredOrders = allOrderData.filter(
          (order: OrderSummary) => order.agent_id === agentId || order.AgentName === localStorage.getItem("userName"),
        )
        console.log("Filtered orders:", filteredOrders)
        setOrders(filteredOrders)

        // Fetch all low inventory products and filter on client side
        const allInventoryData = await inventoryAPI.getLowInventory(100)
        console.log("All inventory data:", allInventoryData)

        // Filter inventory for this agent
        const filteredInventory = allInventoryData.filter(
          (item: LowInventoryProduct) =>
            item.agent_id === agentId || item.AgentName === localStorage.getItem("userName"),
        )
        console.log("Filtered inventory:", filteredInventory)
        setLowInventory(filteredInventory)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Failed to load dashboard data", {
          description: "Please check your connection and try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate dashboard metrics
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.TotalOrderValue, 0)
  const pendingOrders = orders.filter((order) => order.status === "Processing").length
  const lowStockItems = lowInventory.length

  return (
    <DashboardLayout role="agent">
      <div className="flex flex-col gap-5">
        <h2 className="text-3xl font-bold tracking-tight">Agent Dashboard</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">Your orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Your revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Orders awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Items below threshold</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent-orders">
          <TabsList>
            <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="low-inventory">Low Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="recent-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Overview of your most recent orders</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading orders...</p>
                ) : orders.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium">Order ID</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Shop</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                          {orders.slice(0, 5).map((order) => (
                            <tr
                              key={order.order_id}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">{order.order_id}</td>
                              <td className="p-4 align-middle">{order.ShopName}</td>
                              <td className="p-4 align-middle">{new Date(order.OrderDate).toLocaleDateString()}</td>
                              <td className="p-4 align-middle">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    order.status === "Delivered"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "Shipped"
                                        ? "bg-blue-100 text-blue-800"
                                        : order.status === "Processing"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-4 align-middle">${order.TotalOrderValue.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p>No orders found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low-inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Inventory Items</CardTitle>
                <CardDescription>Products that need to be restocked soon</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading inventory data...</p>
                ) : lowInventory.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium">Product</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Supplier</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Current Quantity</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                          {lowInventory.map((item) => (
                            <tr
                              key={item.product_id}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">{item.ProductName}</td>
                              <td className="p-4 align-middle">{item.SupplierName}</td>
                              <td className="p-4 align-middle">{item.quantity}</td>
                              <td className="p-4 align-middle">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    item.quantity <= 50 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {item.quantity <= 50 ? "Critical" : "Low"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p>No low inventory items found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
