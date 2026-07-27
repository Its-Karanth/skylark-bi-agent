import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Handshake,
  ClipboardList,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  Layers,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
  { label: 'Deals', path: '/deals', icon: <Handshake className="w-4.5 h-4.5" /> },
  { label: 'Work Orders', path: '/workorders', icon: <ClipboardList className="w-4.5 h-4.5" /> },
  { label: 'Merged View', path: '/merged', icon: <Layers className="w-4.5 h-4.5" /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-4.5 h-4.5" /> },
  { label: 'AI Assistant', path: '/ai', icon: <Bot className="w-4.5 h-4.5" />, badge: 'AI Live' },
]

const bottomItems: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: <Settings className="w-4.5 h-4.5" /> },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col h-full bg-sidebar/90 backdrop-blur-2xl border-r border-sidebar-border overflow-hidden flex-shrink-0 z-30 shadow-xl"
      >
        {/* Logo Header */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border/80 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 blur-sm opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse-glow" />
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <span className="font-extrabold text-base tracking-tight gradient-text whitespace-nowrap">
                    Skylark BI
                  </span>
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase -mt-0.5">
                    Enterprise Agent
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavTooltip key={item.path} label={item.label} collapsed={collapsed}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative',
                    isActive
                      ? 'text-white shadow-lg shadow-indigo-500/20'
                      : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 rounded-xl border border-white/20 shadow-md"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className={cn('relative z-10 transition-transform duration-200 group-hover:scale-110', isActive ? 'text-white' : '')}>
                      {item.icon}
                    </span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative z-10 flex-1 whitespace-nowrap tracking-wide"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {item.badge && !collapsed && (
                      <span className="relative z-10 text-[10px] font-extrabold bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </NavTooltip>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-4">
          <Separator className="mb-3 opacity-60" />
          {bottomItems.map((item) => (
            <NavTooltip key={item.path} label={item.label} collapsed={collapsed}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative',
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground'
                  )
                }
              >
                <span className="relative z-10">{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </NavTooltip>
          ))}
        </div>

        {/* Collapse toggle floating button */}
        <button
          onClick={onToggle}
          className="absolute -right-3.5 top-20 z-40 w-7 h-7 rounded-full bg-card border border-border shadow-xl flex items-center justify-center hover:bg-accent hover:border-primary/40 transition-all hover:scale-110 active:scale-95"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </motion.div>
        </button>
      </motion.aside>
    </TooltipProvider>
  )
}

function NavTooltip({
  children,
  label,
  collapsed,
}: {
  children: React.ReactNode
  label: string
  collapsed: boolean
}) {
  if (!collapsed) return <>{children}</>
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" className="font-semibold">{label}</TooltipContent>
    </Tooltip>
  )
}
