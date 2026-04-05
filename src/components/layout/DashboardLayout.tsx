import type { ReactNode } from 'react'

export function DashboardLayout({
  sidebar,
  children,
}: {
  sidebar: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-black text-on-surface font-body">
      {sidebar}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        {children}
      </main>
    </div>
  )
}
