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

interface Agent {
  agent_id: number
  name: string
  address?: string
  phone_number?: string
  email?: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [newAgent, setNewAgent] = useState({
    name: "",
    address: "",
    phone_number: "",
    email: "",
    supplier_id: 0,
  })

  useEffect(() => {
    // Get the logged-in user ID
    const storedUserId = localStorage.getItem("userId")
    if (storedUserId) {
      const parsedSupplierId = Number.parseInt(storedUserId)
      setSupplierId(parsedSupplierId)
      setNewAgent((prev) => ({ ...prev, supplier_id: parsedSupplierId }))
    }

    fetchAgents()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAgents(agents)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          (agent.address && agent.address.toLowerCase().includes(query)) ||
          (agent.phone_number && agent.phone_number.includes(query)) ||
          (agent.email && agent.email.toLowerCase().includes(query)),
      )
      setFilteredAgents(filtered)
    }
  }, [searchQuery, agents])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getAgents()
      setAgents(data)
      setFilteredAgents(data)
    } catch (error) {
      console.error("Error fetching agents:", error)
      toast.error("Failed to load agents")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAgent((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAgent.name.trim()) {
      toast.error("Agent name is required")
      return
    }

    try {
      const response = await userAPI.createAgent(newAgent)
      toast.success("Agent created successfully")
      setNewAgent({
        name: "",
        address: "",
        phone_number: "",
        email: "",
        supplier_id: supplierId || 0,
      })
      setIsDialogOpen(false)
      fetchAgents()
    } catch (error) {
      console.error("Error creating agent:", error)
      toast.error("Failed to create agent")
    }
  }

  return (
    <DashboardLayout role="supplier">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Agents</h2>
            <p className="text-muted-foreground">Manage your distribution agents</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search agents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Agent</DialogTitle>
                  <DialogDescription>Create a new distribution agent to handle your products.</DialogDescription>
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
                        value={newAgent.name}
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
                        value={newAgent.address}
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
                        value={newAgent.phone_number}
                        onChange={handleInputChange}
                        className="col-span-3"
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
                        value={newAgent.email}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Agent</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <p>Loading agents...</p>
        ) : filteredAgents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <Card key={agent.agent_id}>
                <CardHeader>
                  <CardTitle>{agent.name}</CardTitle>
                  <CardDescription>ID: {agent.agent_id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {agent.address && (
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-sm text-muted-foreground">{agent.address}</p>
                      </div>
                    )}
                    {agent.phone_number && (
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p className="text-sm text-muted-foreground">{agent.phone_number}</p>
                      </div>
                    )}
                    {agent.email && (
                      <div>
                        <span className="font-medium">Email:</span>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>No agents found. Add your first agent to get started.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
