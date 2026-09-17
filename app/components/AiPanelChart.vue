<template>
  <div class="ai-panel-chart">
    <!-- Chart Header Telemetry Bar -->
    <div class="chart-header">
      <div class="chart-title">
        <i class="ri-pulse-line pulse-icon"></i>
        <span>AI Telemetry & WS Stream</span>
        <span class="live-pill" :class="{ 'is-paused': isLiveStreamPaused }">
          <span class="pulse-dot"></span>
          {{ isLiveStreamPaused ? 'PAUSED' : 'LIVE' }}
        </span>
      </div>

      <div class="metric-selector">
        <button
          v-for="m in metricOptions"
          :key="m.id"
          class="metric-btn"
          :class="{ active: selectedMetric === m.id }"
          @click="selectedMetric = m.id"
        >
          <i :class="m.icon"></i> {{ m.label }}
        </button>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label"><i class="ri-speed-up-line"></i> Throughput</span>
        <span class="stat-value gold">{{ currentThroughput }} <small>msgs/min</small></span>
      </div>
      <div class="stat-card">
        <span class="stat-label"><i class="ri-timer-flash-line"></i> WS Latency</span>
        <span class="stat-value blue">{{ lastLatencyMs }} <small>ms</small></span>
      </div>
      <div class="stat-card">
        <span class="stat-label"><i class="ri-brain-line"></i> AI Confidence</span>
        <span class="stat-value green">{{ aiConfidencePct }}%</span>
      </div>
      <div class="stat-card">
        <span class="stat-label"><i class="ri-wifi-line"></i> Channel</span>
        <span class="stat-value" :class="status === 'connected' ? 'green' : 'red'">
          {{ status.toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- SVG Real-Time Telemetry Chart Container -->
    <div class="svg-container">
      <svg class="telemetry-svg" viewBox="0 0 500 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#eab308" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#eab308" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
          </linearGradient>

          <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Background Grid Lines -->
        <g class="grid-lines">
          <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255, 255, 255, 0.05)" stroke-dasharray="4" />
          <line x1="0" y1="70" x2="500" y2="70" stroke="rgba(255, 255, 255, 0.05)" stroke-dasharray="4" />
          <line x1="0" y1="110" x2="500" y2="110" stroke="rgba(255, 255, 255, 0.05)" stroke-dasharray="4" />
          <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255, 255, 255, 0.1)" />
        </g>

        <!-- Area Fill Path -->
        <path :d="areaPath" :fill="activeGradient" />

        <!-- Line Path -->
        <path
          :d="linePath"
          fill="none"
          :stroke="activeColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#glowGold)"
        />

        <!-- Glowing Data Points -->
        <g class="data-points">
          <circle
            v-for="(pt, idx) in chartPoints"
            :key="idx"
            :cx="pt.x"
            :cy="pt.y"
            r="3.5"
            :fill="activeColor"
            class="point-node"
            @mouseenter="hoveredIndex = idx"
            @mouseleave="hoveredIndex = null"
          />
        </g>
      </svg>

      <!-- Active Hover Tooltip -->
      <div
        v-if="hoveredPoint"
        class="chart-tooltip"
        :style="{ left: `${(hoveredPoint.x / 500) * 100}%`, top: `${(hoveredPoint.y / 160) * 100}%` }"
      >
        <span class="tooltip-time">{{ hoveredPoint.raw.time }}</span>
        <span class="tooltip-val">{{ hoveredPoint.val }} {{ metricUnit }}</span>
      </div>
    </div>

    <!-- Chart Footer & Controls -->
    <div class="chart-footer">
      <div class="time-axis">
        <span>{{ firstTime }}</span>
        <span>{{ midTime }}</span>
        <span>{{ lastTime }}</span>
      </div>

      <div class="chart-actions">
        <button class="action-btn" @click="toggleLiveStream">
          <i :class="isLiveStreamPaused ? 'ri-play-fill' : 'ri-pause-fill'"></i>
          {{ isLiveStreamPaused ? 'Resume' : 'Pause Stream' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWebSocketNotifications } from '~/composables/useWebSocketNotifications'

const {
  status,
  telemetryHistory,
  lastLatencyMs,
  aiConfidencePct,
  isLiveStreamPaused,
  toggleLiveStream,
} = useWebSocketNotifications()

const selectedMetric = ref<'throughput' | 'latency' | 'confidence'>('throughput')
const hoveredIndex = ref<number | null>(null)

const metricOptions = [
  { id: 'throughput', label: 'Msgs/Min', icon: 'ri-bar-chart-fill' },
  { id: 'latency', label: 'Latency', icon: 'ri-timer-line' },
  { id: 'confidence', label: 'AI Score', icon: 'ri-cpu-line' },
]

const currentThroughput = computed(() => {
  if (telemetryHistory.value.length === 0) return 18
  return telemetryHistory.value[telemetryHistory.value.length - 1].throughput
})

const activeColor = computed(() => {
  if (selectedMetric.value === 'latency') return '#3b82f6'
  if (selectedMetric.value === 'confidence') return '#10b981'
  return '#eab308'
})

const activeGradient = computed(() => {
  if (selectedMetric.value === 'latency') return 'url(#blueGradient)'
  if (selectedMetric.value === 'confidence') return 'url(#greenGradient)'
  return 'url(#goldGradient)'
})

const metricUnit = computed(() => {
  if (selectedMetric.value === 'latency') return 'ms'
  if (selectedMetric.value === 'confidence') return '%'
  return 'msgs/min'
})

const firstTime = computed(() => telemetryHistory.value[0]?.time || '00:00:00')
const midTime = computed(() => telemetryHistory.value[Math.floor(telemetryHistory.value.length / 2)]?.time || '00:00:00')
const lastTime = computed(() => telemetryHistory.value[telemetryHistory.value.length - 1]?.time || '00:00:00')

const chartPoints = computed(() => {
  const history = telemetryHistory.value
  if (history.length === 0) return []

  let values: number[] = []
  if (selectedMetric.value === 'latency') {
    values = history.map((h) => h.latency)
  } else if (selectedMetric.value === 'confidence') {
    values = history.map((h) => h.confidence)
  } else {
    values = history.map((h) => h.throughput)
  }

  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1) + 5

  const width = 500
  const height = 140
  const paddingY = 15

  return history.map((raw, idx) => {
    const val = values[idx]
    const x = (idx / (history.length - 1 || 1)) * width
    const norm = (val - min) / (max - min)
    const y = height - norm * (height - paddingY * 2) - paddingY
    return { x, y, val, raw }
  })
})

const linePath = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return 'M 0 70 L 500 70'

  return pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`
    const prev = pts[i - 1]
    const cx1 = prev.x + (pt.x - prev.x) / 2
    const cy1 = prev.y
    const cx2 = prev.x + (pt.x - prev.x) / 2
    const cy2 = pt.y
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`
  }, '')
})

const areaPath = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return ''
  const line = linePath.value
  const lastPt = pts[pts.length - 1]
  const firstPt = pts[0]
  return `${line} L ${lastPt.x} 160 L ${firstPt.x} 160 Z`
})

const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null) return null
  return chartPoints.value[hoveredIndex.value] || null
})
</script>

<style scoped lang="scss">
.ai-panel-chart {
  background: var(--c-surface, #141417);
  border: 1px solid var(--c-border, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  font-family: var(--font-sans, sans-serif);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
}

.pulse-icon {
  color: #eab308;
  font-size: 1.1rem;
}

.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.65rem;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;

  &.is-paused {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.3);

    .pulse-dot {
      background: #f59e0b;
      animation: none;
    }
  }
}

.pulse-dot {
  width: 5px;
  height: 5px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.5; }
  100% { transform: scale(0.9); opacity: 1; }
}

.metric-selector {
  display: flex;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--c-border, rgba(255, 255, 255, 0.08));
  border-radius: 8px;
  padding: 0.15rem;
  gap: 0.15rem;
}

.metric-btn {
  background: transparent;
  border: none;
  color: #a3a3a3;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.3rem 0.55rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s ease;

  i {
    font-size: 0.85rem;
  }

  &:hover {
    color: #ffffff;
  }

  &.active {
    background: rgba(234, 179, 8, 0.15);
    color: #eab308;
    border: 1px solid rgba(234, 179, 8, 0.3);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--c-border, rgba(255, 255, 255, 0.06));
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.68rem;
  color: #a3a3a3;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  i {
    font-size: 0.75rem;
  }
}

.stat-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;

  small {
    font-size: 0.68rem;
    font-weight: 400;
    color: #a3a3a3;
  }

  &.gold { color: #eab308; }
  &.blue { color: #60a5fa; }
  &.green { color: #34d399; }
  &.red { color: #f87171; }
}

.svg-container {
  position: relative;
  width: 100%;
  height: 140px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid var(--c-border, rgba(255, 255, 255, 0.05));
  overflow: hidden;
}

.telemetry-svg {
  width: 100%;
  height: 100%;
}

.point-node {
  cursor: pointer;
  transition: r 0.2s ease;

  &:hover {
    r: 6;
  }
}

.chart-tooltip {
  position: absolute;
  transform: translate(-50%, -120%);
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #eab308;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.7rem;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 10;
  white-space: nowrap;

  .tooltip-time {
    color: #a3a3a3;
    font-size: 0.65rem;
  }

  .tooltip-val {
    color: #eab308;
    font-weight: 700;
  }
}

.chart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #a3a3a3;
}

.time-axis {
  display: flex;
  gap: 1.5rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--c-border, rgba(255, 255, 255, 0.1));
  color: #d4d4d4;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
  }
}
</style>
