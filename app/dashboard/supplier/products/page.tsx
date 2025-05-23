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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import { productAPI } from "@/lib/api"

interface Product {
  product_id: number
  supplier_id: number
  name: string
  description: string
  price: number
  supplier_name?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [supplierName, setSupplierName] = useState<string>("Global Goods Inc.")
  const [supplierId, setSupplierId] = useState<number>(1)

  // New product form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [initialQuantity, setInitialQuantity] = useState("100")
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)

  // Edit product form state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editProductId, setEditProductId] = useState<number | null>(null)
  const [editProductName, setEditProductName] = useState("")
  const [editProductDescription, setEditProductDescription] = useState("")
  const [editProductPrice, setEditProductPrice] = useState("")
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the logged-in user name and ID
        const storedUserName = localStorage.getItem("userName")
        const storedUserId = localStorage.getItem("userId")

        if (storedUserName) {
          setSupplierName(storedUserName)
        }

        if (storedUserId) {
          setSupplierId(Number.parseInt(storedUserId))
        }

        console.log("Fetching all products data")

        // Fetch all products
        const allProducts = await productAPI.getAll()
        console.log("All products:", allProducts)

        // Set all products
        setProducts(allProducts)
      } catch (error) {
        console.error("Error fetching products data:", error)
        toast.error("Failed to load products data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // If no real data, create demo data
  useEffect(() => {
    if (products.length === 0 && !loading) {
      // Create demo products
      const demoProducts = [
        {
          product_id: 1,
          supplier_id: 1,
          name: "Premium Coffee Beans",
          description: "100% Arabica coffee beans from Colombia, medium roast",
          price: 12.99,
          supplier_name: supplierName,
        },
        {
          product_id: 2,
          supplier_id: 1,
          name: "Organic Green Tea",
          description: "High-quality loose leaf green tea from Japan",
          price: 8.5,
          supplier_name: supplierName,
        },
        {
          product_id: 3,
          supplier_id: 1,
          name: "Artisanal Chocolate Bar",
          description: "Dark chocolate with sea salt, 70% cacao",
          price: 4.99,
          supplier_name: supplierName,
        },
        {
          product_id: 4,
          supplier_id: 1,
          name: "Gourmet Pasta",
          description: "Handmade Italian pasta, bronze-cut",
          price: 6.75,
          supplier_name: supplierName,
        },
        {
          product_id: 5,
          supplier_id: 1,
          name: "Extra Virgin Olive Oil",
          description: "Cold-pressed olive oil from Spain",
          price: 15.99,
          supplier_name: supplierName,
        },
      ]

      setProducts(demoProducts)
    }
  }, [products, loading, supplierName])

  const handleCreateProduct = async () => {
    if (!productName || !productDescription || !productPrice) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsCreatingProduct(true)

    try {
      const price = Number.parseFloat(productPrice)
      const quantity = Number.parseInt(initialQuantity)

      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price")
        setIsCreatingProduct(false)
        return
      }

      if (isNaN(quantity) || quantity < 0) {
        toast.error("Please enter a valid initial quantity")
        setIsCreatingProduct(false)
        return
      }

      // For demo purposes, we'll use supplier ID 1 if not available
      const newProduct = await productAPI.create({
        supplier_id: supplierId || 1,
        name: productName,
        description: productDescription,
        price,
        initial_quantity: quantity,
      })

      // If API call fails, create a mock product
      const mockProduct = {
        product_id: products.length + 1,
        supplier_id: supplierId || 1,
        name: productName,
        description: productDescription,
        price: price,
        supplier_name: supplierName,
      }

      setProducts([...products, newProduct || mockProduct])

      toast.success("Product created successfully")

      // Close dialog and reset form
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error("Failed to create product")
    } finally {
      setIsCreatingProduct(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditProductId(product.product_id)
    setEditProductName(product.name)
    setEditProductDescription(product.description)
    setEditProductPrice(product.price.toString())
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!editProductId || !editProductName || !editProductDescription || !editProductPrice) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsUpdatingProduct(true)

    try {
      const price = Number.parseFloat(editProductPrice)

      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price")
        setIsUpdatingProduct(false)
        return
      }

      const updatedProduct = await productAPI.update(editProductId, {
        name: editProductName,
        description: editProductDescription,
        price,
      })

      // If API call fails, update the product locally
      if (!updatedProduct) {
        const updatedProducts = products.map((p) => {
          if (p.product_id === editProductId) {
            return {
              ...p,
              name: editProductName,
              description: editProductDescription,
              price: price,
            }
          }
          return p
        })
        setProducts(updatedProducts)
      } else {
        // Update products list with API response
        const updatedProducts = products.map((p) => (p.product_id === editProductId ? updatedProduct : p))
        setProducts(updatedProducts)
      }

      toast.success("Product updated successfully")

      // Close dialog
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
    } finally {
      setIsUpdatingProduct(false)
    }
  }

  const resetForm = () => {
    setProductName("")
    setProductDescription("")
    setProductPrice("")
    setInitialQuantity("100")
  }

  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products Management</h2>
            <p className="text-muted-foreground">Showing all products for {supplierName}</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the details to create a new product</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="Enter product price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initial-quantity">Initial Quantity</Label>
                    <Input
                      id="initial-quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={initialQuantity}
                      onChange={(e) => setInitialQuantity(e.target.value)}
                      placeholder="Enter initial quantity"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProduct} disabled={isCreatingProduct}>
                  {isCreatingProduct ? "Creating..." : "Create Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>Update the product details</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editProductDescription}
                    onChange={(e) => setEditProductDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editProductPrice}
                    onChange={(e) => setEditProductPrice(e.target.value)}
                    placeholder="Enter product price"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProduct} disabled={isUpdatingProduct}>
                  {isUpdatingProduct ? "Updating..." : "Update Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>Manage your product offerings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading products...</p>
            ) : products.length > 0 ? (
              <div className="rounded-md border">
                <div className="w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Price</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {products.map((product) => (
                        <tr
                          key={product.product_id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">{product.product_id}</td>
                          <td className="p-4 align-middle">{product.name}</td>
                          <td className="p-4 align-middle">{product.description}</td>
                          <td className="p-4 align-middle">${product.price.toFixed(2)}</td>
                          <td className="p-4 align-middle">
                            <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p>No products found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
