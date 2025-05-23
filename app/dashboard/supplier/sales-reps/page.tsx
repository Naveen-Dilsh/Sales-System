"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { userAPI } from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, UserPlus } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SalesRep {
  sales_rep_id: number
  name: string
  email?: string
  phone_number?: string
  territory?: string
}

export default function SalesRepsPage() {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSalesReps, setFilteredSalesReps] = useState<SalesRep[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSalesRep, setNewSalesRep] = useState({
    name: "",
    email: "",
    phone_number: "",
    territory: "",
  })

  useEffect(() => {
    fetchSalesReps()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSalesReps(salesReps)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = salesReps.filter(
        (rep) =>
          rep.name.toLowerCase().includes(query) ||
          (rep.email && rep.email.toLowerCase().includes(query)) ||
          (rep.phone_number && rep.phone_number.includes(query)) ||
          (rep.territory && rep.territory.toLowerCase().includes(query)),
      )
      setFilteredSalesReps(filtered)
    }
  }, [searchQuery, salesReps])

  const fetchSalesReps = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getSalesReps()
      setSalesReps(data)
      setFilteredSalesReps(data)
    } catch (error) {
      console.error("Error fetching sales reps:", error)
      toast.error("Failed to load sales representatives")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewSalesRep((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSalesRep.name.trim()) {
      toast.error("Sales rep name is required")
      return
    }

    try {
      const response = await userAPI.createSalesRep(newSalesRep)
      toast.success("Sales representative created successfully")
      setNewSalesRep({
        name: "",
        email: "",
        phone_number: "",
        territory: "",
      })
      setIsDialogOpen(false)
      fetchSalesReps()
    } catch (error) {
      console.error("Error creating sales rep:", error)
      toast.error("Failed to create sales representative")
    }
  }

  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Sales Representatives</h2>
            <p className="text-muted-foreground">Manage your sales representatives</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sales reps..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Sales Rep
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Sales Representative</DialogTitle>
                  <DialogDescription>
                    Create a new sales representative to manage your products in the field.
                  </DialogDescription>
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
                        value={newSalesRep.name}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newSalesRep.email}
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
                        value={newSalesRep.phone_number}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="territory" className="text-right">
                        Territory
                      </Label>
                      <Input
                        id="territory"
                        name="territory"
                        value={newSalesRep.territory}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Sales Rep</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <p>Loading sales representatives...</p>
        ) : filteredSalesReps.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSalesReps.map((rep) => (
              <Card key={rep.sales_rep_id}>
                <CardHeader>
                  <CardTitle>{rep.name}</CardTitle>
                  <CardDescription>ID: {rep.sales_rep_id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rep.email && (
                      <div>
                        <span className="font-medium">Email:</span>
                        <p className="text-sm text-muted-foreground">{rep.email}</p>
                      </div>
                    )}
                    {rep.phone_number && (
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p className="text-sm text-muted-foreground">{rep.phone_number}</p>
                      </div>
                    )}
                    {rep.territory && (
                      <div>
                        <span className="font-medium">Territory:</span>
                        <p className="text-sm text-muted-foreground">{rep.territory}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>No sales representatives found. Add your first sales rep to get started.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
