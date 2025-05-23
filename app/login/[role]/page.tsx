"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { userAPI } from "@/lib/api"
import Link from "next/link"
import { ArrowLeftIcon, ShieldCheckIcon } from "lucide-react"

interface User {
  agent_id?: number
  sales_rep_id?: number
  supplier_id?: number
  name: string
}

export default function LoginPage({ params }: { params: { role: string } }) {
  // Safely access the role parameter
  const role = params?.role || ""
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let fetchedUsers: User[] = []

        if (role === "agent") {
          fetchedUsers = await userAPI.getAgents()
        } else if (role === "sales-rep") {
          fetchedUsers = await userAPI.getSalesReps()
        } else if (role === "supplier") {
          fetchedUsers = await userAPI.getSuppliers()
          // Ensure the first supplier is at the top of the list
          if (fetchedUsers.length > 0) {
            const firstSupplier = fetchedUsers.find((s) => s.supplier_id === 1)
            if (firstSupplier) {
              fetchedUsers = [firstSupplier, ...fetchedUsers.filter((s) => s.supplier_id !== 1)]
            }
          }
        }

        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [role])

  // Get role-specific colors and icons
  const getRoleStyles = () => {
    switch (role) {
      case "agent":
        return {
          borderColor: "border-gray-800",
          buttonColor: "bg-gray-900 hover:bg-gray-800",
          iconColor: "text-gray-800"
        }
      case "sales-rep":
        return {
          borderColor: "border-gray-700",
          buttonColor: "bg-gray-800 hover:bg-gray-700",
          iconColor: "text-gray-700"
        }
      case "supplier":
        return {
          borderColor: "border-gray-600",
          buttonColor: "bg-gray-700 hover:bg-gray-600",
          iconColor: "text-gray-600"
        }
      default:
        return {
          borderColor: "border-gray-800",
          buttonColor: "bg-gray-900 hover:bg-gray-800",
          iconColor: "text-gray-800"
        }
    }
  }

  const { borderColor, buttonColor, iconColor } = getRoleStyles()

  // Safely determine the role title
  const roleTitle =
    role === "agent"
      ? "Agent"
      : role === "sales-rep"
        ? "Sales Representative"
        : role === "supplier"
          ? "Supplier"
          : "User"

  const handleLogin = () => {
    if (!userId) {
      toast.error(`Please select a ${roleTitle} to continue`)
      return
    }

    // Find the selected user
    const selectedUser = users.find((u) => {
      if (role === "agent") return u.agent_id?.toString() === userId
      if (role === "sales-rep") return u.sales_rep_id?.toString() === userId
      if (role === "supplier") return u.supplier_id?.toString() === userId
      return false
    })

    if (!selectedUser) {
      toast.error("Invalid user selection")
      return
    }

    // Store user info in localStorage for demo purposes
    localStorage.setItem("userId", userId)
    localStorage.setItem("userRole", role)
    localStorage.setItem("userName", selectedUser.name)

    toast.success("Login successful", {
      description: "You have been logged in successfully",
    })

    // Redirect to the appropriate dashboard
    router.push(`/dashboard/${role}`)
  }

  // Handle invalid role
  if (!["agent", "sales-rep", "supplier"].includes(role)) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold tracking-tight">Sales Management System</h1>
            </div>
          </div>
        </header>
        
        <main className="flex-grow flex items-center justify-center py-12">
          <Card className="w-full max-w-md border border-gray-200 shadow-md">
            <CardHeader className="border-l-4 border-red-500">
              <CardTitle>Invalid Role</CardTitle>
              <CardDescription>The specified role is not valid.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please go back and select a valid role.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white" onClick={() => router.push("/")}>
                Go Back
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header matching the home page */}
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Sales Management System</h1>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-black border-gray-600 hover:bg-gray-800">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center py-12">
        <Card className="w-full max-w-md border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-4">
            <ShieldCheckIcon className={`h-8 w-8 ${iconColor} opacity-20`} />
          </div>
          <CardHeader className={`pt-8 border-l-4 ${borderColor}`}>
            <CardTitle className="text-xl text-gray-900">{roleTitle} Login</CardTitle>
            <CardDescription className="text-gray-600">
              Access your {roleTitle.toLowerCase()} dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Select {roleTitle}</Label>
                  <Select onValueChange={setUserId}>
                    <SelectTrigger id="user" className="border-gray-300">
                      <SelectValue placeholder={`Select ${roleTitle}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* {users.map((user) => {
                        const id =
                          role === "agent" ? user.agent_id : role === "sales-rep" ? user.sales_rep_id : user.supplier_id

                        return (
                          <SelectItem key={id} value={id?.toString() || ""}>
                            {user.name}
                          </SelectItem>
                        )
                      })} */}
                      {role === "supplier" 
                        ? users
                            .filter(user => user.supplier_id === 1)
                            .map(user => (
                              <SelectItem key={user.supplier_id} value={user.supplier_id?.toString() || ""}>
                                {user.name}
                              </SelectItem>
                            ))
                        : users.map((user) => {
                            const id =
                              role === "agent" ? user.agent_id : role === "sales-rep" ? user.sales_rep_id : user.supplier_id
                            
                            return (
                              <SelectItem key={id} value={id?.toString() || ""}>
                                {user.name}
                              </SelectItem>
                            )
                          })
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value="password" readOnly className="border-gray-300" />
                  <p className="text-xs text-gray-500">(Using hardcoded password for demo purposes)</p>
                </div>
                
                <div className="mt-4 flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${borderColor}`}></div>
                  <span className="text-sm text-gray-700">Secure role-based access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${borderColor}`}></div>
                  <span className="text-sm text-gray-700">Personalized dashboard</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-4 pb-8">
            <Button 
              className={`w-full ${buttonColor} text-white`} 
              onClick={handleLogin} 
              disabled={loading}
            >
              Login as {roleTitle}
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      {/* Simple footer to match homepage style */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-4">
          <p className="text-gray-400 text-sm text-center">&copy; 2025 Sales Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}