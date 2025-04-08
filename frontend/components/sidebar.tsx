"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Plus, Library, Sparkles, BrainCircuit, X, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState !== null) {
      setCollapsed(savedState === "true")
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
  }

  const routes = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Create Flashcard",
      icon: Plus,
      href: "/create",
      active: pathname === "/create",
    },
    {
      label: "Your Library",
      icon: Library,
      href: "/library",
      active: pathname === "/library",
    },
    {
      label: "AI Flashcard",
      icon: Sparkles,
      href: "/ai-flashcard",
      active: pathname === "/ai-flashcard",
    },
    {
      label: "AI Quiz",
      icon: BrainCircuit,
      href: "/ai-quiz",
      active: pathname === "/ai-quiz",
    },
  ]

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />}

      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full border-r bg-background transition-all duration-300 ease-in-out md:translate-x-0 md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "sidebar-collapsed" : "sidebar-expanded",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">SmartCard</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <div className="space-y-4 py-4 mt-6">
          <div className="px-3 py-2 mt-10">
            <div className="space-y-1 mt-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    collapsed && "justify-center px-2",
                  )}
                  title={collapsed ? route.label : undefined}
                >
                  <route.icon className="h-5 w-5" />
                  {!collapsed && <span>{route.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-2 hidden md:block">
          <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
          </Button>
        </div>
      </div>
    </>
  )
}

