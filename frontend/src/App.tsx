import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { DealsPage } from '@/pages/DealsPage'
import { WorkOrdersPage } from '@/pages/WorkOrdersPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { AIAssistantPage } from '@/pages/AIAssistantPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { MergedPage } from '@/pages/MergedPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/workorders" element={<WorkOrdersPage />} />
        <Route path="/merged" element={<MergedPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ai" element={<AIAssistantPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
