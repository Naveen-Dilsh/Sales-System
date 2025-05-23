"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/dashboard-layout"
import { inventoryAPI, productAPI } from "@/lib/api"
import { toast } from "sonner"
import { Search } from "lucide-react"

interface Inventory {
  inventory_id: number
  product_id: number
  agent_id: number
  quantity: number
  last_update_date: string
  product_name: string
  agent_name: string
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

export default function SupplierInventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [filteredInventory, setFilteredInventory] = useState<Inventory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [supplierName, setSupplierName] = useState<string>("Global Goods Inc.")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the logged-in user name
        const storedUserName = localStorage.getItem("userName")
        if (storedUserName) {
          setSupplierName(storedUserName)
        }

        console.log("Fetching all inventory and products data")

        // Fetch all inventory and products
        const [allInventory, allProducts] = await Promise.all([inventoryAPI.getAll(), productAPI.getAll()])

        console.log("All inventory:", allInventory)
        console.log("All products:", allProducts)

        // Set all inventory and products
        setInventory(allInventory)
        setFilteredInventory(allInventory)
        setProducts(allProducts)
      } catch (error) {
        console.error("Error fetching inventory data:", error)
        toast.error("Failed to load inventory data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter inventory based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInventory(inventory)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = inventory.filter(
        (item) =>
          item.product_name?.toLowerCase().includes(query) ||
          item.agent_name?.toLowerCase().includes(query) ||
          item.supplier_name?.toLowerCase().includes(query),
      )
      setFilteredInventory(filtered)
    }
  }, [searchQuery, inventory])

  // If no real data, create demo data
  useEffect(() => {
    if (inventory.length === 0 && !loading) {
      // Create demo products if none exist
      const demoProducts =
        products.length > 0
          ? products
          : [
              {
                product_id: 1,
                name: "Premium Coffee Beans",
                supplier_id: 1,
                price: 12.99,
                description: "High-quality coffee beans",
              },
              {
                product_id: 2,
                name: "Organic Green Tea",
                supplier_id: 1,
                price: 8.5,
                description: "Organic green tea leaves",
              },
              {
                product_id: 3,
                name: "Artisanal Chocolate Bar",
                supplier_id: 1,
                price: 4.99,
                description: "Handcrafted chocolate",
              },
              { product_id: 4, name: "Gourmet Pasta", supplier_id: 1, price: 6.75, description: "Italian pasta" },
              {
                product_id: 5,
                name: "Extra Virgin Olive Oil",
                supplier_id: 1,
                price: 15.99,
                description: "Premium olive oil",
              },
            ]

      if (products.length === 0) {
        setProducts(demoProducts)
      }

      // Create demo inventory
      const demoAgents = [
        { agent_id: 1, name: "John Smith" },
        { agent_id: 2, name: "Maria Garcia" },
        { agent_id: 3, name: "David Johnson" },
        { agent_id: 4, name: "Sarah Williams" },
      ]

      const demoInventory: Inventory[] = []

      // Create inventory items for each product and agent combination
      demoProducts.forEach((product) => {
        demoAgents.forEach((agent) => {
          demoInventory.push({
            inventory_id: demoInventory.length + 1,
            product_id: product.product_id,
            agent_id: agent.agent_id,
            quantity: Math.floor(Math.random() * 200) + 50,
            last_update_date: new Date().toISOString().split("T")[0],
            product_name: product.name,
            agent_name: agent.name,
            supplier_name: supplierName,
          })
        })
      })

      setInventory(demoInventory)
      setFilteredInventory(demoInventory)
    }
  }, [inventory, loading, products, supplierName])

  return (
    <DashboardLayout role="sales-rep">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
            <p className="text-muted-foreground">Showing all inventory for {supplierName}</p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>View inventory levels for your products across all agents</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading inventory data...</p>
            ) : filteredInventory.length > 0 ? (
              <div className="rounded-md border">
                <div className="w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Product</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Agent</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Quantity</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredInventory.map((item) => (
                        <tr
                          key={item.inventory_id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">{item.product_name}</td>
                          <td className="p-4 align-middle">{item.agent_name}</td>
                          <td className="p-4 align-middle">{item.quantity}</td>
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
                              {item.quantity <= 50 ? "Low" : item.quantity <= 100 ? "Medium" : "Good"}
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
              <p>No inventory data found. Try adjusting your search criteria.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
