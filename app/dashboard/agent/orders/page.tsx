"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import { orderAPI, productAPI } from "@/lib/api"

// Update interfaces to match your actual API response
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

interface Shop {
  shop_id: number
  name: string
  address: string
  phone_number: string
}

interface SalesRep {
  sales_rep_id: number
  name: string
  territory: string
  phone_number: string
}

interface Product {
  product_id: number
  supplier_id: number
  name: string
  description: string
  price: number
  supplier_name?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [agentId, setAgentId] = useState<number | null>(null)
  const [agentName, setAgentName] = useState<string | null>(null)

  // New order form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState("")
  const [selectedSalesRep, setSelectedSalesRep] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<
    {
      productId: string
      quantity: string
      price: string
    }[]
  >([{ productId: "", quantity: "1", price: "" }])
  const [paymentMethod, setPaymentMethod] = useState("Credit Card")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

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

        console.log("Fetching orders data for agent ID:", parsedAgentId, "Name:", storedAgentName)

        // Fetch all required data
        const [allOrdersData, productsData] = await Promise.all([orderAPI.getSummaries(), productAPI.getAll()])

        console.log("All orders data:", allOrdersData)
        console.log("Products data:", productsData)

        // Filter orders for this agent
        const filteredOrders = allOrdersData.filter(
          (order: OrderSummary) =>
            order.agent_id === parsedAgentId || (storedAgentName && order.AgentName === storedAgentName),
        )
        console.log("Filtered orders for agent:", filteredOrders)
        setOrders(filteredOrders)
        setProducts(productsData)

        // Extract unique shops and sales reps from filtered orders
        const uniqueShops = new Map()
        const uniqueSalesReps = new Map()

        filteredOrders.forEach((order) => {
          // Extract shop info
          if (order.ShopName && !uniqueShops.has(order.ShopName)) {
            uniqueShops.set(order.ShopName, {
              shop_id: uniqueShops.size + 1,
              name: order.ShopName,
              address: "",
              phone_number: "",
            })
          }

          // Extract sales rep info
          if (order.SalesRepName && !uniqueSalesReps.has(order.SalesRepName)) {
            uniqueSalesReps.set(order.SalesRepName, {
              sales_rep_id: uniqueSalesReps.size + 1,
              name: order.SalesRepName,
              territory: "",
              phone_number: "",
            })
          }
        })

        setShops(Array.from(uniqueShops.values()))
        setSalesReps(Array.from(uniqueSalesReps.values()))
      } catch (error) {
        console.error("Error fetching orders data:", error)
        toast.error("Failed to load orders data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const addProductRow = () => {
    setSelectedProducts([...selectedProducts, { productId: "", quantity: "1", price: "" }])
  }

  const removeProductRow = (index: number) => {
    if (selectedProducts.length > 1) {
      const updatedProducts = [...selectedProducts]
      updatedProducts.splice(index, 1)
      setSelectedProducts(updatedProducts)
    }
  }

  const updateProductRow = (index: number, field: string, value: string) => {
    const updatedProducts = [...selectedProducts]
    updatedProducts[index] = { ...updatedProducts[index], [field]: value }

    // Auto-fill price if product is selected
    if (field === "productId") {
      const product = products.find((p) => p.product_id.toString() === value)
      if (product) {
        updatedProducts[index].price = product.price.toString()
      }
    }

    setSelectedProducts(updatedProducts)
  }

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      const quantity = Number.parseFloat(item.quantity) || 0
      const price = Number.parseFloat(item.price) || 0
      return total + quantity * price
    }, 0)
  }

  const handleCreateOrder = async () => {
    // Validate form
    if (!selectedShop || !selectedSalesRep || selectedProducts.some((p) => !p.productId || !p.quantity || !p.price)) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsCreatingOrder(true)

    try {
      if (!agentId) {
        throw new Error("Agent ID not found")
      }

      const shopId = Number.parseInt(selectedShop)
      const salesRepId = Number.parseInt(selectedSalesRep)
      const total = calculateTotal()

      const productIds = selectedProducts.map((p) => Number.parseInt(p.productId))
      const quantities = selectedProducts.map((p) => Number.parseInt(p.quantity))
      const prices = selectedProducts.map((p) => Number.parseFloat(p.price))

      const result = await orderAPI.create({
        agentId,
        shopId,
        salesRepId,
        paymentMethod,
        paymentAmount: total,
        productIds,
        quantities,
        prices,
        orderStatus: "Processing",
      })

      if ("orderId" in result) {
        toast.success(`Order #${result.orderId} created successfully`)

        // Refresh orders list
        const allOrdersData = await orderAPI.getSummaries()
        const filteredOrders = allOrdersData.filter(
          (order: OrderSummary) => order.agent_id === agentId || (agentName && order.AgentName === agentName),
        )
        setOrders(filteredOrders)

        // Close dialog and reset form
        setIsDialogOpen(false)
        resetForm()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Failed to create order")
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const resetForm = () => {
    setSelectedShop("")
    setSelectedSalesRep("")
    setSelectedProducts([{ productId: "", quantity: "1", price: "" }])
    setPaymentMethod("Credit Card")
    setPaymentAmount("")
  }

  return (
    <DashboardLayout role="agent">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
            <p className="text-muted-foreground">
              Showing orders for {agentName || "Unknown"} (ID: {agentId || "Unknown"})
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Order</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>Fill in the details to create a new order</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shop">Shop</Label>
                    <Select value={selectedShop} onValueChange={setSelectedShop}>
                      <SelectTrigger id="shop">
                        <SelectValue placeholder="Select shop" />
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

                  <div className="space-y-2">
                    <Label htmlFor="salesRep">Sales Representative</Label>
                    <Select value={selectedSalesRep} onValueChange={setSelectedSalesRep}>
                      <SelectTrigger id="salesRep">
                        <SelectValue placeholder="Select sales rep" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesReps.map((rep) => (
                          <SelectItem key={rep.sales_rep_id} value={rep.sales_rep_id.toString()}>
                            {rep.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Products</Label>
                  {selectedProducts.map((product, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`product-${index}`} className="sr-only">
                          Product
                        </Label>
                        <Select
                          value={product.productId}
                          onValueChange={(value) => updateProductRow(index, "productId", value)}
                        >
                          <SelectTrigger id={`product-${index}`}>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.product_id} value={p.product_id.toString()}>
                                {p.name} (${p.price.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-20">
                        <Label htmlFor={`quantity-${index}`} className="sr-only">
                          Quantity
                        </Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => updateProductRow(index, "quantity", e.target.value)}
                          placeholder="Qty"
                        />
                      </div>

                      <div className="w-24">
                        <Label htmlFor={`price-${index}`} className="sr-only">
                          Price
                        </Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => updateProductRow(index, "price", e.target.value)}
                          placeholder="Price"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeProductRow(index)}
                        disabled={selectedProducts.length <= 1}
                      >
                        <span className="sr-only">Remove</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addProductRow}>
                    Add Product
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total">Total Amount</Label>
                    <Input id="total" value={`$${calculateTotal().toFixed(2)}`} readOnly />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrder} disabled={isCreatingOrder}>
                  {isCreatingOrder ? "Processing..." : "Create Order"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View and manage all orders</CardDescription>
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
                        <th className="h-12 px-4 text-left align-middle font-medium">Sales Rep</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Items</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {orders.map((order) => (
                        <tr
                          key={order.order_id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">{order.order_id}</td>
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
                          <td className="p-4 align-middle">{order.TotalItems}</td>
                          <td className="p-4 align-middle">${order.TotalOrderValue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p>No orders found for your account.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
