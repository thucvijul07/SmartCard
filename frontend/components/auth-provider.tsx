"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (username: string, email: string, password: string, birthday: Date) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Simulate checking for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem("smartcard-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API call
    const mockUser = {
      id: "user-1",
      name: "John Doe",
      email: email,
    }

    setUser(mockUser)
    setIsAuthenticated(true)
    localStorage.setItem("smartcard-user", JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("smartcard-user")
  }

  const register = async (username: string, email: string, password: string, birthday: Date) => {
    // Simulate API call
    const mockUser = {
      id: "user-1",
      name: username,
      email: email,
    }

    setUser(mockUser)
    setIsAuthenticated(true)
    localStorage.setItem("smartcard-user", JSON.stringify(mockUser))
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

