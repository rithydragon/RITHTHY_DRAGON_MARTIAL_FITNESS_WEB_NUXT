<template>
  <div class="detail-page section">
    <div class="container">
      <div class="detail-page__nav" data-animate="fade">
        <RLink to="/services" class="btn btn--outline btn--sm">
          <i class="ri-arrow-left-line"></i> {{ t('common.close') || 'Back to Services' }}
        </RLink>
      </div>

      <div v-if="item" class="detail-page__card" data-animate="slide-up">
        <div class="detail-page__hero">
          <img :src="item.image || item.cover || fallbackImage" :alt="getTitle(item)" class="detail-page__image" />
          <div class="detail-page__overlay">
            <span class="detail-page__badge">{{ item.category || 'Combat & Fitness' }}</span>
            <h1 class="detail-page__title">{{ getTitle(item) }}</h1>
          </div>
        </div>

        <div class="detail-page__content">
          <div class="detail-page__grid">
            <div class="detail-page__main" data-animate="slide-right">
              <h2 class="detail-page__subtitle">Overview & Highlights</h2>
              <p class="detail-page__desc">{{ getDesc(item) }}</p>

              <div v-if="item.highlights && item.highlights.length > 0" class="detail-page__highlights">
                <h3>Key Training Focus</h3>
                <ul>
                  <li v-for="(hl, idx) in item.highlights" :key="idx">
                    <i class="ri-checkbox-circle-line"></i> {{ getHighlightText(hl) }}
                  </li>
                </ul>
              </div>

              <div v-if="item.curriculum && item.curriculum.length > 0" class="detail-page__curriculum">
                <h3>Class Syllabus</h3>
                <div v-for="(step, idx) in item.curriculum" :key="idx" class="curriculum-step">
                  <span class="step-num">0{{ idx + 1 }}</span>
                  <div class="step-body">
                    <h4>{{ getTitle(step) }}</h4>
                    <p>{{ getDesc(step) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-page__sidebar" data-animate="slide-left" data-delay="200">
              <div class="sidebar-box">
                <h3>Class Information</h3>
                <ul class="sidebar-meta">
                  <li>
                    <i class="ri-user-star-line"></i>
                    <div>
                      <span class="label">Lead Instructor</span>
                      <span class="val">{{ item.instructor || 'Master Ny Rithy' }}</span>
                    </div>
                  </li>
                  <li>
                    <i class="ri-bar-chart-line"></i>
                    <div>
                      <span class="label">Skill Level</span>
                      <span class="val">{{ item.level || 'All Skill Levels' }}</span>
                    </div>
                  </li>
                  <li>
                    <i class="ri-time-line"></i>
                    <div>
                      <span class="label">Duration</span>
                      <span class="val">{{ item.duration || '60 - 90 Minutes' }}</span>
                    </div>
                  </li>
                  <li>
                    <i class="ri-map-pin-line"></i>
                    <div>
                      <span class="label">Location</span>
                      <span class="val">Main Dojo — Phnom Penh</span>
                    </div>
                  </li>
                </ul>

                <div class="sidebar-cta">
                  <RLink to="/contact" class="btn btn--primary btn--full">
                    Book Free Trial Pass
                  </RLink>
                  <RLink to="/schedule" class="btn btn--outline btn--full">
                    View Timetable
                  </RLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="detail-page__empty" data-animate="fade">
        <h2>Program Detail Not Found</h2>
        <p>The requested training program or item details could not be found.</p>
        <RLink to="/services" class="btn btn--primary">View All Services</RLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import gymData from '~/assets/json/gymData.json'

const route = useRoute()
const { t, locale } = useI18n()
const { tBy } = useTBy()

const fallbackImage = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop'

const slugParam = computed(() => {
  return (route.params.slug || '').toLowerCase()
})

const datasetMap = {
  bokator: {
    id: 'bokator',
    title: { en: 'Ancient Khmer Bokator', km: 'ក្បាច់គុនបុរាណខ្មែរបុកាទ័រ', zh: '古高棉斗狮拳' },
    category: 'UNESCO Martial Art Heritage',
    desc: {
      en: 'Bokator is Cambodia’s 1,000-year-old warrior combat system featuring 341 animal forms, elbow strikes, knee traps, joint locks, and traditional bamboo weapons.',
      km: 'បុកាទ័រគឺជាប្រព័ន្ធប្រយុទ្ធអ្នកច្បាំងខ្មែរអាយុ ១,០០០ ឆ្នាំ ដោយមានទម្រង់សត្វ ៣៤១ ក្បាច់ កែង ជង្គង់ ការចាក់កៀប និងអាវុធបុរាណ។',
      zh: '斗狮拳是柬埔寨拥有1000年历史的战士格斗系统，具有341种动物象形动作、肘击、膝捕、关节锁与传统武器。'
    },
    image: 'https://images.pexels.com/photos/7045699/pexels-photo-7045699.jpeg',
    instructor: 'Master Ny Rithy',
    level: 'Beginner to Master',
    duration: '90 Minutes',
    highlights: [
      { en: '341 Animal Stretches & Combat Stances', km: 'ក្បាច់សត្វ ៣៤១ ប្រភេទ', zh: '341种动物象形拳法' },
      { en: 'Short Stick (Dambong Short) & Staff Mastery', km: 'ការប្រើប្រាស់ដំបងខ្លី និងដំបងវែង', zh: '短棍与长棍器械练习' },
      { en: 'Traditional Krama & Belt Progression', km: 'ប្រព័ន្ធក្រមា និងការឡើងក្រវាត់', zh: '水布传统升段体系' }
    ],
    curriculum: [
      { title: { en: 'Phase 1: Animal Stances & Stretches', km: 'វគ្គ ១៖ ជំហរ និងក្បាច់សត្វ', zh: '阶段一：动物步法与拉伸' }, desc: { en: 'Build joint mobility, lion & monkey stances, and basic blocking.', km: 'ពង្រឹងភាពបត់បែនរួម ជំហរសត្វ និងការរាំងខ្ទប់។', zh: '构建关节活动度、狮形与猴形步法。' } },
      { title: { en: 'Phase 2: Eight-Limb Combat Drills', km: 'វគ្គ ២៖ ការវាយប្រយុទ្ធអវយវៈទាំង ៨', zh: '阶段二：八肢打击对抗' }, desc: { en: 'Elbow traps, flying knees, and takedowns.', km: 'ការទប់កែង ជង្គង់ហោះ និងការផ្តួល។', zh: '肘击、飞膝与摔法缠斗。' } }
    ]
  },
  'kun-khmer': {
    id: 'kun-khmer',
    title: { en: 'Kun Khmer Kickboxing (Pradal Serey)', km: 'គុនខ្មែរ (ប្រាដាល់សេរី)', zh: '高棉拳 (Pradal Serey)' },
    category: 'Full-Contact Combat',
    desc: {
      en: 'Kun Khmer is Cambodia’s legendary kickboxing discipline emphasizing devastating elbow strikes, low roundhouse kicks, clinching control, and explosive ring stamina.',
      km: 'គុនខ្មែរគឺជាកីឡាប្រដាល់សេរីដ៏ល្បីល្បាញរបស់កម្ពុជា ផ្តោតលើការវាយកែង កាត់ទាប ការគ្រប់គ្រងក្នុងកៀប និងភាពស៊ូទ្រាំលើសង្វៀន។',
      zh: '高棉拳是柬埔寨传奇的全接触踢拳项目，侧重毁灭性的肘击、低扫腿、内围缠斗与爆发出色的擂台体能。'
    },
    image: 'https://images.pexels.com/photos/4753986/pexels-photo-4753986.jpeg',
    instructor: 'Master Ny Rithy & Kru Sovann',
    level: 'Intermediate & Fighter Prep',
    duration: '75 Minutes',
    highlights: [
      { en: 'Elbow & Knee Strike Mechanics', km: 'បច្ចេកទេសវាយកែង និងជង្គង់', zh: '肘击与膝击发力原理' },
      { en: 'Heavy Bag & Pad Conditioning', km: 'ការហាត់ស៊ីល និងប៉ាត់កម្លាំង', zh: '重沙袋与手靶体能强化' },
      { en: 'Clinching & Sweeps Mastery', km: 'ការចាត់កៀប និងការបោសជើង', zh: '内围缠斗与扫腿摔法' }
    ]
  },
  bjj: {
    id: 'bjj',
    title: { en: 'Brazilian Jiu-Jitsu & Submission Grappling', km: 'យូយីតស៊ូប្រេស៊ីល (BJJ)', zh: '巴西柔术与缠斗' },
    category: 'Ground Fighting Science',
    desc: {
      en: 'Master position control, guard passes, joint locks, choke submissions, and defensive leverage built for both sports competition and street self-defense.',
      km: 'ម្ចាស់លើការគ្រប់គ្រងទីតាំង ការរំលងឆ្មាំ ការចាក់កៀប និងការច្របាច់ក សម្រាប់ការប្រកួត និងការការពារខ្លួន។',
      zh: '掌控位置控制、过护卫、关节锁与窒息降服，适用于竞技与实用自卫。'
    },
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop',
    instructor: 'Coach Marcus Chen (Black Belt)',
    level: 'All Levels',
    duration: '90 Minutes',
    highlights: [
      { en: 'Gi & No-Gi Technical Sparring', km: 'ការហាត់ប្រយុទ្ធ Gi និង No-Gi', zh: '道服与无道服实战' },
      { en: 'Guard Passing & Sweeps', km: 'ការរំលងឆ្មាំ និងការបកប្រែទីតាំង', zh: '过护卫与扫翻' },
      { en: 'Joint Locks & Choke Holds', km: 'ការកៀបរួម និងការច្របាច់ក', zh: '关节锁与窒息降服' }
    ]
  },
  strength: {
    id: 'strength',
    title: { en: 'High-Performance Athletic Conditioning', km: 'ការហ្វឹកហាត់កម្លាំង និងកាយសម្បទា', zh: '高性能力量与体能' },
    category: 'Functional Fitness',
    desc: {
      en: 'Build explosive power, core endurance, agility, and joint resilience using kettlebells, barbell lifts, plyometrics, and combat conditioning drills.',
      km: 'បង្កើតថាមពលផ្ទុះ ភាពស៊ូទ្រាំស្នូល និងភាពរហ័សរហួន ដោយប្រើប្រាស់ kettlebells និងការលើកទម្ងន់។',
      zh: '利用壶铃、杠铃举重、增强式训练与格斗体能练习，构建爆发力、核心耐力与敏捷度。'
    },
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    instructor: 'Coach Sara Sovann (ISSA Certified)',
    level: 'All Levels',
    duration: '60 Minutes',
    highlights: [
      { en: 'Olympic Lifts & Functional Strength', km: 'ការលើកដុំដែក និងកម្លាំងមុខងារ', zh: '奥林匹克举重与功能性力量' },
      { en: 'Core Explosiveness & Stamina', km: 'ថាមពលស្នូល និងភាពស៊ូទ្រាំ', zh: '核心爆发力与心肺耐力' },
      { en: 'Injury Prevention & Recovery', km: 'ការការពាររបួស និងការស្តារកម្លាំង', zh: '伤病预防与恢复' }
    ]
  }
}

const item = computed(() => {
  const slug = slugParam.value
  if (datasetMap[slug]) return datasetMap[slug]

  // Check gymData services / blogs safely
  if (Array.isArray(gymData.services)) {
    const found = gymData.services.find((s) => s?.id === slug)
    if (found) return found
  }

  // Fallback safe mock object
  return {
    id: slug,
    title: { en: `${slug.toUpperCase()} Training Program`, km: `កម្មវិធីហ្វឹកហាត់ ${slug}`, zh: `${slug} 训练计划` },
    category: 'Combat & Athletic Fitness',
    desc: {
      en: 'High-performance Cambodian combat and athletic fitness training program under Master Ny Rithy.',
      km: 'កម្មវិធីហ្វឹកហាត់ក្បាច់គុន និងកាយសម្បទាកម្រិតខ្ពស់ ដឹកនាំដោយគ្រូនី រិទ្ធី។',
      zh: '由 Ny Rithy 大师领衔的高强度柬埔寨武术与体能训练计划。'
    },
    image: fallbackImage,
    instructor: 'Master Ny Rithy',
    level: 'All Skill Levels',
    duration: '60 - 90 Minutes',
    highlights: [
      { en: 'Step-by-step Technical Mastery', km: 'ការបង្វឹកបច្ចេកទេសជាជំហានៗ', zh: '循序渐进的技术掌握' },
      { en: 'Group & 1-on-1 Personal Coaching', km: 'ការហ្វឹកហាត់ជាក្រុម និងផ្ទាល់ខ្លួន', zh: '团体与一对一私教' }
    ]
  }
})

function getTitle(obj) {
  if (!obj) return ''
  if (typeof obj.title === 'string') return obj.title
  return obj.title?.[locale.value] || obj.title?.en || ''
}

function getDesc(obj) {
  if (!obj) return ''
  if (typeof obj.desc === 'string') return obj.desc
  return obj.desc?.[locale.value] || obj.desc?.en || ''
}

function getHighlightText(hl) {
  if (!hl) return ''
  if (typeof hl === 'string') return hl
  return tBy(hl)
}

watchEffect(() => {
  if (item.value) {
    useSeo('detail', {
      title: getTitle(item.value),
      description: getDesc(item.value),
      image: item.value.image || item.value.cover || fallbackImage
    })
  }
})
</script>

<style scoped>
.detail-page {
  padding-top: var(--space-4);
}

.detail-page__nav {
  margin-bottom: var(--space-3);
}

.detail-page__card {
  background: var(--c-surface, #1e1e24);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.detail-page__hero {
  position: relative;
  height: 380px;
  width: 100%;
  overflow: hidden;
}

.detail-page__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-page__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-4);
}

.detail-page__badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--c-primary, #eab308);
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-bottom: var(--space-1);
}

.detail-page__title {
  font-size: clamp(1.8rem, 4vw, 3rem);
  color: #fff;
  margin: 0;
}

.detail-page__content {
  padding: var(--space-4);
}

.detail-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 900px) {
  .detail-page__grid {
    grid-template-columns: 2fr 1fr;
  }
}

.detail-page__subtitle {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.detail-page__desc {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--c-text-muted, #d1d5db);
  margin-bottom: var(--space-4);
}

.detail-page__highlights h3,
.detail-page__curriculum h3 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;

  color: var(--c-primary, #eab308);
}

.detail-page__highlights ul {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-4) 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-page__highlights li {
  font-size: 0.95rem;
  color: var(--c-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-page__highlights i {
  color: var(--c-primary, #eab308);
}

.curriculum-step {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  margin-bottom: 0.75rem;
}

.step-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--c-primary, #eab308);
}

.step-body h4 {
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
}

.step-body p {
  font-size: 0.875rem;
  color: var(--c-muted, #9ca3af);
  margin: 0;
}

.sidebar-box {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 1.5rem;
}

.sidebar-box h3 {
  font-size: 1.15rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--c-border);
}

.sidebar-meta {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-meta li {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  i {
    font-size: 1.35rem;
    color: var(--c-primary, #eab308);
  }

  .label {
    display: block;
    font-size: 0.75rem;
    color: var(--c-muted, #9ca3af);
    text-transform: uppercase;
  }

  .val {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--c-text);
  }
}

.sidebar-cta {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.btn--full {
  width: 100%;
  text-align: center;
  justify-content: center;
}

.detail-page__empty {
  text-align: center;
  padding: var(--space-6) var(--space-2);
}
</style>
