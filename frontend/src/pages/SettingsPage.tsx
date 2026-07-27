import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/context/ThemeContext'
import { useHealth } from '@/hooks/useHealth'
import { Server, Cpu, Wifi, Moon, Sun, Database } from 'lucide-react'

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { data: health } = useHealth()

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System configuration and status</p>
      </div>

      {/* Backend status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Server className="w-4 h-4 text-muted-foreground" /> Backend Status</CardTitle>
          <CardDescription>Connection to the Express API server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={health?.status === 'ok' ? 'success' : 'destructive'}>
              {health?.status === 'ok' ? '✓ Online' : '✗ Offline'}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Service</span>
            <span className="text-sm font-medium">{health?.service || '—'}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Environment</span>
            <Badge variant="outline">{health?.environment || '—'}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Uptime</span>
            <span className="text-sm font-medium font-mono">{health?.uptime?.human || '—'}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Memory Used</span>
            <span className="text-sm font-medium font-mono">{health?.memory?.heapUsedMB ? `${health.memory.heapUsedMB} MB` : '—'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Moon className="w-4 h-4 text-muted-foreground" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
            >
              {theme === 'dark' ? <><Sun className="w-3.5 h-3.5" /> Light</> : <><Moon className="w-3.5 h-3.5" /> Dark</>}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Data source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="w-4 h-4 text-muted-foreground" /> Data Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Platform</span>
            <Badge variant="info">monday.com</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">API Version</span>
            <span className="text-sm font-mono">2024-01</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Backend URL</span>
            <span className="text-sm font-mono text-muted-foreground">http://localhost:3000</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">AI Model</span>
            <Badge variant="purple">Groq (llama-3.3-70b)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
