"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  isCreator: boolean
  creatorProfile?: {
    brandName: string
    bio: string
    links: { label: string; url: string }[]
    superSubscription?: {
      enabled: boolean
      price: number
      benefits: string[]
    }
  }
}

// Test accounts
const TEST_ACCOUNTS: Record<string, { password: string; user: User }> = {
  "member@test.com": {
    password: "member123",
    user: {
      id: "user-001",
      email: "member@test.com",
      name: "測試會員",
      avatar: "",
      isCreator: false,
    },
  },
  "creator@test.com": {
    password: "creator123",
    user: {
      id: "user-002",
      email: "creator@test.com",
      name: "星空畫室",
      avatar: "",
      isCreator: true,
      creatorProfile: {
        brandName: "星空畫室",
        bio: "專注於療癒系插畫創作，用溫暖的筆觸描繪生活中的小確幸。",
        links: [
          { label: "Instagram", url: "https://instagram.com/starryart" },
          { label: "Facebook", url: "https://facebook.com/starryart" },
        ],
        superSubscription: {
          enabled: true,
          price: 99,
          benefits: ["每月獨家桌布", "新品搶先看", "專屬折扣碼"],
        },
      },
    },
  },
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithProvider: (provider: "google" | "facebook" | "apple") => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  updateCreatorProfile: (updates: Partial<User["creatorProfile"]>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem("artniverse_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("artniverse_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    const account = TEST_ACCOUNTS[email.toLowerCase()]
    
    if (!account) {
      setIsLoading(false)
      return { success: false, error: "找不到此帳號" }
    }
    
    if (account.password !== password) {
      setIsLoading(false)
      return { success: false, error: "密碼錯誤" }
    }
    
    setUser(account.user)
    localStorage.setItem("artniverse_user", JSON.stringify(account.user))
    setIsLoading(false)
    return { success: true }
  }

  const loginWithProvider = async (provider: "google" | "facebook" | "apple") => {
    setIsLoading(true)
    
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // For demo, create a mock user
    const mockUser: User = {
      id: `${provider}-user-${Date.now()}`,
      email: `${provider}user@example.com`,
      name: `${provider === "google" ? "Google" : provider === "facebook" ? "Facebook" : "Apple"} 使用者`,
      avatar: "",
      isCreator: false,
    }
    
    setUser(mockUser)
    localStorage.setItem("artniverse_user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("artniverse_user")
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("artniverse_user", JSON.stringify(updatedUser))
  }

  const updateCreatorProfile = (updates: Partial<User["creatorProfile"]>) => {
    if (!user || !user.isCreator) return
    const updatedUser = {
      ...user,
      creatorProfile: { ...user.creatorProfile, ...updates } as User["creatorProfile"],
    }
    setUser(updatedUser)
    localStorage.setItem("artniverse_user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithProvider,
        logout,
        updateUser,
        updateCreatorProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
