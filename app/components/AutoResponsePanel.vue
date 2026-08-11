<template>
  <div ref="panelTargetRef" class="auto-responder">
    <!-- Floating Trigger Button -->
    <button
      v-if="!isOpen"
      class="auto-responder__trigger"
      @click="togglePanel"
      aria-label="Open Auto Response API Panel"
    >
      <div class="auto-responder__pulse"></div>
      <i class="ri-terminal-box-line auto-responder__icon"></i>
      <span class="auto-responder__badge">API Bot</span>
    </button>

    <!-- Floating API Panel -->
    <transition name="panel-slide">
      <div v-if="isOpen" class="auto-responder__panel">
        <!-- Panel Header -->
        <div class="auto-responder__header">
          <div class="auto-responder__status">
            <span class="auto-responder__dot"></span>
            <span class="auto-responder__endpoint">API v2.4 / RMF-BOT</span>
            <span class="auto-responder__code">200 OK</span>
          </div>

          <div class="auto-responder__controls">
            <button class="auto-responder__btn-icon" @click="clearLogs" title="Clear Logs">
              <i class="ri-delete-bin-line"></i>
            </button>
            <button class="auto-responder__btn-icon" @click="togglePanel" title="Close Panel">
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>

        <!-- Mode Navigation Tabs -->
        <div class="auto-responder__tabs">
          <button
            :class="['auto-responder__tab', { 'is-active': activeTab === 'api' }]"
            @click="activeTab = 'api'"
          >
            <i class="ri-robot-2-line"></i> Auto-Response
          </button>
          <button
            :class="['auto-responder__tab', { 'is-active': activeTab === 'contact' }]"
            @click="activeTab = 'contact'"
          >
            <i class="ri-mail-send-line"></i> Quick Contact
          </button>
          <button
            :class="['auto-responder__tab', { 'is-active': activeTab === 'endpoints' }]"
            @click="activeTab = 'endpoints'"
          >
            <i class="ri-code-s-slash-line"></i> Endpoints
          </button>
        </div>

        <!-- TAB 1: Auto-Response Terminal -->
        <div v-if="activeTab === 'api'" class="auto-responder__content">
          <!-- Quick Action Preset Chips -->
          <div class="auto-responder__presets">
            <button
              v-for="chip in quickChips"
              :key="chip.endpoint"
              class="auto-responder__chip"
              @click="triggerPreset(chip)"
            >
              <i :class="chip.icon"></i> {{ chip.label }}
            </button>
          </div>

          <!-- Console Terminal Log -->
          <div ref="logContainer" class="auto-responder__terminal">
            <div
              v-for="(log, idx) in logs"
              :key="idx"
              :class="['auto-responder__log-item', `auto-responder__log-item--${log.type}`]"
            >
              <div class="auto-responder__log-meta">
                <span class="auto-responder__log-time">{{ log.time }}</span>
                <span class="auto-responder__log-method">{{ log.method }}</span>
                <span class="auto-responder__log-path">{{ log.path }}</span>
              </div>

              <pre v-if="log.json" class="auto-responder__json"><code>{{ log.json }}</code></pre>
              <p v-else class="auto-responder__log-msg">{{ log.message }}</p>
            </div>

            <div v-if="isTyping" class="auto-responder__typing">
              <span class="auto-responder__typing-dot"></span>
              <span class="auto-responder__typing-dot"></span>
              <span class="auto-responder__typing-dot"></span>
              <span class="auto-responder__typing-text">Processing API query...</span>
            </div>
          </div>

          <!-- User Query Input -->
          <form @submit.prevent="handleSendQuery" class="auto-responder__input-bar">
            <input
              v-model="userQuery"
              type="text"
              placeholder="Ask anything (e.g. price, schedule, trial)..."
              class="auto-responder__input"
            />
            <button type="submit" class="auto-responder__send-btn" :disabled="!userQuery.trim() || isTyping">
              <i class="ri-send-plane-fill"></i>
            </button>
          </form>
        </div>

        <!-- TAB 2: Quick Contact Form -->
        <div v-else-if="activeTab === 'contact'" class="auto-responder__content">
          <div v-if="contactSuccess" class="auto-responder__success" data-animate="scale">
            <i class="ri-checkbox-circle-fill auto-responder__success-icon"></i>
            <h3>Message Sent via API!</h3>
            <p>Confirmation Ticket: <strong>{{ contactTicket }}</strong></p>
            <p>Our team at Rithy Martial & Fitness will reach out within 15 minutes.</p>
            
            <div class="auto-responder__quick-links">
              <a href="https://t.me/rithymartialfitness" target="_blank" rel="noopener" class="btn btn--primary btn--sm">
                <i class="ri-telegram-fill"></i> Open Telegram Hotline
              </a>
              <button @click="contactSuccess = false" class="btn btn--outline btn--sm">Send Another</button>
            </div>
          </div>

          <form v-else @submit.prevent="submitQuickContact" class="auto-responder__form">
            <p class="auto-responder__form-intro">
              Direct API submission to Master Ny Rithy's desk.
            </p>

            <div class="form-group">
              <label>Your Name *</label>
              <input v-model="contactForm.name" type="text" required placeholder="Sokha / John Doe" />
            </div>

            <div class="form-group">
              <label>Phone / Telegram *</label>
              <input v-model="contactForm.phone" type="text" required placeholder="+855 12 345 678" />
            </div>

            <div class="form-group">
              <label>Program Interest</label>
              <select v-model="contactForm.program">
                <option value="Bokator & Kun Khmer">Bokator & Kun Khmer</option>
                <option value="Brazilian Jiu-Jitsu">Brazilian Jiu-Jitsu (BJJ)</option>
                <option value="Strength & Conditioning">Strength & Conditioning</option>
                <option value="Free Trial Session">Free Trial Session Pass</option>
                <option value="Private 1-on-1 Coaching">Private 1-on-1 Coaching</option>
              </select>
            </div>

            <div class="form-group">
              <label>Message / Goal</label>
              <textarea v-model="contactForm.message" rows="2" placeholder="Tell us your goals or preferred schedule..."></textarea>
            </div>

            <button type="submit" class="btn btn--primary btn--full" :disabled="isSubmitting">
              <span v-if="isSubmitting"><i class="ri-loader-4-line spin"></i> Submitting API POST...</span>
              <span v-else><i class="ri-send-plane-2-line"></i> Submit Quick Inquiry</span>
            </button>
          </form>
        </div>

        <!-- TAB 3: Endpoints Overview -->
        <div v-else-if="activeTab === 'endpoints'" class="auto-responder__content">
          <div class="auto-responder__endpoints-list">
            <div v-for="ep in endpointsList" :key="ep.path" class="auto-responder__ep-card">
              <div class="auto-responder__ep-head">
                <span :class="['badge-method', `badge-method--${ep.method.toLowerCase()}`]">{{ ep.method }}</span>
                <code class="auto-responder__ep-path">{{ ep.path }}</code>
              </div>
              <p class="auto-responder__ep-desc">{{ ep.desc }}</p>
              <button class="auto-responder__ep-test-btn" @click="testEndpoint(ep)">
                Run Test Request
              </button>
            </div>
          </div>
        </div>

        <!-- Footer hotline link bar -->
        <div class="auto-responder__footer">
          <span>Need instant answer?</span>
          <a href="https://t.me/rithymartialfitness" target="_blank" rel="noopener" class="auto-responder__tg-link">
            <i class="ri-telegram-fill"></i> Telegram Hotline
          </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { onClickOutside } from '@vueuse/core'

const isOpen = ref(false)
const panelTargetRef = ref(null)

onClickOutside(panelTargetRef, () => {
  isOpen.value = false
})
const activeTab = ref('api')
const isTyping = ref(false)
const isSubmitting = ref(false)
const userQuery = ref('')
const logContainer = ref(null)
const contactSuccess = ref(false)
const contactTicket = ref('')

const contactForm = reactive({
  name: '',
  phone: '',
  program: 'Bokator & Kun Khmer',
  message: ''
})

const logs = ref([
  {
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    method: 'SYS',
    path: '/api/v2/bot/init',
    type: 'sys',
    message: 'Auto-Response System initialized. Select a quick action or type a query.'
  }
])

const quickChips = [
  { label: 'Schedule', endpoint: '/api/v2/schedule', icon: 'ri-calendar-event-line' },
  { label: 'Pricing & Trial', endpoint: '/api/v2/pricing', icon: 'ri-price-tag-3-line' },
  { label: 'Location & Hours', endpoint: '/api/v2/location', icon: 'ri-map-pin-line' },
  { label: 'Programs List', endpoint: '/api/v2/programs', icon: 'ri-sword-line' }
]

const endpointsList = [
  { method: 'GET', path: '/api/v2/schedule', desc: 'Returns weekly timetable for morning & evening martial arts classes.' },
  { method: 'GET', path: '/api/v2/pricing', desc: 'Fetches membership tiers, drop-in passes & private coaching rates.' },
  { method: 'GET', path: '/api/v2/location', desc: 'Gym address, map coordinates, and opening hours.' },
  { method: 'POST', path: '/api/v2/contact', desc: 'Submits quick contact inquiry directly to master trainer.' }
]

function togglePanel() {
  isOpen.value = !isOpen.value
}

function clearLogs() {
  logs.value = []
}

function scrollToBottom() {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

function triggerPreset(chip) {
  activeTab.value = 'api'
  executeApiQuery(chip.endpoint, 'GET')
}

function testEndpoint(ep) {
  activeTab.value = 'api'
  executeApiQuery(ep.path, ep.method)
}

function handleSendQuery() {
  if (!userQuery.value.trim()) return
  const q = userQuery.value.trim()
  userQuery.value = ''

  logs.value.push({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    method: 'USER',
    path: '/api/v2/query',
    type: 'user',
    message: `Query: "${q}"`
  })
  scrollToBottom()

  isTyping.value = true

  setTimeout(() => {
    isTyping.value = false
    const response = matchQueryResponse(q)
    logs.value.push({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      method: '200 OK',
      path: '/api/v2/response',
      type: 'res',
      json: JSON.stringify(response, null, 2)
    })
    scrollToBottom()
  }, 600)
}

function executeApiQuery(path, method = 'GET') {
  logs.value.push({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    method: method,
    path: path,
    type: 'req',
    message: `Executing ${method} request to ${path}...`
  })
  scrollToBottom()

  isTyping.value = true

  setTimeout(() => {
    isTyping.value = false
    const response = getEndpointMockData(path)
    logs.value.push({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      method: '200 OK',
      path: path,
      type: 'res',
      json: JSON.stringify(response, null, 2)
    })
    scrollToBottom()
  }, 500)
}

function getEndpointMockData(path) {
  if (path.includes('schedule')) {
    return {
      status: 'success',
      code: 200,
      endpoint: '/api/v2/schedule',
      data: {
        monday_saturday: {
          morning: '06:00 AM - 08:30 AM (Bokator & Fitness)',
          afternoon: '04:00 PM - 06:00 PM (Kun Khmer Kickboxing)',
          evening: '06:30 PM - 08:30 PM (Brazilian Jiu-Jitsu)'
        },
        sunday: 'Private 1-on-1 Sessions (By Appointment)',
        location: 'Phnom Penh Main Dojo'
      }
    }
  }

  if (path.includes('pricing')) {
    return {
      status: 'success',
      code: 200,
      endpoint: '/api/v2/pricing',
      data: {
        drop_in: '$10 / session',
        monthly_unlimited: '$65 / month',
        quarterly_pass: '$170 / 3 months',
        private_coaching: '$35 / hour (With Master Rithy)',
        free_trial: '1st session FREE for Cambodian residents & newcomers'
      }
    }
  }

  if (path.includes('location')) {
    return {
      status: 'success',
      code: 200,
      endpoint: '/api/v2/location',
      data: {
        gym: 'Rithy Martial & Fitness',
        address: 'Street 123, Chamkarmon, Phnom Penh, Cambodia',
        phone: '+855 12 345 678',
        telegram: '@rithymartialfitness',
        opening_hours: 'Monday - Saturday: 06:00 AM - 09:00 PM'
      }
    }
  }

  return {
    status: 'success',
    code: 200,
    endpoint: '/api/v2/programs',
    data: [
      { id: 'bokator', name: 'Cambodian Bokator', level: 'All Levels' },
      { id: 'kun-khmer', name: 'Kun Khmer Kickboxing', level: 'Intermediate / Fighter' },
      { id: 'bjj', name: 'Brazilian Jiu-Jitsu', level: 'Beginner to Advanced' },
      { id: 'strength', name: 'Strength & Athletic Conditioning', level: 'All Levels' }
    ]
  }
}

function matchQueryResponse(query) {
  const q = query.toLowerCase()
  if (q.includes('price') || q.includes('cost') || q.includes('fee') || q.includes('rate') || q.includes('how much')) {
    return getEndpointMockData('/api/v2/pricing')
  }
  if (q.includes('time') || q.includes('schedule') || q.includes('when') || q.includes('open')) {
    return getEndpointMockData('/api/v2/schedule')
  }
  if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('contact')) {
    return getEndpointMockData('/api/v2/location')
  }
  return {
    status: 'success',
    code: 200,
    query: query,
    data: {
      answer: `Thank you for asking about "${query}". Kru Ny Rithy's team offers world-class Bokator, Kun Khmer, BJJ, and Fitness programs.`,
      recommendation: 'Feel free to click "Quick Contact" tab or join our Telegram for an instant response!',
      contact_telegram: 'https://t.me/rithymartialfitness'
    }
  }
}

function submitQuickContact() {
  if (!contactForm.name || !contactForm.phone) return
  isSubmitting.value = true

  setTimeout(() => {
    isSubmitting.value = false
    contactTicket.value = `RMF-${Math.floor(100000 + Math.random() * 900000)}`
    contactSuccess.value = true
    
    logs.value.push({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      method: 'POST 201',
      path: '/api/v2/contact/submit',
      type: 'res',
      json: JSON.stringify({
        status: 'created',
        ticket: contactTicket.value,
        name: contactForm.name,
        phone: contactForm.phone,
        program: contactForm.program,
        timestamp: new Date().toISOString()
      }, null, 2)
    })
  }, 750)
}
</script>

<style scoped>
.auto-responder {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
}

/* Floating Trigger */
.auto-responder__trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #eab308, #ca8a04);
  color: #000;
  border: none;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(234, 179, 8, 0.4);
  transition: all 0.25s ease;
}

.auto-responder__trigger:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 15px 30px rgba(234, 179, 8, 0.5);
}

.auto-responder__icon {
  font-size: 1.25rem;
}

.auto-responder__pulse {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
  animation: pulse-glow 1.5s infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}

/* Floating Panel Card */
.auto-responder__panel {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: min(420px, calc(100vw - 32px));
  max-height: 600px;
  background: rgba(18, 18, 22, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f3f4f6;
  font-family: monospace, var(--font-sans, sans-serif);
}

/* Panel Header */
.auto-responder__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.auto-responder__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.auto-responder__dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
}

.auto-responder__endpoint {
  font-weight: 700;
  color: #eab308;
}

.auto-responder__code {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

.auto-responder__controls {
  display: flex;
  gap: 0.25rem;
}

.auto-responder__btn-icon {
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
}

.auto-responder__btn-icon:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

/* Mode Navigation Tabs */
.auto-responder__tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.auto-responder__tab {
  flex: 1;
  padding: 0.6rem 0.4rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.auto-responder__tab.is-active {
  color: #eab308;
  background: rgba(234, 179, 8, 0.1);
  border-bottom: 2px solid #eab308;
}

/* Tab Content Container */
.auto-responder__content {
  flex: 1;
  padding: 0.85rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Presets Chips */
.auto-responder__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.auto-responder__chip {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #d1d5db;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.72rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.15s ease;
}

.auto-responder__chip:hover {
  background: rgba(234, 179, 8, 0.2);
  border-color: #eab308;
  color: #fff;
}

/* Terminal Log View */
.auto-responder__terminal {
  flex: 1;
  min-height: 220px;
  max-height: 280px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  padding: 0.6rem;
  overflow-y: auto;
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.auto-responder__log-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.68rem;
  color: #6b7280;
  margin-bottom: 0.2rem;
}

.auto-responder__log-method {
  color: #3b82f6;
  font-weight: 700;
}

.auto-responder__log-path {
  color: #eab308;
}

.auto-responder__log-item--sys {
  color: #9ca3af;
}

.auto-responder__log-item--user {
  color: #60a5fa;
}

.auto-responder__log-item--res {
  color: #10b981;
}

.auto-responder__json {
  background: rgba(0, 0, 0, 0.4);
  padding: 0.5rem;
  border-radius: 4px;
  color: #a7f3d0;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-size: 0.72rem;
}

.auto-responder__typing {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #eab308;
  font-size: 0.72rem;
  padding: 0.3rem 0;
}

.auto-responder__typing-dot {
  width: 5px;
  height: 5px;
  background: #eab308;
  border-radius: 50%;
  animation: blink 1s infinite alternate;
}

@keyframes blink {
  from { opacity: 0.3; }
  to { opacity: 1; }
}

/* Input bar */
.auto-responder__input-bar {
  display: flex;
  gap: 0.4rem;
}

.auto-responder__input {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: inherit;
}

.auto-responder__input:focus {
  outline: none;
  border-color: #eab308;
}

.auto-responder__send-btn {
  background: #eab308;
  color: #000;
  border: none;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.auto-responder__send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Quick Contact Form */
.auto-responder__form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-family: var(--font-sans, sans-serif);
}

.auto-responder__form-intro {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.form-group label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #d1d5db;
}

.form-group input,
.form-group select,
.form-group textarea {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;

  &:focus {
    outline: none;
    border-color: #eab308;
  }
}

.btn--full {
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.4rem;
}

.auto-responder__success {
  text-align: center;
  padding: 1rem 0.5rem;
  font-family: var(--font-sans, sans-serif);
}

.auto-responder__success-icon {
  font-size: 3rem;
  color: #10b981;
}

.auto-responder__quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* Endpoints List */
.auto-responder__endpoints-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.auto-responder__ep-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.6rem;
}

.auto-responder__ep-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
}

.badge-method {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.badge-method--get { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.badge-method--post { background: rgba(16, 185, 129, 0.2); color: #34d399; }

.auto-responder__ep-path {
  font-size: 0.75rem;
  color: #eab308;
}

.auto-responder__ep-desc {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-bottom: 0.4rem;
}

.auto-responder__ep-test-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #eab308;
    color: #000;
  }
}

/* Panel Footer */
.auto-responder__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.85rem;
  background: rgba(0, 0, 0, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.7rem;
  color: #9ca3af;
}

.auto-responder__tg-link {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.2rem;

  &:hover {
    text-decoration: underline;
  }
}

/* Transition */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
