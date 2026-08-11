<template>
  <div class="programs-page section">
    <div class="container">
      <SectionHeader
        eyebrow="COMBAT & FITNESS CURRICULUMS"
        title="Training Programs"
        subtitle="Master traditional Cambodian fighting systems and elite physical performance under Master Ny Rithy."
        centered
      />

      <div class="programs-page__grid">
        <div
          v-for="prog in programs"
          :key="prog.id"
          class="card program-card"
          data-animate="fade"
        >
          <div class="program-card__image-wrap">
            <img :src="prog.image" :alt="tBy(prog.title)" class="program-card__image" />
            <span class="program-card__badge">{{ tBy(prog.level) }}</span>
          </div>

          <div class="program-card__body">
            <h3 class="program-card__title">{{ tBy(prog.title) }}</h3>
            <p class="program-card__desc">{{ tBy(prog.desc) }}</p>

            <ul class="program-card__highlights">
              <li v-for="(hl, idx) in prog.highlights" :key="idx">
                <i class="ri-checkbox-circle-line"></i> {{ tBy(hl) }}
              </li>
            </ul>

            <div class="program-card__footer">
              <RLink :to="`/detail/${prog.id}`" class="btn btn--outline btn--sm">
                Program Details
              </RLink>
              <RLink to="/contact" class="btn btn--primary btn--sm">
                Book Trial
              </RLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const { tBy } = useTBy()

// useSeo('programs')

const programs = [
  {
    id: 'bokator',
    title: { en: 'Ancient Khmer Bokator', km: 'ក្បាច់គុនបុរាណខ្មែរបុកាទ័រ', zh: '古高棉斗狮拳' },
    level: { en: 'All Levels', km: 'គ្រប់កម្រិត', zh: '全阶段' },
    desc: {
      en: 'Learn Cambodia’s 1,000-year-old warrior combat art featuring animal forms, knee strikes, elbow traps, and traditional weapons.',
      km: 'រៀនសិល្បៈប្រយុទ្ធអ្នកច្បាំងខ្មែរអាយុ ១,០០០ ឆ្នាំ ដោយមានទម្រង់សត្វ កែង ជង្គង់ និងអាវុធបុរាណ។',
      zh: '学习柬埔寨拥有1000年历史的战士格斗艺术，包含象形拳、膝击、肘捕与传统武器。'
    },
    image: 'https://images.pexels.com/photos/7045699/pexels-photo-7045699.jpeg',
    highlights: [
      { en: '341 Animal Stretches & Techniques', km: 'ទម្រង់ក្បាច់សត្វ ៣៤១ ប្រភេទ', zh: '341种动物象形技巧' },
      { en: 'Unarmed & Weapon Training', km: 'ការហ្វឹកហាត់ដៃទទេ និងអាវុធ', zh: '徒手与武器训练' },
      { en: 'UNESCO Cultural Heritage System', km: 'បេតិកភណ្ឌវប្បធម៌ UNESCO', zh: '联合国教科文组织非遗项目' }
    ]
  },
  {
    id: 'kun-khmer',
    title: { en: 'Kun Khmer Kickboxing (Pradal Serey)', km: 'គុនខ្មែរ (ប្រាដាល់សេរី)', zh: '高棉拳 (Pradal Serey)' },
    level: { en: 'Intermediate / Fighter', km: 'កម្រិតមធ្យម / កីឡាករ', zh: '中级 / 选手' },
    desc: {
      en: 'High-intensity full-contact striking emphasizing ferocious elbow strikes, low kicks, and clinch dominance.',
      km: 'ការប្រយុទ្ធប៉ះទង្គិចពេញលេញ ដោយផ្តោតលើការវាយកែង កាត់ទាប និងការគ្រប់គ្រងក្នុងកៀប។',
      zh: '高强度全接触打击，侧重凶猛的肘击、低扫腿与内围缠斗控制。'
    },
    image: 'https://images.pexels.com/photos/4753986/pexels-photo-4753986.jpeg',
    highlights: [
      { en: 'Fight Pad & Mitt Conditioning', km: 'ការហ្វឹកហាត់ស៊ីល និងប៉ាត់ប្រយុទ្ធ', zh: '手靶与脚靶体能强化' },
      { en: 'Clinching & Elbow Counters', km: 'ការចាត់កៀប និងក្បាច់កែងតបត', zh: '内围缠斗与肘击反击' },
      { en: 'Amateur & Pro Fight Prep', km: 'ការរៀបចំប្រកួតអាម៉ាត័រ និងអាជីព', zh: '业余与职业赛事备战' }
    ]
  },
  {
    id: 'bjj',
    title: { en: 'Brazilian Jiu-Jitsu & Grappling', km: 'យូយីតស៊ូប្រេស៊ីល (BJJ)', zh: '巴西柔术与缠斗' },
    level: { en: 'Beginner to Advanced', km: 'ចាប់ផ្តើម ដល់ កម្រិតខ្ពស់', zh: '初级至高级' },
    desc: {
      en: 'Ground fighting science focused on leverage, sweeps, guard passes, and joint submission locks.',
      km: 'វិទ្យាសាស្ត្រប្រយុទ្ធលើដី ផ្តោតលើជើងទម្រ ការផ្លាស់ប្តូរ និងការចាក់កៀបរួមjoint។',
      zh: '专注于杠杆原理、扫翻、过护卫与关节降服锁技的地面格斗科学。'
    },
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop',
    highlights: [
      { en: 'Gi & No-Gi Submissions', km: 'ការកៀប Gi និង No-Gi', zh: '道服与无道服降服' },
      { en: 'Takedowns & Position Control', km: 'ការផ្តួល និងគ្រប់គ្រងទីតាំង', zh: '摔法与位置控制' },
      { en: 'Tactical Self-Defense', km: 'ការការពារខ្លួនបែបយុទ្ធសាស្ត្រ', zh: '战术实用自卫术' }
    ]
  },
  {
    id: 'strength',
    title: { en: 'High-Performance Strength & Athletic Conditioning', km: 'ការហ្វឹកហាត់កម្លាំង និងកាយសម្បទា', zh: '高性能力量与体能训练' },
    level: { en: 'All Levels', km: 'គ្រប់កម្រិត', zh: '全阶段' },
    desc: {
      en: 'Functional strength training, core power, metabolic conditioning, and mobility built for fighters and fitness enthusiasts.',
      km: 'ការហ្វឹកហាត់កម្លាំងមុខងារ ថាមពលស្នូល និងភាពបត់បែនសម្រាប់កីឡាករ និងអ្នកហាត់ប្រាណ។',
      zh: '为格斗家和健身爱好者打造的功能性力量训练、核心爆发力、代谢调节与关节活动度。'
    },
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    highlights: [
      { en: 'Olympic Weightlifting & Kettlebells', km: 'លើកដុំដែកអូឡាំពិក & កេតថិលបែល', zh: '奥林匹克举重与壶铃训练' },
      { en: 'Explosive Power & Stamina', km: 'ថាមពលផ្ទុះ និងភាពស៊ូទ្រាំ', zh: '爆发力与心肺耐力' },
      { en: 'Injury Prevention & Recovery', km: 'ការការពាររបួស និងការស្តារកម្លាំង', zh: '伤病预防与恢复' }
    ]
  }
]
</script>

<style scoped>
.programs-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4, 2rem);
  margin-top: var(--space-4, 2rem);
}

@media (min-width: 768px) {
  .programs-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.program-card {
  display: flex;
  flex-direction: column;
  background: var(--c-surface, #1e1e24);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-md);
}

.program-card__image-wrap {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.program-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.program-card__badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--c-primary, #eab308);
  color: #000;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
}

.program-card__body {
  padding: var(--space-3, 1.5rem);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.program-card__title {
  font-size: 1.35rem;
  margin-bottom: 0.5rem;
}

.program-card__desc {
  font-size: 0.925rem;
  color: var(--c-muted, #9ca3af);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.program-card__highlights {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.program-card__highlights li {
  font-size: 0.85rem;
  color: var(--c-muted, #9ca3af);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.program-card__highlights i {
  color: var(--c-primary, #eab308);
}

.program-card__footer {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
}
</style>
