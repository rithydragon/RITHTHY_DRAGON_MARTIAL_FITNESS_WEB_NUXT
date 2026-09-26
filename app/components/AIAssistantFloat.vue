<template>
  <div class="ai-float-root">
    <!-- Chat panel -->
    <Transition name="ai-panel">
      <div v-if="ui.aiAssistantOpen" class="ai-panel">
        <div class="ai-panel-header">
          <div class="ai-header-left">
            <div class="ai-avatar"><RImage src="/RTY_FITNESS_LOGO.jpg" /></div>
            <div>
              <p class="ai-name">{{ mode === 'ai' ? aiName : roomName }}</p>
              <p class="ai-status">
                <span class="status-dot" :class="{ busy: mode === 'public' && wsStatus !== 'connected' }" />
                {{ mode === 'ai' ? onlineLabel : pubStatusLabel }}
              </p>
            </div>
          </div>
          <button class="ai-close" @click="ui.aiAssistantOpen = false" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="ai-tabbar">
          <button class="ai-tab" :class="{ active: mode === 'ai' }" @click="setMode('ai')">
            <i class="ri-chat-smile-ai-3-line"></i>
            <span>{{ tabAi }}</span>
          </button>
          <button class="ai-tab" :class="{ active: mode === 'public' }" @click="setMode('public')">
            <i class="ri-earth-line"></i>
            <span>{{ tabPublic }}</span>
          </button>
        </div>

        <!-- AI chat -->
        <template v-if="mode === 'ai'">
          <div ref="aiMessagesEl" class="ai-messages">
            <div
              v-for="msg in aiMessages"
              :key="msg.id"
              :class="['ai-msg', msg.role]"
            >
              <div class="msg-avatar" :class="msg.role">
                <RImage
                  v-if="msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system'"
                  :src="msg.role === 'user' ? profile.avatar : assistantAvatar"
                />
                <span v-else>{{ msg.role === 'admin' ? 'AD' : initialsOf(msg.senderName) }}</span>
              </div>
              <div class="ai-msg-body" :class="{ me: msg.role === 'user' }">
                <div class="msg-meta">
                  <span v-if="msg.role !== 'user'" class="msg-role-badge" :class="msg.role">{{ badgeLabel(msg.role) }}</span>
                  <span class="msg-sender">{{ msg.role === 'user' ? displayName : msg.senderName }}</span>
                </div>
                <div class="msg-bubble">{{ msg.content }}</div>
              </div>
            </div>

            <div v-if="loading" class="ai-msg assistant">
              <div class="msg-avatar assistant"><RImage :src="assistantAvatar" /></div>
              <div class="ai-msg-body">
                <div class="msg-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          </div>

          <div v-if="aiMessages.length <= 1" class="ai-quick">
            <button v-for="q in quickPrompts" :key="q" class="quick-btn" @click="sendMessage(q)">
              {{ q }}
            </button>
          </div>

          <div v-if="isAuth && aiMessages.length <= 1" class="ai-quick member">
            <span class="quick-label"><i class="ri-vip-crown-line"></i> {{ memberLabel }}</span>
            <button v-for="q in memberQuickPrompts" :key="q" class="quick-btn" @click="sendMessage(q)">
              {{ q }}
            </button>
          </div>

          <div class="ai-input-row">
            <input
              v-model="aiInput"
              type="text"
              class="ai-input"
              :placeholder="askAiPlaceholder"
              @keydown.enter="sendMessage()"
            />
            <button class="ai-send" :disabled="!aiInput.trim() || loading" @click="sendMessage()">
              <i class="ri-send-ins-line"></i>
            </button>
          </div>
        </template>

        <!-- Public chat -->
        <template v-else>
          <div class="pub-statusbar">
            <span class="pub-dot" :class="wsStatus" />
            <span class="pub-status-text">{{ roomName }}</span>
            <span v-if="typingSender" class="pub-typing">{{ typingSender }} {{ typingLabel }}</span>
          </div>

          <div ref="pubMessagesEl" class="ai-messages">
            <div
              v-for="msg in pubMessages"
              :key="msg.id"
              :class="['ai-msg', msg.role]"
            >
              <div class="msg-avatar" :class="msg.role">
                <RImage
                  v-if="msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system'"
                  :src="msg.role === 'user' ? profile.avatar : assistantAvatar"
                />
                <span v-else>{{ msg.role === 'admin' ? 'AD' : initialsOf(msg.senderName) }}</span>
              </div>
              <div class="ai-msg-body" :class="{ me: msg.role === 'user' }">
                <div class="msg-meta">
                  <span v-if="msg.role !== 'user'" class="msg-role-badge" :class="msg.role">{{ badgeLabel(msg.role) }}</span>
                  <span class="msg-sender">{{ displayNameFor(msg) }}</span>
                  <span v-if="msg.timestamp" class="msg-time">{{ shortTime(msg.timestamp) }}</span>
                </div>
                <div class="msg-bubble">{{ msg.content }}</div>
              </div>
            </div>

            <div v-if="isAuth && typingSender && typingSender !== myName" class="ai-msg member">
              <div class="msg-avatar member"><span>…</span></div>
              <div class="ai-msg-body">
                <div class="msg-meta">
                  <span class="msg-role-badge member">{{ badgeLabel('member') }}</span>
                  <span class="msg-sender">{{ typingSender }}</span>
                </div>
                <div class="msg-bubble typing"><span /><span /><span /></div>
              </div>
            </div>

            <div v-if="pubMessages.length === 0" class="ai-empty">{{ publicEmpty }}</div>
          </div>

          <div class="ai-quick public">
            <button v-for="q in publicQuickPrompts" :key="q" class="quick-btn" @click="sendPublicQuick(q)">
              {{ q }}
            </button>
          </div>

          <div v-if="!isAuth" class="ai-signin">
            <span><i class="ri-lock-line"></i> {{ signInToJoin }}</span>
            <button class="ai-signin-btn" @click="openLogin">{{ loginLabel }}</button>
          </div>

          <div class="ai-input-row">
            <input
              v-model="pubInput"
              type="text"
              class="ai-input"
              :placeholder="isAuth ? publicPlaceholder : signInPlaceholder"
              :disabled="!isAuth"
              @keydown.enter="sendPublic()"
            />
            <!-- :disabled="!auth.user || !pubInput.trim() || !pubConnected" -->
            <button
              class="ai-send"
              :disabled="!isAuth || !pubInput.trim()"
              @click="sendPublic()"
            >
              <i class="ri-send-ins-line"></i>
            </button>
          </div>
        </template>
      </div>
    </Transition>

    <!-- Floating button -->
    <div class="float-btn-con">
      <button
        class="ai-fab"
        :class="{ open: ui.aiAssistantOpen }"
        :aria-label="assistantLabel"
        :data-tooltip="!ui.aiAssistantOpen ? assistantLabel : undefined"
        @click="ui.toggleAIAssistant()"
      >
        <span v-if="!ui.aiAssistantOpen" class="fab-icon"><i class="ri-chat-smile-ai-3-line"></i></span>
        <i v-else class="ri-close-line"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, shallowRef, onBeforeUnmount } from 'vue'
const screen = useScreenStore()
const auth = useAuthStore()
const ui = useUIStore()
const menu = await useMenuData()
const route = useRoute()
const menuList = ref([])
const isMenuOpen = ref(false)
const expandedMobileSubs = ref([])

const accessToken = useCookie(ACCESS_COOKIE)
const userData = useUserData()
console.log("User data in chat ====================> ", userData.value)

const { t, locale } = useI18n()
const router = useRouter()
const config = useRuntimeConfig()
const isAuth = computed(() => !!accessToken.value || !!userData.value?.access_token || !!userData.value?.token)

type ChatRole = 'user' | 'assistant' | 'system' | 'admin' | 'member'
type TabMode = 'ai' | 'public'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  senderId?: number | string
  senderName?: string
  avatar?: string
  timestamp?: string
}

function pickText(obj: { en: string; km: string; zh: string }): string {
  if (locale.value === 'km') return obj.km
  if (locale.value === 'zh') return obj.zh
  return obj.en
}

const TEXT = {
  name: { en: 'Rithy AI', km: 'Rithy AI', zh: 'Rithy AI' },
  online: { en: 'Online', km: 'តាមអ៊ីនធឺណិត', zh: '在线' },
  assistant: { en: 'AI Assistant', km: 'ជំនួយការ AI', zh: 'AI 助手' },
  askAi: { en: 'Ask Rithy AI anything...', km: 'សួរ Rithy AI អ្វីក៏បាន...', zh: '向 Rithy AI 提问…' },
  tabAi: { en: 'AI Chat', km: 'AI Chat', zh: 'AI 助手' },
  tabPublic: { en: 'Public Chat', km: 'ជជែកសាធារណៈ', zh: '公共聊天' },
  roomName: { en: 'Community Chat', km: 'ជជែកសហគមន៍', zh: '社区聊天' },
  live: { en: 'Live', km: 'ផ្ទាល់', zh: '在线' },
  connecting: { en: 'Connecting…', km: 'កំពុងភ្ជាប់…', zh: '连接中…' },
  reconnecting: { en: 'Reconnecting…', km: 'កំពុងភ្ជាប់ឡើងវិញ…', zh: '重新连接…' },
  memberLabel: { en: 'Member actions', km: 'សកម្មភាពសមាជិក', zh: '会员功能' },
  publicPlaceholder: { en: 'Message the community…', km: 'ផ្ញើសារទៅសហគមន៍…', zh: '向社区发消息…' },
  signInPlaceholder: { en: 'Sign in to send a message', km: 'ចូលដើម្បីផ្ញើសារ', zh: '登录后发送消息' },
  signInToJoin: { en: 'Sign in to join the public chat', km: 'ចូលដើម្បីចូលរួមការជជែកសាធារណៈ', zh: '登录以加入公共聊天' },
  typing: { en: 'is typing…', km: 'កំពុងវាយ…', zh: '正在输入…' },
  login: { en: 'Login', km: 'ចូល', zh: '登录' },
  publicEmpty: {
    en: 'Welcome to the community chat — ask questions, share tips, and our AI or coaches will help. Be the first to say hi!',
    km: 'សូមស្វាគមន៍មកកាន់ការជជែកសហគមន៍ — សួរសំណួរ ចែករំលែកគន្លឹះ ហើយ AI ឬគ្រូរបស់យើងនឹងជួយ។ ស្វាគមន៍ទីមួយ!',
    zh: '欢迎来到社区聊天 — 提问、分享技巧，我们的 AI 或教练会提供帮助。快来第一个打招呼吧！',
  },
  adminName: { en: 'Rithy Support', km: 'Rithy Support', zh: 'Rithy 客服' },
  guestName: { en: 'Guest', km: 'ភ្ញៀវ', zh: '游客' },
  badges: {
    admin: { en: 'Admin', km: 'អ្នកគ្រប់គ្រង', zh: '管理员' },
    member: { en: 'Member', km: 'សមាជិក', zh: '会员' },
    assistant: { en: 'AI', km: 'AI', zh: 'AI' },
    system: { en: 'AI', km: 'AI', zh: 'AI' },
  },
  welcome: {
    en: "Hello! I'm Rithy AI — your guide to Rithy Martial & Fitness. Ask me about our training programs (Bokator, Kun Khmer, BJJ), the class schedule, membership pricing, or how to join!",
    km: 'សួស្តី! ខ្ញុំជា Rithy AI — អ្នកណែនាំកម្មវិធី Rithy Martial & Fitness។ សួរខ្ញុំអំពីកម្មវិធីបង្វឹក (បុកាទ័រ, គុនខ្មែរ, BJJ), តារាងពេល, តម្លៃសមាជិកភាព ឬរបៀបចូលរួម!',
    zh: '您好！我是 Rithy AI — 您的 Rithy Martial & Fitness 导航助手。我可以回答关于训练课程（斗狮拳、高棉拳、巴西柔术）、课程表、会员价格或如何加入的问题！',
  },
}

const aiName = computed(() => pickText(TEXT.name))
const onlineLabel = computed(() => pickText(TEXT.online))
const assistantLabel = computed(() => pickText(TEXT.assistant))
const askAiPlaceholder = computed(() => pickText(TEXT.askAi))
const tabAi = computed(() => pickText(TEXT.tabAi))
const tabPublic = computed(() => pickText(TEXT.tabPublic))
const roomName = computed(() => pickText(TEXT.roomName))
const liveLabel = computed(() => pickText(TEXT.live))
const connectingLabel = computed(() => pickText(TEXT.connecting))
const reconnectingLabel = computed(() => pickText(TEXT.reconnecting))
const memberLabel = computed(() => pickText(TEXT.memberLabel))
const publicPlaceholder = computed(() => pickText(TEXT.publicPlaceholder))
const signInPlaceholder = computed(() => pickText(TEXT.signInPlaceholder))
const signInToJoin = computed(() => pickText(TEXT.signInToJoin))
const typingLabel = computed(() => pickText(TEXT.typing))
const loginLabel = computed(() => pickText(TEXT.login))
const publicEmpty = computed(() => pickText(TEXT.publicEmpty))
const adminName = computed(() => pickText(TEXT.adminName))

const assistantAvatar = '/RTY_FITNESS_LOGO.jpg'

const displayName = computed(() => profile.value.name)
const myName = computed(() => profile.value.name)

const profile = computed(() => {
  if (isAuth.value) {
    return {
      name: userData.value?.name || 'Member',
      avatar: userData.value?.avatar || assistantAvatar,
    }
  }
  return {
    name: pickText(TEXT.guestName),
    avatar: assistantAvatar,
  }
})

/* ── AI tab state ─────────────────────────────────────────────────────────── */

const mode = ref<TabMode>('ai')
const aiInput = ref('')
const loading = ref(false)
const aiMessagesEl = ref<HTMLElement | null>(null)

const aiMessages = ref<ChatMessage[]>([
  {
    id: 'welcome',
    role: 'system',
    content: pickText(TEXT.welcome),
    senderName: aiName.value,
  },
])

const quickPrompts = computed(() =>
  locale.value === 'km'
    ? ['បង្ហាញកម្មវិធីបង្វឹក', 'តើតារាងថ្នាក់យ៉ាងដូចម្តេច?', 'តម្លៃសមាជិកភាពប៉ុន្មាន?', 'តើខ្ញុំចូលរួមដោយរបៀបណា?']
    : locale.value === 'zh'
      ? ['显示训练课程', '课程表是什么？', '会员费用是多少？', '我如何加入？']
      : ['Show me training programs', 'What is the class schedule?', 'How much is a membership?', 'How do I join?']
)

const memberQuickPrompts = computed(() =>
  locale.value === 'km'
    ? ['សមាជិកភាពរបស់ខ្ញុំ', 'កក់ថ្នាក់រៀន', 'បន្តផែនការរបស់ខ្ញុំ', 'និយាយជាមួយគ្រូ']
    : locale.value === 'zh'
      ? ['我的会籍', '预约课程', '续费我的套餐', '联系教练']
      : ['My membership', 'Book a class', 'Renew my plan', 'Talk to a coach']
)

/* ── Public tab state ────────────────────────────────────────────────────── */

const cfgPublic = (config.public ?? config as any) as any
const publicRoomId = String(cfgPublic?.chatRoomId || '1')

const pubInput = ref('')
const pubMessages = ref<ChatMessage[]>([])
const pubMessagesEl = ref<HTMLElement | null>(null)
const wsStatus = ref<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected')
const pubSocket = shallowRef<WebSocket | null>(null)
const typingSender = ref<string | null>(null)

let pubReconnectTimer: ReturnType<typeof setTimeout> | null = null
let pubReconnectAttempts = 0
let pubHeartbeat: ReturnType<typeof setInterval> | null = null
let typingClearTimer: ReturnType<typeof setTimeout> | null = null
let typingSendTimer: ReturnType<typeof setTimeout> | null = null
let pubAiTimer: ReturnType<typeof setTimeout> | null = null

const pubConnected = computed(() => wsStatus.value === 'connected')

const pubStatusLabel = computed(() => {
  if (wsStatus.value === 'connected') return liveLabel.value
  if (wsStatus.value === 'reconnecting') return reconnectingLabel.value
  return connectingLabel.value
})

const publicQuickPrompts = computed(() =>
  isAuth.value ? [...quickPrompts.value, ...memberQuickPrompts.value] : quickPrompts.value
)

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function initialsOf(name?: string): string {
  if (!name) return 'U'
  const parts = name.split(' ').filter(Boolean).map((n) => n[0])
  return (parts.slice(0, 2).join('') || 'U').toUpperCase()
}

function badgeLabel(role: ChatRole): string {
  if (role === 'admin') return pickText(TEXT.badges.admin)
  if (role === 'member') return pickText(TEXT.badges.member)
  return pickText(TEXT.badges.assistant)
}

function shortTime(ts?: string): string {
  if (!ts) return ''
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function displayNameFor(msg: ChatMessage): string {
  if (msg.role === 'user') return displayName.value
  return msg.senderName || (msg.role === 'admin' ? adminName.value : `Member #${msg.senderId ?? '?'}`)
}

function scrollAi() {
  nextTick(() => {
    aiMessagesEl.value?.scrollTo({ top: aiMessagesEl.value.scrollHeight, behavior: 'smooth' })
  })
}

function scrollPub() {
  nextTick(() => {
    pubMessagesEl.value?.scrollTo({ top: pubMessagesEl.value.scrollHeight, behavior: 'smooth' })
  })
}

/* ── AI auto replies (local knowledge base) ──────────────────────────────── */

const aiResponses: Record<string, { en: string; km: string; zh: string }> = {
  default: {
    en: "Great question! Rithy Martial & Fitness offers Bokator, Kun Khmer kickboxing, Yuthakram Khom, BJJ, and fighter-level strength & conditioning programs led by Master Ny Rithy. Try asking about 'programs', 'schedule', 'pricing', 'join', or our 'trainers'!",
    km: 'សួស្តី! Rithy Martial & Fitness ផ្តល់ជូនកម្មវិធី បុកាទ័រ, គុនខ្មែរ, យុទ្ធក្រមខ្មែរ, BJJ និងការពង្រឹងកម្លាំង ដឹកនាំដោយលោក នី រិទ្ធី។ សួរអំពី «programs», «schedule», «pricing», «join» ឬ «trainers»!',
    zh: '问得好！Rithy Martial & Fitness 提供斗狮拳、高棉拳、高棉武技、巴西柔术以及由 Ny Rithy 大师主导的战士级力量体能课程。您也可以问“课程”、“课表”、“价格”、“加入”或“教练”！',
  },
  programs: {
    en: 'We offer a full curriculum: Bokator (ancient Khmer martial art with animal forms & weapons), Pradal Serey / Kun Khmer kickboxing, Yuthakram Khom combat science, Brazilian Jiu-Jitsu, plus fighter-level strength & conditioning. Programs include group classes, private coaching, and athlete preparation — check the Programs page for the full breakdown.',
    km: 'យើងមានកម្មវិធីពេញលេញ៖ បុកាទ័រ (សិល្បៈចំបុយប្រយុទ្ធខ្មែរបុរាណ), ប្រាដាល់សេរី / គុនខ្មែរ, យុទ្ធក្រមខ្មែរ, BJJ និងការពង្រឹងកម្លាំង និងសម្បទានកម្រិតអ្នកច្បាំង។ រួមទាំងថ្នាក់ក្រុម ការបង្វឹកផ្ទាល់ខ្លួន និងការត្រៀមកីឡាករ។',
    zh: '我们提供完整课程：斗狮拳（古老高棉武术）、高棉拳踢拳、高棉武技、巴西柔术，以及战士级力量与体能训练。包括团体课、私人教练和运动员备战课程。',
  },
  schedule: {
    en: 'Classes run Monday to Saturday. Morning sessions are 06:00 – 08:30 AM and evening sessions 04:30 – 08:30 PM at our Phnom Penh training center. See the Schedule page for the full weekly timetable.',
    km: 'ថ្នាក់រៀនពីថ្ងៃច័ន្ទដល់ថ្ងៃសៅរ៍។ ពេលព្រឹក ០៦:០០–០៨:៣០ និងពេលល្ងាច ១៦:៣០–២០:៣០ នៅមជ្ឈមណ្ឌលបង្វឹកភ្នំពេញ។ មើលតារាងពេលពេញលេញនៅទំព័រ Schedule។',
    zh: '课程时间为周一至周六。上午 06:00–08:30，下午 16:30–20:30，地点位于金边训练中心。完整周课表请查看「课程表」页面。',
  },
  pricing: {
    en: 'Membership options: $10 drop-in pass, $65 monthly unlimited pass, or $170 3-month pass. We also offer a free trial — check the Pricing page for details and to claim your trial.',
    km: 'ជម្រើសសមាជិកភាព៖ មួយដង $10, ប្រចាំខែ $65 ឬ ៣ ខែ $170។ យើងក៏មានការហាត់សាកឥតគិតថ្លៃដែរ — មើលទំព័រ Pricing សម្រាប់ព័ត៌មានលម្អិត។',
    zh: '会员选项：单次 $10、每月无限次 $65 或 3 个月 $170。我们还提供免费试课 — 详情请查看「价格」页面。',
  },
  join: {
    en: "Joining is easy! Click 'Join Now' in the header to create an account and pick a membership plan (a free trial is available). You can also book a trial class via the Contact page or our Telegram hotline @rithymartialfitness.",
    km: 'ការចូលរួមគឺងាយស្រួល! ចុច «ចូលឥឡូវនេះ» នៅក្បាលទំព័រ ដើម្បីបង្កើតគណនី និងជ្រើសរើសផែនកម្មសមាជិកភាព (មានការហាត់សាកឥតគិតថ្លៃ)។',
    zh: '加入很简单！点击页头“立即加入”创建账户并选择会员套餐（可免费试课）。',
  },
  trainers: {
    en: 'Head coach Master Ny Rithy is a Bokator Master, Kun Khmer certified referee, and ISSA Strength & Conditioning Specialist. He is joined by Coach Marcus Chen (BJJ Black Belt) and Coach Sara Sovann. See Trainers for full profiles.',
    km: 'គ្រូឯក លោក នី រិទ្ធី គឺជាគ្រូបុកាទ័រ អាជ្ញាកណ្តាលគុនខ្មែរ និងអ្នកឯកទេស ISSA។ ព្រមទាំង គ្រូ Marcus Chen (BJJ) និង គ្រូ Sara Sovann។',
    zh: '首席教练 Ny Rithy 大师是斗狮拳大师、高棉拳认证裁判、ISSA 力量与体能专家。与他合作的还有 Marcus Chen 教练（巴西柔术黑带）和 Sara Sovann 教练。',
  },
  contact: {
    en: 'You can reach us at our Phnom Penh training center or on Telegram @rithymartialfitness / +855 12 345 678. The Contact page also has a quick inquiry form.',
    km: 'អ្នកអាចទាក់ទងយើងតាមមជ្ឈមណ្ឌលបង្វឹកភ្នំពេញ ឬ Telegram @rithymartialfitness / +855 12 345 678។',
    zh: '您可以通过金边训练中心或 Telegram @rithymartialfitness / +855 12 345 678 联系我们，联系页面也有快速咨询表单。',
  },
  memberPlan: {
    en: "You can check your membership directly from your account while signed in. To upgrade, renew, or see your plan details, open the Pricing page or your profile.",
    km: 'អ្នកអាចពិនិត្យមើលសមាជិកភាពរបស់អ្នកពីគណនីផ្ទាល់បាន នៅពេលចូល។ ដើម្បីបន្តផែនការ ឬមើលព័ត៌មានលម្អិត សូមបើកទំព័រ Pricing ឬ profile របស់អ្នក។',
    zh: '登录后即可直接从您的账户查看会籍。要续费、升级或查看套餐详情，请打开「价格」页面或个人资料。',
  },
  booking: {
    en: "Booking is easy! Open the Schedule page and pick a session, or message us on Telegram @rithymartialfitness and a coach will confirm your spot.",
    km: 'ការកក់គឺងាយស្រួល! បើកទំព័រ Schedule ហើយជ្រើសរើសថ្នាក់ ឬផ្ញើសារមក Telegram @rithymartialfitness គ្រូនឹងបញ្ជាក់កន្លែងរបស់អ្នក។',
    zh: '预约很简单！打开「课程表」页面选择课程，或通过 Telegram @rithymartialfitness 联系我们，教练会为您确认位置。',
  },
  renew: {
    en: "To renew, sign in, open the Pricing page and pick your plan again — your pass reactivates as soon as payment is confirmed.",
    km: 'ដើម្បីបន្ត សូមចូល បើកទំព័រ Pricing ហើយជ្រើសរើសផែនការរបស់អ្នកម្តងទៀត — វានឹងដំណើរការភ្លាមៗនៅពេលបញ្ជាក់ការទូទាត់។',
    zh: '要续费，请登录后打开「价格」页面重新选择套餐 — 支付确认后您的会籍立即恢复。',
  },
  coach: {
    en: "I've flagged this for our team — a coach or admin will reply to you here shortly. For urgent help, message us on Telegram @rithymartialfitness.",
    km: 'ខ្ញុំបានរាយការណ៍រឿងនេះទៅក្រុមរបស់យើង — គ្រូ ឬអ្នកគ្រប់គ្រង នឹងឆ្លើយតបអ្នកនៅទីនេះឆាប់ៗ។ សម្រាប់ជំនួយបន្ទាន់ សូមផ្ញើសារមក Telegram @rithymartialfitness។',
    zh: '我已将此事转达给我们的团队 — 教练或管理员会尽快在此回复您。如有紧急问题，请通过 Telegram @rithymartialfitness 联系我们。',
  },
}

const getResponse = (q: string): string => {
  const lower = q.toLowerCase()
  if (/(renew|renewal|extend my|បន្ត|续费|продолжить)/.test(lower)) return pickText(aiResponses.renew)
  if (/(my membership|\bmy plan\b|my account|check my|plan status|upgrade my|\bupgrade\b|សមាជិកភាពរបស់ខ្ញុំ|我的会籍|我的套餐)/.test(lower)) return pickText(aiResponses.memberPlan)
  if (/(\bbook\b|booking|reserve|sign.?up for a (class|session|trial)|schedule (a|my) (class|session)|កក់|预约|预订)/.test(lower)) return pickText(aiResponses.booking)
  if (/(\btalk to\b|speak (to|with)|human|admin|coach support|connect.*coach|need help from|និយាយជាមួយគ្រូ|联系教练)/.test(lower)) return pickText(aiResponses.coach)
  if (/(schedule|timetable|class time|when is|what time|\bwhen\b|ថ្នាក់|ពេល|课程表|课表|时间)/.test(lower)) return pickText(aiResponses.schedule)
  if (/(price|cost|pricing|membership|plan|pass|trial|drop|monthly|\$|\bhow much\b|ថ្លៃ|សមាជិក|价格|费用|月卡|试课)/.test(lower)) return pickText(aiResponses.pricing)
  if (/(\bjoin\b|register|sign\s?up|enroll|become a member|ចូលរួម|加入)/.test(lower)) return pickText(aiResponses.join)
  if (/(bokator|kun khmer|bjj|brazil|yuthakram|pradal|serey|strength|condition|program|course|\bclass\b|train|បុកាទ័រ|គុនខ្មែរ|斗狮拳|高棉拳|巴西|课程|训练)/.test(lower)) return pickText(aiResponses.programs)
  if (/(trainer|coach|master|instructor|rithy|marcus|sara|គ្រូ|教练)/.test(lower)) return pickText(aiResponses.trainers)
  if (/(contact|phone|telegram|location|address|where|direction|អាសយដ្ឋាន|ទូរស័ព្ទ|联系|电话|位置|地址)/.test(lower)) return pickText(aiResponses.contact)
  return pickText(aiResponses.default)
}

function getReplyRole(q: string): ChatRole {
  const lower = q.toLowerCase()
  if (/(\btalk to\b|speak (to|with)|human|admin|coach support)/.test(lower)) return 'admin'
  return 'assistant'
}

/* ── AI chat: send / auto reply ──────────────────────────────────────────── */

function pushAiReply(content: string, role: ChatRole = 'assistant') {
  aiMessages.value.push({
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    senderId: role === 'admin' ? 'admin' : undefined,
    senderName: role === 'admin' ? adminName.value : aiName.value,
  })
}

const sendMessage = async (text?: string) => {
  const content = text ?? aiInput.value.trim()
  if (!content || loading.value) return

  aiMessages.value.push({ id: `me-${Date.now()}`, role: 'user', content, senderName: displayName.value })
  aiInput.value = ''
  loading.value = true

  scrollAi()

  try {
    const { data, error } = await useWeb<any>('api/ai/chat', {
      method: 'POST',
      data: {
        message: content,
        history: aiMessages.value.slice(0, -1),
        user: isAuth
          ? { id: userData.value?.id, name: userData.value?.name, email: userData.value?.email }
          : null,
      },
    })

    const reply = error.value ? null : (data.value?.reply ?? data.value?.data?.reply)
    if (reply) {
      const replyRole: ChatRole =
        data.value?.role === 'admin' || data.value?.data?.role === 'admin'
          ? 'admin'
          : 'assistant'
      pushAiReply(String(reply), replyRole)
    } else {
      throw new Error('API failed')
    }
  } catch {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600))
    pushAiReply(getResponse(content), getReplyRole(content))
  }

  loading.value = false
  scrollAi()
}

/* ── Public chat: WebSocket ──────────────────────────────────────────────── */

function buildWsUrl(): string {
  const rawWsBase = cfgPublic?.wsBase || 'ws://localhost:58721/ws'
  const baseUrl = String(rawWsBase).replace(/\/+$/, '')
  const wsRoot = baseUrl.endsWith('/ws') ? baseUrl : `${baseUrl}/ws`
  const token = auth.token || (typeof useCookie !== 'undefined' ? useCookie<string | null>('access_token').value : null) || ''
  const qs = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${wsRoot}/chat/${publicRoomId}${qs}`
}

function connectPublic() {
  if (typeof window === 'undefined') return
  if (pubSocket.value && (pubSocket.value.readyState === WebSocket.OPEN || pubSocket.value.readyState === WebSocket.CONNECTING)) return

  wsStatus.value = pubReconnectAttempts > 0 ? 'reconnecting' : 'connecting'

  try {
    const ws = new WebSocket(buildWsUrl())
    pubSocket.value = ws

    ws.onopen = () => {
      wsStatus.value = 'connected'
      pubReconnectAttempts = 0
      startHeartbeat()
    }

    ws.onmessage = (event) => {
      let data: any
      try {
        data = JSON.parse(event.data)
      } catch {
        return
      }
      if (!data || typeof data !== 'object') return
      handlePubPayload(data)
    }

    ws.onerror = () => {
      wsStatus.value = 'disconnected'
    }

    ws.onclose = () => {
      wsStatus.value = 'disconnected'
      stopHeartbeat()
      schedulePubReconnect()
    }
  } catch {
    wsStatus.value = 'disconnected'
    schedulePubReconnect()
  }
}

function disconnectPublic() {
  stopHeartbeat()
  if (pubReconnectTimer) {
    clearTimeout(pubReconnectTimer)
    pubReconnectTimer = null
  }
  if (pubSocket.value) {
    try {
      pubSocket.value.close()
    } catch {
      /* noop */
    }
    pubSocket.value = null
  }
  wsStatus.value = 'disconnected'
}

function startHeartbeat() {
  stopHeartbeat()
  pubHeartbeat = setInterval(() => {
    wsSend({ type: 'ping', timestamp: new Date().toISOString() })
  }, 20000)
}

function stopHeartbeat() {
  if (pubHeartbeat) {
    clearInterval(pubHeartbeat)
    pubHeartbeat = null
  }
}

function schedulePubReconnect() {
  if (pubReconnectTimer) clearTimeout(pubReconnectTimer)
  const delay = Math.min(1000 * Math.pow(2, pubReconnectAttempts), 15000)
  pubReconnectAttempts++
  pubReconnectTimer = setTimeout(() => {
    connectPublic()
  }, delay)
}

function wsSend(payload: any): boolean {
  const ws = pubSocket.value
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload))
    return true
  }
  return false
}

/* ── Public chat: messages ───────────────────────────────────────────────── */

function normalizePubMessage(m: any): ChatMessage {
  const senderId = m.sender_id
  const isMe = senderId != null && myUserId.value != null && Number(senderId) === myUserId.value
  const role: ChatRole = isMe ? 'user' : m.role === 'admin' ? 'admin' : m.role === 'system' ? 'system' : 'member'
  return {
    id: `pub-${m.message_id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`}`,
    role,
    content: String(m.content ?? ''),
    senderId,
    senderName: isMe ? displayName.value : (m.sender_name || (m.role === 'system' ? aiName.value : `Member #${senderId ?? '?'}`)),
    avatar: m.sender_avatar || undefined,
    timestamp: m.timestamp,
  }
}

const myUserId = computed(() => (userData.value?.id ? Number(userData.value?.id) : null))

function mergePubMessages(msgs: any[]) {
  const seen = new Set(pubMessages.value.map((m) => m.id))
  const fresh = msgs
    .filter((m) => m && typeof m.content === 'string')
    .map(normalizePubMessage)
    .filter((m) => !seen.has(m.id))
  if (fresh.length) {
    pubMessages.value = [...fresh, ...pubMessages.value]
    scrollPub()
  }
}

function handlePubPayload(data: any) {
  if (data.type === 'pong' || data.type === 'ping' || data.type === 'connected') return

  if (data.type === 'history') {
    if (Array.isArray(data.messages)) mergePubMessages(data.messages)
    return
  }

  if (data.type === 'typing') {
    const name = data.sender_name && data.sender_name !== 'Guest' ? data.sender_name : `Member #${data.sender_id ?? '?'}`
    typingSender.value = name
    if (typingClearTimer) clearTimeout(typingClearTimer)
    typingClearTimer = setTimeout(() => {
      typingSender.value = null
    }, 3000)
    return
  }

  if (data.type === 'message') {
    pubMessages.value.push(normalizePubMessage(data))
    scrollPub()
  }
}

function schedulePublicAiReply(content: string) {
  if (pubAiTimer) clearTimeout(pubAiTimer)
  pubAiTimer = setTimeout(() => {
    pubMessages.value.push({
      id: `sys-${Date.now()}`,
      role: 'system',
      content: getResponse(content),
      senderName: aiName.value,
    })
    scrollPub()
  }, 900 + Math.random() * 600)
}

const sendPublic = (text?: string) => {
  const content = (text ?? pubInput.value).trim()
  if (!content) return
  if (!isAuth.value) {
    openLogin()
    return
  }
  if (!pubConnected) return

  wsSend({ type: 'message', content })
  pubInput.value = ''
  if (typingSendTimer) {
    clearTimeout(typingSendTimer)
    typingSendTimer = null
  }
  schedulePublicAiReply(content)
  scrollPub()
}

const sendPublicQuick = (q: string) => {
  if (isNotEmpty(isAuth.value)) {
    sendPublic(q)
    return
  }
  pubMessages.value.push({
    id: `my-${Date.now()}`,
    role: 'user',
    content: q,
    senderName: profile.value.name,
    avatar: profile.value.avatar,
  })
  schedulePublicAiReply(q)
  scrollPub()
}

watch(pubInput, () => {
  if (!isAuth || !pubConnected) return
  if (typingSendTimer) clearTimeout(typingSendTimer)
  typingSendTimer = setTimeout(() => {
    wsSend({ type: 'typing' })
  }, 300)
})

/* ── Lifecycle / wiring ──────────────────────────────────────────────────── */

function setMode(m: TabMode) {
  mode.value = m
}

function openLogin() {
  router.push({ query: { auth: 'login' } })
}

watch(() => ui.aiAssistantOpen, (open) => {
  if (!import.meta.client) return
  if (open && mode.value === 'public') connectPublic()
  else if (!open) disconnectPublic()
})

watch(mode, (m) => {
  if (!import.meta.client) return
  if (m === 'public' && ui.aiAssistantOpen) connectPublic()
  else if (m !== 'public') disconnectPublic()
})

watch(() => auth.token, () => {
  if (!import.meta.client) return
  if (mode.value === 'public' && ui.aiAssistantOpen) {
    disconnectPublic()
    connectPublic()
  }
})

watch(locale, () => {
  if (aiMessages.value[0]?.id === 'welcome') {
    aiMessages.value[0] = {
      id: 'welcome',
      role: 'system',
      content: pickText(TEXT.welcome),
      senderName: aiName.value,
    }
  }
})

onBeforeUnmount(() => {
  disconnectPublic()
  if (typingClearTimer) clearTimeout(typingClearTimer)
  if (typingSendTimer) clearTimeout(typingSendTimer)
  if (pubAiTimer) clearTimeout(pubAiTimer)
})
</script>

<style scoped lang="scss">
.ai-float-root {
  position: fixed;
  bottom: 24px;
  right: 1.5rem;
  z-index: 180;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;

  @media (max-width: 768px) {
    right: auto;
    left: 1.5rem;
    align-items: flex-start;
  }
}

.float-btn-con{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  gap: 0;
  padding: 5px;
  background: transparent;
  border: 1px solid var(--c-bg);
  border-radius: 99px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 20px;

  @media (max-width: 768px) {
    animation: none !important;
  }
}

.ai-fab {
  width: 52px !important;
  height: 52px !important;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold));
  border: none;
  color: var(--c-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 5px rgba(200, 149, 28, 0.4);
  transition: all var(--transition);
  animation: none;

  .fab-icon {
    font-size: 20px;
    line-height: 1;
  }

  // &:hover {
  //   // transform: translateY(-2px) scale(1.08);
  //   // box-shadow: 0 20px 30px rgba(200, 149, 28, 0.5);
  //   border: 1px solid var(--c-border);
  //   animation-play-state: paused;
  // }

  &.open {
    animation: none;
    background: var(--color-gold);
  }

  @media (max-width: 768px) {
    width: 30px !important;
    height: 30px !important;
    border-radius: 50%;
    background: var(--primary-color) !important;
    border: none;
    font-size: 15px;
    cursor: pointer;
    transition: none;
    overflow: hidden;
    opacity: 1;
    transform: scale(1);
    flex-shrink: 0;
    box-shadow: none !important;
    animation: none !important;

    &.open {
      animation: none;
      background: var(--color-gold) !important;
    }

    .fab-icon {
      font-size: 1.1rem;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.ai-panel {
  z-index: 9999;
  width: 340px;
  height: 500px;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 480px) {
    width: calc(100vw - 3rem);
    height: 440px;
  }
}

.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem 0.6rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, rgba(200, 149, 28, 0.08), transparent);

  .ai-name { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); }
}

.ai-header-left { display: flex; align-items: center; gap: 0.75rem; }

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: var(--font-display);
  font-size: 1rem;
  overflow: hidden;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  color: #38a169;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38a169;
  animation: pulse 2s ease-in-out infinite;

  &.busy { background: #d97706; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  30% { opacity: 0.4; }
}

.ai-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px !important;
  height: 28px !important;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition);
  &:hover { background: var(--color-bg-secondary); color: var(--color-text-primary); }
}

.ai-tabbar {
  display: flex;
  gap: 4px;
  padding: 0 1rem;
  border-bottom: 1px solid var(--color-border);
}

.ai-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.45rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition);

  i { font-size: 0.95rem; }

  &:hover { color: var(--color-text-primary); }

  &.active {
    color: var(--color-gold);
    border-bottom-color: var(--color-gold);
  }
}

.pub-statusbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  font-size: 0.72rem;
  color: var(--color-text-secondary);
}

.pub-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d97706;
  flex-shrink: 0;

  &.connected { background: #38a169; box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.18); }
}

.pub-status-text { font-weight: 600; color: var(--color-text-primary); }

.pub-typing {
  margin-left: auto;
  color: var(--color-text-muted);
  font-style: italic;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.ai-msg {
  display: flex;
  gap: 0.625rem;
  align-items: flex-end;

  &.user {
    flex-direction: row-reverse;

    .msg-bubble {
      background: var(--color-gold);
      color: #fff;
      border-radius: 18px 18px 4px 18px;
    }
  }

  &.assistant .msg-bubble,
  &.system .msg-bubble {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    border-radius: 18px 18px 18px 4px;
  }

  &.admin .msg-bubble {
    background: rgba(225, 29, 72, 0.1);
    color: var(--color-text-primary);
    border: 1px solid rgba(225, 29, 72, 0.18);
    border-radius: 18px 18px 18px 4px;
  }

  &.member .msg-bubble {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    border-radius: 18px 18px 18px 4px;
  }
}

.ai-msg-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 240px;

  &.me { align-items: flex-end; }
}

.msg-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.65rem;
  color: var(--color-text-muted);
  line-height: 1.2;
}

.msg-role-badge {
  flex-shrink: 0;
  padding: 1px 6px;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 99px;

  &.system, &.assistant {
    background: rgba(200, 149, 28, 0.14);
    color: var(--color-gold);
  }

  &.admin {
    background: rgba(225, 29, 72, 0.12);
    color: #e11d48;
  }

  &.member {
    background: rgba(55, 65, 81, 0.1);
    color: var(--color-text-secondary);
  }
}

.msg-sender { font-weight: 600; color: var(--color-text-secondary); }
.msg-time { opacity: 0.7; }

.msg-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: var(--font-display);
  font-size: 0.75rem;
  flex-shrink: 0;
  overflow: hidden;

  &.admin {
    background: linear-gradient(135deg, #e11d48, #be123c);
    font-size: 0.62rem;
  }

  &.member {
    background: linear-gradient(135deg, #475569, #334155);
    font-size: 0.62rem;
  }
}

.msg-bubble {
  max-width: 240px;
  padding: 0.625rem 0.875rem;
  font-size: 0.8125rem;
  line-height: 1.55;

  &.typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0.75rem 1rem;

    span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-text-muted);
      animation: bounce 1.2s ease-in-out infinite;

      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.ai-empty {
  margin: auto;
  padding: 1.5rem;
  text-align: center;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--color-text-muted);
}

.ai-quick {
  padding: 0 0.875rem 0.625rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;

  &.member {
    padding-top: 0;
    border-top: 1px dashed var(--color-border);
  }

  &.public { padding-top: 0.6rem; border-top: 1px solid var(--color-border); }
}

.quick-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0.1rem 0;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-gold);

  i { font-size: 0.8rem; }
}

.quick-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition);

  &:hover {
    border-color: var(--color-gold);
    color: var(--color-gold);
    background: rgba(200, 149, 28, 0.06);
  }
}

.ai-signin {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0 0.875rem 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px dashed var(--color-gold);
  border-radius: 12px;
  background: rgba(200, 149, 28, 0.05);
  font-size: 0.75rem;
  color: var(--color-text-secondary);

  i { color: var(--color-gold); }
}

.ai-signin-btn {
  flex-shrink: 0;
  padding: 0.3rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 600;
  border: none;
  border-radius: 99px;
  background: var(--color-gold);
  color: #fff;
  cursor: pointer;
  transition: all var(--transition);

  &:hover { filter: brightness(1.08); }
}

.ai-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.ai-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition);

  &:focus { border-color: var(--color-gold); }
  &::placeholder { color: var(--color-text-muted); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.ai-send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-gold);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
  flex-shrink: 0;

  &:hover:not(:disabled) { background: var(--color-gold); transform: scale(1.05); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.ai-panel-enter-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.ai-panel-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.ai-panel-enter-from   { opacity: 0; transform: translateY(20px) scale(0.95); }
.ai-panel-leave-to     { opacity: 0; transform: translateY(10px) scale(0.97); }
</style>