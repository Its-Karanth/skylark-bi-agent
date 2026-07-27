import axios from 'axios'
import type {
  DealsApiResponse,
  WorkOrdersApiResponse,
  MergedApiResponse,
  HealthResponse,
  ChatApiRequest,
  ChatApiResponse,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance — all requests go to the same origin (proxied by Vite)
// ─────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  timeout: 60000, // 60s — monday.com + OpenAI can be slow
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for consistent error messages
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.error || error.message || 'Request failed'

    // Attach a friendlyMessage for common error codes
    if (status === 429) {
      error.friendlyMessage =
        'AI assistant is temporarily unavailable because the OpenAI API quota has been exceeded. Please try again later.'
    } else if (status === 503 || !error.response) {
      error.friendlyMessage =
        'Backend is offline or unreachable. Please ensure the server is running on port 3000.'
    } else if (status === 500) {
      error.friendlyMessage = `Server error: ${message}`
    } else {
      error.friendlyMessage = message
    }

    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Typed API fetchers
// ─────────────────────────────────────────────────────────────────────────────

/** GET /health */
export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health')
  return data
}

/** GET /api/deals */
export async function fetchDeals(): Promise<DealsApiResponse> {
  const { data } = await api.get<DealsApiResponse>('/api/deals')
  return data
}

/** GET /api/workorders */
export async function fetchWorkOrders(): Promise<WorkOrdersApiResponse> {
  const { data } = await api.get<WorkOrdersApiResponse>('/api/workorders')
  return data
}

/** GET /api/merged */
export async function fetchMerged(): Promise<MergedApiResponse> {
  const { data } = await api.get<MergedApiResponse>('/api/merged')
  return data
}

/** POST /api/chat */
export async function postChat(payload: ChatApiRequest): Promise<ChatApiResponse> {
  const { data } = await api.post<ChatApiResponse>('/api/chat', payload)
  return data
}

export default api
