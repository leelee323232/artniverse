"use client"

import { useEffect, useLayoutEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function WalletLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])

  useEffect(() => {
    if (isLoading) return
    if (!user) router.replace("/login/")
    else if (!user.is_creator) router.replace("/creator-apply/")
  }, [isLoading, user, router])

  if (isLoading || !user) return null

  return children
}
