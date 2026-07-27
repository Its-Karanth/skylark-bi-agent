import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useLocation } from 'react-router-dom'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Ambient background glowing floating elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent blur-3xl animate-float-reverse" />
        <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-violet-600/10 via-pink-600/10 to-transparent blur-3xl animate-float" />
      </div>

      {/* Sidebar */}
      <div className="relative z-20 flex h-full">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />

        {/* Page content with animated transitions */}
        <main className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
