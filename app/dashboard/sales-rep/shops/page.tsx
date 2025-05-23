"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "sonner"
import { Search, Store } from "lucide-react"
import { orderAPI, userAPI } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newShop, setNewShop] = useState({
    name: "",
    address: "",
    phone_number: "",
    sales_rep_id: 0,
  })

  useEffect(() => {
    // Get the logged-in user ID and name
    const storedUserId = localStorage.getItem("userId")
    const storedUserName = localStorage.getItem("userName")
    setUserId(storedUserId)
    setUserName(storedUserName)

    if (storedUserId) {
      const salesRepId = Number.parseInt(storedUserId)
      setNewShop((prev) => ({ ...prev, sales_rep_id: salesRepId }))
    }

    fetchShops()
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

  const fetchShops = async () => {
  const storedUserId = localStorage.getItem("userId")
  const storedUserName = localStorage.getItem("userName")

  if (!storedUserId) {
    console.error("No user ID found")
    return
  }

  const salesRepId = Number.parseInt(storedUserId)

  try {
    console.log("Fetching shops data for sales rep ID:", salesRepId, "Name:", storedUserName)

    // Use the new endpoint to fetch shops directly by sales rep ID
    const shopsData = await userAPI.getShopsBySalesRep(salesRepId)
    
    // Transform the data to match your expected format
    const shopsArray = shopsData.map(shop => ({
      ...shop,
      orderCount: 0 // Initialize with 0 orders
    }))
    
    // If you still want to include order counts, you can fetch orders separately
    const allOrdersData = await orderAPI.getSummaries()
    
    // Count orders per shop
    const shopOrderCounts = new Map()
    allOrdersData.forEach(order => {
      if (order.shop_id) {
        shopOrderCounts.set(order.shop_id, (shopOrderCounts.get(order.shop_id) || 0) + 1)
      }
    })
    
    // Update order counts
    shopsArray.forEach(shop => {
      shop.orderCount = shopOrderCounts.get(shop.shop_id) || 0
    })
    
    setShops(shopsArray)
    setFilteredShops(shopsArray)

    console.log("Shops in territory:", shopsArray)
  } catch (error) {
    console.error("Error fetching shops data:", error)
    toast.error("Failed to load shops data", {
      description: "Please check your connection and try again.",
    })
  } finally {
    setLoading(false)
  }
}


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewShop((prev) => ({ ...prev, [name]: value }))
  }

  // In your ShopsPage component
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!newShop.name.trim()) {
    toast.error("Shop name is required")
    return
  }

  try {
    // Make sure sales_rep_id is included in the newShop object
    const response = await userAPI.createShop(newShop)
    toast.success("Shop created successfully")
    setNewShop({
      name: "",
      address: "",
      phone_number: "",
      sales_rep_id: Number(userId) || 0,
    })
    setIsDialogOpen(false)

    // Add the new shop to the list
    const newShopWithId = {
      ...response,
      orderCount: 0,
    }
    setShops((prev) => [...prev, newShopWithId])
  } catch (error) {
    console.error("Error creating shop:", error)
    toast.error("Failed to create shop")
  }
}


  return (
    <DashboardLayout role="sales-rep">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shops Directory</h2>
            <p className="text-muted-foreground">
              Showing shops for {userName || "Unknown"} (ID: {userId || "Unknown"})
            </p>
          </div>

          <div className="flex items-center gap-4">
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Store className="mr-2 h-4 w-4" />
                  Add Shop
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Shop</DialogTitle>
                  <DialogDescription>Create a new shop in your territory.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name*
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={newShop.name}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">
                        Address
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={newShop.address}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone_number" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={newShop.phone_number}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Shop</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
          <p>No shops found in your territory. Add a new shop to get started.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
