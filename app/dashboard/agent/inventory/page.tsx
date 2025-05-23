"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { inventoryAPI, productAPI } from "@/lib/api"
import { toast } from "sonner"

// Update interfaces to match your actual API response
interface Inventory {
  inventory_id: number
  product_id: number
  agent_id: number
  quantity: number
  last_update_date: string
  product_name: string
  supplier_name: string
}

interface Product {
  product_id: number
  supplier_id: number
  name: string
  description: string
  price: number
  supplier_name?: string
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [agentId, setAgentId] = useState<number | null>(null)

  // Restock form state
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantityToAdd, setQuantityToAdd] = useState("10")
  const [isRestocking, setIsRestocking] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the logged-in agent ID
        const storedAgentId = localStorage.getItem("userId")
        if (!storedAgentId) {
          console.error("No agent ID found")
          return
        }

        const parsedAgentId = Number.parseInt(storedAgentId)
        setAgentId(parsedAgentId)

        console.log("Fetching inventory data for agent ID:", parsedAgentId)

        // Fetch all inventory data
        const allInventoryData = await inventoryAPI.getAll()
        console.log("All inventory data:", allInventoryData)

        // Filter inventory for this agent
        const filteredInventory = allInventoryData.filter((item: Inventory) => item.agent_id === parsedAgentId)
        console.log("Filtered inventory for agent:", filteredInventory)
        setInventory(filteredInventory)

        // Fetch products data
        const productsData = await productAPI.getAll()
        console.log("Products data:", productsData)
        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching inventory data:", error)
        toast.error("Failed to load inventory data", {
          description: "Please check your connection and try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRestock = async () => {
    if (!selectedProduct || !quantityToAdd) {
      toast.error("Missing information", {
        description: "Please select a product and enter a quantity",
      })
      return
    }

    const productId = Number.parseInt(selectedProduct)
    const quantity = Number.parseInt(quantityToAdd)

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Invalid quantity", {
        description: "Please enter a valid quantity",
      })
      return
    }

    setIsRestocking(true)
    toast.loading("Restocking inventory...", { id: "restock" })

    try {
      if (!agentId) {
        throw new Error("Agent ID not found")
      }

      const result = await inventoryAPI.restock({
        agentId,
        productId,
        quantityToAdd: quantity,
      })

      if (result) {
        // Fetch all inventory data again
        const allInventoryData = await inventoryAPI.getAll()

        // Filter inventory for this agent
        const filteredInventory = allInventoryData.filter((item: Inventory) => item.agent_id === agentId)
        setInventory(filteredInventory)

        toast.success("Inventory restocked", {
          description: `Added ${quantity} units to inventory`,
          id: "restock",
        })

        // Reset form
        setSelectedProduct("")
        setQuantityToAdd("10")
      }
    } catch (error) {
      console.error("Error restocking inventory:", error)
      toast.error("Failed to restock inventory", {
        description: "An error occurred while restocking inventory",
        id: "restock",
      })
    } finally {
      setIsRestocking(false)
    }
  }

  return (
    <DashboardLayout role="agent">
      <div className="flex flex-col gap-5">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>

        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>View and manage your current inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading inventory data...</p>
              ) : inventory.length > 0 ? (
                <div className="rounded-md border">
                  <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium">Product</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Supplier</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Quantity</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {inventory.map((item) => (
                          <tr
                            key={item.inventory_id}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <td className="p-4 align-middle">{item.product_name}</td>
                            <td className="p-4 align-middle">{item.supplier_name}</td>
                            <td className="p-4 align-middle">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  item.quantity <= 50
                                    ? "bg-red-100 text-red-800"
                                    : item.quantity <= 100
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {item.quantity}
                              </span>
                            </td>
                            <td className="p-4 align-middle">{new Date(item.last_update_date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p>No inventory items found for your account.</p>
              )}
            </CardContent>
          </Card>

          
        </div>
      </div>
    </DashboardLayout>
  )
}
