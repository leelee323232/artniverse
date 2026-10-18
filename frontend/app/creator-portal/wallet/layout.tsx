"use client"

import { useLayoutEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"

export default function WalletLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])

  return children
}
