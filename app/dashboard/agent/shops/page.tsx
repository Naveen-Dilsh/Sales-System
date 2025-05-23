"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "sonner"
import { Search } from "lucide-react"
import { orderAPI } from "@/lib/api"

interface Shop {
  shop_id: number
  name: string
  address: string
  phone_number: string
  orderCount?: number
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

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [agentId, setAgentId] = useState<number | null>(null)
  const [agentName, setAgentName] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the logged-in agent ID and name
        const storedAgentId = localStorage.getItem("userId")
        const storedAgentName = localStorage.getItem("userName")

        if (!storedAgentId) {
          console.error("No agent ID found")
          return
        }

        const parsedAgentId = Number.parseInt(storedAgentId)
        setAgentId(parsedAgentId)
        setAgentName(storedAgentName)

        console.log("Fetching shops data for agent ID:", parsedAgentId, "Name:", storedAgentName)

        // Fetch all orders
        const allOrdersData = await orderAPI.getSummaries()
        console.log("All orders data:", allOrdersData)

        // Filter orders for this agent
        const filteredOrders = allOrdersData.filter(
          (order: OrderSummary) =>
            order.agent_id === parsedAgentId || (storedAgentName && order.AgentName === storedAgentName),
        )
        console.log("Filtered orders for agent:", filteredOrders)

        // Extract unique shops from filtered orders
        const uniqueShops = new Map<string, Shop>()

        filteredOrders.forEach((order) => {
          if (order.ShopName) {
            if (!uniqueShops.has(order.ShopName)) {
              uniqueShops.set(order.ShopName, {
                shop_id: uniqueShops.size + 1,
                name: order.ShopName,
                address: "",
                phone_number: "",
                orderCount: 1,
              })
            } else {
              const shop = uniqueShops.get(order.ShopName)!
              shop.orderCount = (shop.orderCount || 0) + 1
            }
          }
        })

        const shopsArray = Array.from(uniqueShops.values())
        setShops(shopsArray)
        setFilteredShops(shopsArray)

        console.log("Shops for agent:", shopsArray)
      } catch (error) {
        console.error("Error fetching shops data:", error)
        toast.error("Failed to load shops data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter shops based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredShops(shops)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = shops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          (shop.address && shop.address.toLowerCase().includes(query)) ||
          (shop.phone_number && shop.phone_number.includes(query)),
      )
      setFilteredShops(filtered)
    }
  }, [searchQuery, shops])

  return (
    <DashboardLayout role="agent">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shops Directory</h2>
            <p className="text-muted-foreground">
              Showing shops for {agentName || "Unknown"} (ID: {agentId || "Unknown"})
            </p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search shops..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading shops...</p>
        ) : filteredShops.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <Card key={shop.shop_id}>
                <CardHeader>
                  <CardTitle>{shop.name}</CardTitle>
                  <CardDescription>Shop ID: {shop.shop_id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {shop.address && (
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-sm text-muted-foreground">{shop.address}</p>
                      </div>
                    )}
                    {shop.phone_number && (
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p className="text-sm text-muted-foreground">{shop.phone_number}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Orders:</span>
                      <p className="text-sm text-muted-foreground">{shop.orderCount || 0} orders placed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>No shops found for your account. Try creating some orders first.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
