"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { orderAPI } from "@/lib/api"
import { toast } from "sonner"
import { Search } from "lucide-react"

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

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [supplierName, setSupplierName] = useState<string>("Global Goods Inc.")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the logged-in user name
        const storedUserName = localStorage.getItem("userName")
        if (storedUserName) {
          setSupplierName(storedUserName)
        }

        console.log("Fetching all orders data")

        // Fetch all orders
        const allOrders = await orderAPI.getSummaries()
        console.log("All orders:", allOrders)

        // Set all orders
        setOrders(allOrders)
        setFilteredOrders(allOrders)
      } catch (error) {
        console.error("Error fetching orders data:", error)
        toast.error("Failed to load orders data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter orders based on search query and status
  useEffect(() => {
    let filtered = [...orders]

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.order_id.toString().includes(query) ||
          order.AgentName.toLowerCase().includes(query) ||
          order.ShopName.toLowerCase().includes(query) ||
          order.SalesRepName.toLowerCase().includes(query),
      )
    }

    setFilteredOrders(filtered)
  }, [searchQuery, statusFilter, orders])

  // If no real data, create demo data
  useEffect(() => {
    if (orders.length === 0 && !loading) {
      // Create demo orders
      const demoOrders = [
        {
          order_id: 1001,
          agent_id: 1,
          AgentName: "John Smith",
          ShopName: "Downtown Mart",
          SalesRepName: "Alex Johnson",
          PaymentMethod: "Credit Card",
          PaymentAmount: 250.75,
          status: "Delivered",
          TotalItems: 3,
          TotalQuantity: 15,
          TotalOrderValue: 250.75,
          OrderDate: "2025-01-15",
        },
        {
          order_id: 1002,
          agent_id: 2,
          AgentName: "Maria Garcia",
          ShopName: "West Side Shop",
          SalesRepName: "Sophia Martinez",
          PaymentMethod: "Bank Transfer",
          PaymentAmount: 500.0,
          status: "Shipped",
          TotalItems: 2,
          TotalQuantity: 20,
          TotalOrderValue: 500.0,
          OrderDate: "2025-01-20",
        },
        {
          order_id: 1003,
          agent_id: 3,
          AgentName: "David Johnson",
          ShopName: "Windy City Store",
          SalesRepName: "Thomas Wilson",
          PaymentMethod: "PayPal",
          PaymentAmount: 175.5,
          status: "Processing",
          TotalItems: 1,
          TotalQuantity: 10,
          TotalOrderValue: 175.5,
          OrderDate: "2025-02-03",
        },
        {
          order_id: 1004,
          agent_id: 1,
          AgentName: "John Smith",
          ShopName: "Central Market",
          SalesRepName: "Alex Johnson",
          PaymentMethod: "Credit Card",
          PaymentAmount: 320.25,
          status: "Delivered",
          TotalItems: 4,
          TotalQuantity: 18,
          TotalOrderValue: 320.25,
          OrderDate: "2025-02-10",
        },
        {
          order_id: 1005,
          agent_id: 4,
          AgentName: "Sarah Williams",
          ShopName: "Eastside Grocery",
          SalesRepName: "Michael Brown",
          PaymentMethod: "Bank Transfer",
          PaymentAmount: 150.0,
          status: "Cancelled",
          TotalItems: 2,
          TotalQuantity: 8,
          TotalOrderValue: 150.0,
          OrderDate: "2025-02-15",
        },
      ]

      setOrders(demoOrders)
      setFilteredOrders(demoOrders)
    }
  }, [orders, loading])

  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">Showing all orders for {supplierName}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View all orders containing your products</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading orders...</p>
            ) : filteredOrders.length > 0 ? (
              <div className="rounded-md border">
                <div className="w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Order ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Agent</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Shop</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Sales Rep</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.order_id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">{order.order_id}</td>
                          <td className="p-4 align-middle">{order.AgentName}</td>
                          <td className="p-4 align-middle">{order.ShopName}</td>
                          <td className="p-4 align-middle">{order.SalesRepName}</td>
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
              <p>No orders found. Try adjusting your search criteria.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
