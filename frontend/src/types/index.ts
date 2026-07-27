// ─────────────────────────────────────────────────────────────────────────────
// TypeScript interfaces mirroring the backend's normalized data shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface Deal {
  id: string
  name: string
  status: string
  stage: string
  priority: string
  deal_value: number | null
  close_date: string | null
  owner: string
  company: string
  industry: string
  notes: string
  created_at: string | null
  updated_at: string | null
  _raw_status: string
  _dataIssues: string[]
  _invalid: boolean
  // Present in merged view
  workOrders?: WorkOrder[]
}

export interface WorkOrder {
  id: string
  name: string
  deal_reference: string
  status: string
  priority: string
  assigned_to: string
  start_date: string | null
  due_date: string | null
  completion_date: string | null
  estimated_hours: number | null
  actual_hours: number | null
  notes: string
  created_at: string | null
  updated_at: string | null
  _raw_status: string
  _dataIssues: string[]
  // Present in merged view
  deal?: {
    id: string
    name: string
    status: string
  }
}

// ── Deals API response ────────────────────────────────────────────────────────

export interface DealSummary {
  total: number
  won: number
  lost: number
  open: number
  winRate: string
  totalWonRevenue: number
  averageDealValue: number
  statusDistribution: Record<string, number>
  industryDistribution: Record<string, number>
}

export interface DataQualityReport {
  recordsWithIssues: number
  totalRecords: number
  issueRate: string
  issues: Array<{ id: string; name: string; issues: string[] }>
}

export interface DealsApiResponse {
  success: boolean
  fetchedAt: string
  summary: DealSummary
  dataQuality: DataQualityReport
  deals: Deal[]
}

// ── Work Orders API response ──────────────────────────────────────────────────

export interface WorkOrderSummary {
  total: number
  done: number
  inProgress: number
  blocked: number
  overdue: number
  criticalOverdue: number
  statusDistribution: Record<string, number>
  priorityDistribution: Record<string, number>
}

export interface WorkOrderEfficiency {
  totalEstimatedHours: number
  totalActualHours: number
  efficiencyRatio: string
  note: string | null
  assigneeWorkload: Record<string, {
    total: number
    inProgress: number
    done: number
    overdue: number
  }>
}

export interface WorkOrdersApiResponse {
  success: boolean
  fetchedAt: string
  summary: WorkOrderSummary
  efficiency: WorkOrderEfficiency
  dataQuality: DataQualityReport
  workOrders: WorkOrder[]
}

// ── Merged API response ───────────────────────────────────────────────────────

export interface MergedApiResponse {
  success: boolean
  deals: Deal[]
  workOrders: WorkOrder[]
}

// ── Health API response ───────────────────────────────────────────────────────

export interface HealthResponse {
  success: boolean
  status: string
  service: string
  version: string
  environment: string
  timestamp: string
  uptime: { seconds: number; human: string }
  memory: { heapUsedMB: string; heapTotalMB: string }
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
  isLoading?: boolean
}

export interface ChatApiRequest {
  message: string
  history?: Array<{ role: string; content: string }>
}

export interface ChatApiResponse {
  success: boolean
  requestId: string
  reply: string
  metadata: {
    model: string
    tokensUsed: number | null
    promptTokens: number | null
    completionTokens: number | null
    dataContext: {
      dealsWithIssues: number
      workOrdersWithIssues: number
      totalDeals: number
      totalWorkOrders: number
    }
    timestamp: string
  }
}
