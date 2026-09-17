<template>
  <div class="ai-float-root">
    <!-- Chat panel -->
    <Transition name="ai-panel">
      <div v-if="ui.aiAssistantOpen" class="ai-panel">
        <div class="ai-panel-header">
          <div class="ai-header-left">
            <div class="ai-avatar"><RAImage src="/RTY_FITNESS_LOGO.jpg" /></div>
            <div>
              <p class="ai-name">{{ aiName }}</p>
              <p class="ai-status">
                <span class="status-dot" />
                {{ onlineLabel }}
              </p>
            </div>
          </div>
          <button class="ai-close" @click="ui.aiAssistantOpen = false" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div ref="messagesEl" class="ai-messages">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="['ai-msg', msg.role]"
          >
            <div class="msg-avatar">
              <RAImage :src="msg.role === 'user' ? profile.avatar : assistantAvatar" />
            </div>
            <div class="msg-bubble">{{ msg.content }}</div>
          </div>

          <div v-if="loading" class="ai-msg assistant">
            <div class="msg-avatar"><RAImage :src="assistantAvatar" /></div>
            <div class="msg-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <!-- Quick prompts -->
        <div v-if="messages.length <= 1" class="ai-quick">
          <button v-for="q in quickPrompts" :key="q" class="quick-btn" @click="sendMessage(q)">
            {{ q }}
          </button>
        </div>

        <div class="ai-input-row">
          <input
            v-model="input"
            type="text"
            class="ai-input"
            :placeholder="askAiPlaceholder"
            @keydown.enter="sendMessage()"
          />
          <button class="ai-send" :disabled="!input.trim() || loading" @click="sendMessage()">
            <i class="ri-send-ins-line"></i>
          </button>
        </div>
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
const { t, locale } = useI18n()
const ui = useUIStore()
const auth = useAuthStore()

interface Message { role: 'user' | 'assistant'; content: string }

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

const assistantAvatar = '/RTY_FITNESS_LOGO.jpg'

const messages = ref<Message[]>([
  {
    role: 'assistant',
    content: pickText(TEXT.welcome),
  },
])

const input = ref('')
const loading = ref(false)
const messagesEl = ref<HTMLElement | null>(null)

const profile = computed(() => {
  if (auth.user) {
    return {
      name: auth.user.name,
      avatar: auth.user.avatar || assistantAvatar,
    }
  }
  return {
    name: 'Guest',
    avatar: assistantAvatar,
  }
})

const quickPrompts = computed(() =>
  locale.value === 'km'
    ? ['បង្ហាញកម្មវិធីបង្វឹក', 'តើតារាងថ្នាក់យ៉ាងដូចម្តេច?', 'តម្លៃសមាជិកភាពប៉ុន្មាន?', 'តើខ្ញុំចូលរួមដោយរបៀបណា?']
    : locale.value === 'zh'
      ? ['显示训练课程', '课程表是什么？', '会员费用是多少？', '我如何加入？']
      : ['Show me training programs', 'What is the class schedule?', 'How much is a membership?', 'How do I join?']
)

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
}

const getResponse = (q: string): string => {
  const lower = q.toLowerCase()
  if (/(schedule|timetable|class time|when is|what time|\bwhen\b|ថ្នាក់|ពេល|课程表|课表|时间)/.test(lower)) return pickText(aiResponses.schedule)
  if (/(price|cost|pricing|membership|plan|pass|trial|drop|monthly|\$|\bhow much\b|ថ្លៃ|សមាជិក|价格|费用|月卡|试课)/.test(lower)) return pickText(aiResponses.pricing)
  if (/(\bjoin\b|register|sign\s?up|enroll|become a member|ចូលរួម|加入)/.test(lower)) return pickText(aiResponses.join)
  if (/(bokator|kun khmer|bjj|brazil|yuthakram|pradal|serey|strength|condition|program|course|\bclass\b|train|បុកាទ័រ|គុនខ្មែរ|斗狮拳|高棉拳|巴西|课程|训练)/.test(lower)) return pickText(aiResponses.programs)
  if (/(trainer|coach|master|instructor|rithy|marcus|sara|គ្រូ|教练)/.test(lower)) return pickText(aiResponses.trainers)
  if (/(contact|phone|telegram|location|address|where|direction|អាសយដ្ឋាន|ទូរស័ព្ទ|联系|电话|位置|地址)/.test(lower)) return pickText(aiResponses.contact)
  return pickText(aiResponses.default)
}

const sendMessage = async (text?: string) => {
  const content = text ?? input.value.trim()
  if (!content || loading.value) return

  messages.value.push({ role: 'user', content })
  input.value = ''
  loading.value = true

  await nextTick()
  messagesEl.value?.scrollTo({ top: messagesEl.value.scrollHeight, behavior: 'smooth' })

  try {
    // API Call Integration
    const { data, error } = await useWeb<any>('api/ai/chat', {
      method: 'POST',
      data: {
        message: content,
        history: messages.value.slice(0, -1),
        user: auth.user
          ? { id: auth.user.id, name: auth.user.name, email: auth.user.email }
          : null,
      },
    })

    const reply = error.value ? null : (data.value?.reply ?? data.value?.data?.reply)
    if (reply) {
      messages.value.push({ role: 'assistant', content: String(reply) })
    } else {
      throw new Error('API failed')
    }
  } catch {
    // Fallback to default RTY Fitness responses if API fails or doesn't exist
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600))
    messages.value.push({ role: 'assistant', content: getResponse(content) })
  }

  loading.value = false

  await nextTick()
  messagesEl.value?.scrollTo({ top: messagesEl.value.scrollHeight, behavior: 'smooth' })
}
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
  border: 1px solid var(--glass-border);
  border-radius: 99px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

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
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(200, 149, 28, 0.4);
  transition: all var(--transition);
  animation: none;

  .fab-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  &:hover {
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 8px 32px rgba(200, 149, 28, 0.5);
    animation-play-state: paused;
  }

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
  width: 340px;
  height: 480px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 480px) {
    width: calc(100vw - 3rem);
    height: 420px;
  }
}

.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem 0.875rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, rgba(200, 149, 28, 0.08), transparent);
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

.ai-name { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); }
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

  &.assistant .msg-bubble {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    border-radius: 18px 18px 18px 4px;
  }
}

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

.ai-quick {
  padding: 0 0.875rem 0.625rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
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