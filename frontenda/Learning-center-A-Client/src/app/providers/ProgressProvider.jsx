"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

export default function ProgressProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.start()

    const timer = setTimeout(() => {
      NProgress.done()
    }, 1300)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return null
}