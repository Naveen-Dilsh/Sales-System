"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Box,
  Building,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Store,
  User,
  Users,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "agent" | "sales-rep" | "supplier"
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // Get the user name from localStorage
    const storedUserName = localStorage.getItem("userName")
    setUserName(storedUserName)
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  const renderNavLinks = () => {
    if (role === "agent") {
      return (
        <>
          <Link href="/dashboard/agent">
            <Button variant={isActive("/dashboard/agent") ? "default" : "ghost"} className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          
          <Link href="/dashboard/agent/inventory">
            <Button
              variant={isActive("/dashboard/agent/inventory") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Box className="mr-2 h-4 w-4" />
              Inventory
            </Button>
          </Link>
          <Link href="/dashboard/agent/orders">
            <Button
              variant={isActive("/dashboard/agent/orders") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </Button>
          </Link>
          <Link href="/dashboard/agent/shops">
            <Button variant={isActive("/dashboard/agent/shops") ? "default" : "ghost"} className="w-full justify-start">
              <Store className="mr-2 h-4 w-4" />
              Shops
            </Button>
          </Link>
        </>
      )
    } else if (role === "sales-rep") {
      return (
        <>
          <Link href="/dashboard/sales-rep">
            <Button variant={isActive("/dashboard/sales-rep") ? "default" : "ghost"} className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/sales-rep/inventory">
            <Button
              variant={isActive("/dashboard/sales-rep/agents") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <User className="mr-2 h-4 w-4" />
               Inventory
            </Button>
          </Link>
          <Link href="/dashboard/sales-rep/orders">
            <Button
              variant={isActive("/dashboard/sales-rep/orders") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </Button>
          </Link>
          <Link href="/dashboard/sales-rep/shops">
            <Button
              variant={isActive("/dashboard/sales-rep/shops") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Store className="mr-2 h-4 w-4" />
              Shops
            </Button>
          </Link>
        </>
      )
    } else if (role === "supplier") {
      return (
        <>
          <Link href="/dashboard/supplier">
            <Button variant={isActive("/dashboard/supplier") ? "default" : "ghost"} className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/supplier/business-intelligence">
            <Button variant={isActive("/dashboard/supplier/business-intelligence") ? "default" : "ghost"}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Business-intelligence
            </Button>
          </Link>
          <Link href="/dashboard/supplier/products">
            <Button
              variant={isActive("/dashboard/supplier/products") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Package className="mr-2 h-4 w-4" />
              Products
            </Button>
          </Link>
          <Link href="/dashboard/supplier/orders">
            <Button
              variant={isActive("/dashboard/supplier/orders") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </Button>
          </Link>
          <Link href="/dashboard/supplier/inventory">
            <Button
              variant={isActive("/dashboard/supplier/inventory") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Box className="mr-2 h-4 w-4" />
              Inventory
            </Button>
          </Link>
          <Link href="/dashboard/supplier/sales-reps">
            <Button
              variant={isActive("/dashboard/supplier/sales-reps") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Sales Reps
            </Button>
          </Link>
          <Link href="/dashboard/supplier/agents">
            <Button
              variant={isActive("/dashboard/supplier/agents") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Building className="mr-2 h-4 w-4" />
              Agents
            </Button>
          </Link>
        </>
      )
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center">
            <BarChart className="mr-2 h-6 w-6" />
            <span className="text-lg font-semibold">Sales System</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-2">{renderNavLinks()}</nav>
        </div>
        <div className="mt-auto border-t pt-4">
          <div className="mb-2 px-4">
            <p className="text-sm font-medium">Logged in as:</p>
            <p className="text-sm text-muted-foreground">{userName || "Unknown User"}</p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
