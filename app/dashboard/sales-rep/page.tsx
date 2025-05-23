"use client"

import { useEffect, useState } from "react"
import { BarChart, LineChart, PieChart, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { orderAPI, userAPI } from "@/lib/api"
import { toast } from "sonner"

interface OrderSummary {
  order_id: number
  agent_id: number
  sales_rep_id?: number
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

interface Shop {
  shop_id: number
  name: string
  address: string
  phone_number: string
  sales_rep_id: number
  sales_rep_name?: string
}

export default function SalesRepDashboard() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // Get the logged-in user ID and name
    const storedUserId = localStorage.getItem("userId")
    const storedUserName = localStorage.getItem("userName")
    setUserId(storedUserId)
    setUserName(storedUserName)

    const fetchData = async () => {
      if (!storedUserId) {
        console.error("No user ID found")
        return
      }

      const salesRepId = Number.parseInt(storedUserId)

      try {
        console.log("Fetching sales rep dashboard data for ID:", salesRepId, "Name:", storedUserName)

        // Fetch all order summaries
        const allOrdersData = await orderAPI.getSummaries()
        console.log("All orders data:", allOrdersData)

        // Filter orders for this sales rep (by ID or name)
        const filteredOrders = allOrdersData.filter(
          (order: OrderSummary) =>
            order.sales_rep_id === salesRepId || (storedUserName && order.SalesRepName === storedUserName),
        )

        console.log("Filtered orders for sales rep:", filteredOrders)
        setOrders(filteredOrders)

        // Fetch shops directly using the sales rep ID
        const shopsData = await userAPI.getShopsBySalesRep(salesRepId)
        console.log("Shops data for sales rep:", shopsData)
        setShops(shopsData)

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
  const totalShops = shops.length

  return (
    <DashboardLayout role="sales-rep">
      <div className="flex flex-col gap-5">
        <h2 className="text-3xl font-bold tracking-tight">Sales Rep Dashboard</h2>
        <p className="text-muted-foreground">
          Showing data for {userName || "Unknown"} (ID: {userId || "Unknown"})
        </p>

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
              <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalShops}</div>
              <p className="text-xs text-muted-foreground">Active shops</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent-orders">
          <TabsList>
            <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="territory-shops">Territory Shops</TabsTrigger>
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
                            <th className="h-12 px-4 text-left align-middle font-medium">Agent</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Shop</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                          {orders.slice(0, 10).map((order) => (
                            <tr
                              key={order.order_id}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">{order.order_id}</td>
                              <td className="p-4 align-middle">{order.AgentName}</td>
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
                  <p>
                    No orders found for your territory. This could be because you're newly assigned or there's an issue with
                    the data.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="territory-shops" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shops in Your Territory</CardTitle>
                <CardDescription>Shops assigned to you as a sales representative</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading shop data...</p>
                ) : shops.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {shops.map((shop) => (
                      <div key={shop.shop_id} className="rounded-md border p-4">
                        <h3 className="font-medium">{shop.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>Address:</strong> {shop.address || "Not provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Phone:</strong> {shop.phone_number || "Not provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Orders:</strong> {orders.filter((o) => o.ShopName === shop.name).length}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No shops found in your territory.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
