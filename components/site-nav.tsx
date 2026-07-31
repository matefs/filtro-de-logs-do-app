"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Início" },
  { href: "/logs-por-data", label: "Logs por data" },
  { href: "/logs-estruturados", label: "Logs estruturados" },
]

export function SiteNav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex w-full max-w-4xl items-center gap-1 px-4 py-3">
        <span className="mr-3 font-mono text-sm font-semibold">log-slicer</span>
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
