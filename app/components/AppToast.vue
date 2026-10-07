<template>
  <div class="app-toast" :class="`toast-${color}`">
    <div class="toast-inner">
      <!-- Icon -->
      <div class="toast-icon" :class="`text-${color}-400`">
        <i :class="computedIcon"></i>
      </div>

      <!-- Content -->
      <div class="toast-content">
        <span class="toast-title">{{ title ?? message}}</span>
        <span v-if="description" class="toast-description">{{ description }}</span>
      </div>

      <!-- Close Button -->
      <button class="toast-close" @click="closeToast">
        <i class="ri-close-line"></i>
      </button>
    </div>
        <!-- 🔥 Progress bar -->
    <div
      v-if="timeout > 0"
      class="toast-progress"
      :class="`bg-${color}-400`"
      :style="{ animationDuration: timeout + 'ms' }"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  message: { type: String, default: ''},
  description: { type: String, default: '' },
  icon: { type: String, default: 'ri-information-line' },
  color: {
    type: String,
    default: 'blue',
    validator: (v: string) => ['blue', 'green', 'red', 'amber', 'gray', 'purple'].includes(v)
  },
  timeout: { type: Number, default: 4500 }
})
const emit = defineEmits(['close'])
const iconMap: Record<string, string> = {
  success: 'ri-check-line',
  error: 'ri-error-warning-line',
  warning: 'ri-alert-line',
  info: 'ri-information-line',
  blue: 'ri-information-line',
  green: 'ri-check-line',
  red: 'ri-close-circle-line',
  amber: 'ri-alert-line',
  gray: 'ri-information-line',
  purple: 'ri-star-line'
}
const computedIcon = computed(() => {
  return iconMap[props.color] || 'ri-information-line'
})
let timer: NodeJS.Timeout | null = null

const closeToast = () => {
  if (timer) clearTimeout(timer)
  emit('close',props.id)
}

onMounted(() => {
  if (props.timeout > 0) {
    timer = setTimeout(closeToast, props.timeout)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style lang="scss" scoped>
.app-toast {
  position: relative;
  background: #1f2937;
  color: white;
  padding: 12px 16px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3);
  border: 1px solid #374151;
  width: 100%;
  margin: 8px auto;
  background: #1f2937;
  color: white;
  border-radius: 12px;
  border-left: 4px solid;
  max-width: 380px;
  overflow: hidden;
}

.toast-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 500;
  display: block;
}

.toast-description {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 2px;
  display: block;
}

.toast-close {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  border-radius: 50%;
  margin-left: auto;

  &:hover {
    color: white;
  }
}

/* 🔥 Progress bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation-name: shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

/* animation */
@keyframes shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Color Variants */
.toast-blue  { border-color: #3b82f6; }
.toast-green { border-color: #22c55e; }
.toast-red   { border-color: #ef4444; }
.toast-amber { border-color: #f59e0b; }
.toast-gray  { border-color: #6b7280; }
.toast-purple{ border-color: #8b5cf6; }

/* 🔥 Color borders */
// .toast-blue  { border-color: #3b82f6; }
// .toast-green { border-color: #22c55e; }
// .toast-red   { border-color: #ef4444; }
// .toast-amber { border-color: #f59e0b; }
// .toast-gray  { border-color: #6b7280; }
// .toast-purple{ border-color: #8b5cf6; }

</style>

<!-- 
Usage
<script setup>
const { success, error, info, warning } = useToast()

// Simple usage
info('Chat deleted')

// With description
error('Failed to delete chat', {
  description: 'Please try again later'
})

// Full control
success('Payment successful', {
  description: 'Your order has been processed',
  timeout: 6000
})
</script> -->
