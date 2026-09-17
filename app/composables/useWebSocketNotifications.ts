import { ref, computed } from 'vue'

export interface WebSocketMessage {
  id?: string
  type: string
  title?: string
  message?: string
  content?: string
  timestamp?: string
  sender_id?: number
  user_id?: number
  metrics?: {
    latency?: number
    confidence?: number
    throughput?: number
  }
  data?: any
}

export interface TelemetryPoint {
  time: string
  throughput: number
  latency: number
  confidence: number
}

const status = ref<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected')
const socket = ref<WebSocket | null>(null)
const telemetryHistory = ref<TelemetryPoint[]>([])
const activeConnectionsCount = ref(1)
const lastLatencyMs = ref(14)
const aiConfidencePct = ref(98.5)
const isLiveStreamPaused = ref(false)

let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let pingInterval: ReturnType<typeof setInterval> | null = null
let mockTelemetryTimer: ReturnType<typeof setInterval> | null = null
let reconnectAttempts = 0

export function useWebSocketNotifications() {
  const config = useRuntimeConfig()
  const notificationsStore = useNotificationStore()
  const authStore = useAuthStore()

  const isConnected = computed(() => status.value === 'connected')

  function getWsUrl(): string {
    const rawWsBase = config.public?.wsBase || config.wsBase || 'ws://127.0.0.1:8080/ws'
    const baseUrl = String(rawWsBase).replace(/\/+$/, '')

    // If a user is logged in, connect to their personal notification socket.
    if (authStore.user?.id) {
      const token = authStore.token || ''
      return `${baseUrl}/notifications/${authStore.user.id}?token=${encodeURIComponent(token)}`
    }

    // Fallback to the main broadcast websocket endpoint.
    return baseUrl.endsWith('/ws') ? baseUrl : `${baseUrl}/ws`
  }

  function ensureTelemetrySimulation() {
    if (mockTelemetryTimer) return
    // Seed initial data points for the chart to render immediately.
    if (telemetryHistory.value.length === 0) {
      const now = new Date()
      const points: TelemetryPoint[] = []
      for (let i = 15; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3000)
        points.push({
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          throughput: Math.floor(Math.random() * 10) + 14,
          latency: Math.floor(Math.random() * 5) + 11,
          confidence: +(97 + Math.random() * 2.5).toFixed(1),
        })
      }
      telemetryHistory.value = points
    }
    mockTelemetryTimer = setInterval(() => {
      recordTelemetryPoint()
    }, 3000)
  }

  function connect() {
    if (socket.value && (socket.value.readyState === WebSocket.OPEN || socket.value.readyState === WebSocket.CONNECTING)) {
      return
    }
    if (typeof window === 'undefined') return

    status.value = reconnectAttempts > 0 ? 'reconnecting' : 'connecting'
    ensureTelemetrySimulation()

    const wsUrl = getWsUrl()

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        status.value = 'connected'
        reconnectAttempts = 0
        socket.value = ws
        notificationsStore.wsConnected = true
        startHeartbeat()
        recordTelemetryPoint()
      }

      ws.onmessage = (event) => {
        try {
          const payload: WebSocketMessage = JSON.parse(event.data)
          handleIncomingMessage(payload)
        } catch (err) {
          console.warn('WebSocket non-JSON payload:', event.data)
        }
      }

      ws.onerror = () => {
        status.value = 'disconnected'
      }

      ws.onclose = () => {
        status.value = 'disconnected'
        notificationsStore.wsConnected = false
        stopHeartbeat()
        scheduleReconnect()
      }
    } catch (e) {
      status.value = 'disconnected'
      scheduleReconnect()
    }
  }

  function disconnect() {
    stopHeartbeat()
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    notificationsStore.wsConnected = false
    status.value = 'disconnected'
  }

  function startHeartbeat() {
    stopHeartbeat()
    pingInterval = setInterval(() => {
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }))
      }
    }, 20000)
  }

  function stopHeartbeat() {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 15000)
    reconnectAttempts++
    reconnectTimer = setTimeout(() => {
      connect()
    }, delay)
  }

  function handleIncomingMessage(msg: WebSocketMessage) {
    if (msg.type === 'pong' || msg.type === 'ping') return

    // Update real-time telemetry metrics.
    if (msg.metrics) {
      if (msg.metrics.latency) lastLatencyMs.value = msg.metrics.latency
      if (msg.metrics.confidence) aiConfidencePct.value = msg.metrics.confidence
    }

    recordTelemetryPoint(1)

    // Notification payload may be nested under `data`.
    const payload = msg.data && typeof msg.data === 'object' ? msg.data : msg
    if (payload && typeof payload === 'object') {
      const hasMessage =
        (payload.title ?? payload.Title ?? payload.message ?? payload.Message ?? payload.content ?? payload.Content)
      if (hasMessage) {
        notificationsStore.addFromServer({
          ...payload,
          id: payload.id ?? payload.Id ?? msg.id ?? `ws-${Date.now()}-${Math.random()}`,
        })
      }
    }
  }

  function recordTelemetryPoint(incrementCount = 0) {
    if (isLiveStreamPaused.value) return

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const baseThroughput = Math.floor(Math.random() * 8) + 12 + incrementCount
    const jitterLatency = Math.floor(Math.random() * 6) + 12
    const jitterConfidence = +(96.5 + Math.random() * 3.2).toFixed(1)

    lastLatencyMs.value = jitterLatency
    aiConfidencePct.value = jitterConfidence

    const newPoint: TelemetryPoint = {
      time: timeStr,
      throughput: baseThroughput,
      latency: jitterLatency,
      confidence: jitterConfidence,
    }

    const updated = [...telemetryHistory.value, newPoint]
    if (updated.length > 20) updated.shift()
    telemetryHistory.value = updated
  }

  function toggleLiveStream() {
    isLiveStreamPaused.value = !isLiveStreamPaused.value
  }

  function sendWebSocketMessage(payload: any) {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify(payload))
      recordTelemetryPoint(1)
      return true
    }
    return false
  }

  return {
    status,
    isConnected,
    telemetryHistory,
    activeConnectionsCount,
    lastLatencyMs,
    aiConfidencePct,
    isLiveStreamPaused,
    connect,
    disconnect,
    toggleLiveStream,
    sendWebSocketMessage,
  }
}