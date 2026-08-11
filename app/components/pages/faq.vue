<template>
  <div class="faq-page section">
    <div class="container">
      <SectionHeader
        eyebrow="GET PREPARED"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know before your first session at Rithy Martial & Fitness."
        centered
      />

      <div class="faq-page__list">
        <div
          v-for="(item, idx) in faqs"
          :key="idx"
          :class="['faq-item', { 'is-open': openIndex === idx }]"
          @click="toggleFaq(idx)"
        >
          <div class="faq-item__question">
            <h3>{{ tBy(item.q) }}</h3>
            <i :class="['faq-item__icon', openIndex === idx ? 'ri-subtract-line' : 'ri-add-line']"></i>
          </div>

          <transition name="expand">
            <div v-if="openIndex === idx" class="faq-item__answer">
              <p>{{ tBy(item.a) }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const { t } = useI18n()
const { tBy } = useTBy()
const openIndex = ref(0)

function toggleFaq(idx) {
  openIndex.value = openIndex.value === idx ? -1 : idx
}

// useSeo('faq')

const faqs = [
  {
    q: {
      en: 'Do I need prior martial arts experience to join?',
      km: 'តើខ្ញុំត្រូវមានបទពិសោធន៍ក្បាច់គុនជាមុនដើម្បីចូលរួមដែរឬទេ?',
      zh: '加入训练是否需要先前的武术经验？'
    },
    a: {
      en: 'Not at all! Our classes cater to all skill levels, from total beginners to professional fighters. Our coaches break down foundational movements step-by-step.',
      km: 'មិនចាំបាច់ទាល់តែសោះ! ថ្នាក់រៀនរបស់យើងផ្តល់ជូនគ្រប់កម្រិត ចាប់ពីអ្នកចាប់ផ្តើមដំបូងរហូតដល់កីឡាករអាជីព។ គ្រូបង្វឹករបស់យើងពន្យល់បច្ចេកទេសជាជំហានៗ។',
      zh: '完全不需要！我们的课程适合所有水平的学员，从完全零基础到职业选手。教练将逐步拆解基础动作。'
    }
  },
  {
    q: {
      en: 'What should I wear and bring for my first session?',
      km: 'តើខ្ញុំគួរពាក់អ្វី និងយកអ្វីខ្លះសម្រាប់វគ្គសិក្សាដំបូង?',
      zh: '第一堂课我应该穿什么并携带什么？'
    },
    a: {
      en: 'Wear comfortable athletic attire (shorts and t-shirt). Bring a water bottle and a hand towel. Hand wraps and gloves are provided for your free trial session.',
      km: 'ពាក់សម្លៀកបំពាក់កីឡាដែលមានផាសុកភាព (ខោខ្លី និងអាវយឺត)។ យកដបទឹក និងកន្សែងជូតមុខ។ យើងមានស្រោមដៃ និងបង់រុំដៃជូនសម្រាប់ការហាត់សាកល្បង។',
      zh: '穿舒适的运动服装（短裤和T恤）。带上一瓶水和一条小毛巾。我们会在免费试听课中提供绷带和手套。'
    }
  },
  {
    q: {
      en: 'How does the free trial class work?',
      km: 'តើថ្នាក់រៀនសាកល្បងដោយឥតគិតថ្លៃដំណើរការយ៉ាងដូចម្តេច?',
      zh: '免费体验课是如何运作的？'
    },
    a: {
      en: 'First-time visitors can book a free trial class in Bokator, Kun Khmer, BJJ, or Strength Conditioning. Simply contact us or register via our Quick Contact panel.',
      km: 'អ្នកមកហាត់លើកដំបូងអាចកក់ថ្នាក់រៀនសាកល្បងឥតគិតថ្លៃលើបុកាទ័រ គុនខ្មែរ BJJ ឬកាយសម្បទា។ គ្រាន់តែទំនាក់ទំនងមកយើង ឬចុះឈ្មោះតាមប្រព័ន្ធទំនាក់ទំនង។',
      zh: '首次造访者可以预订斗狮拳、高棉拳、柔术或体能训练的免费体验课。只需联系我们或通过快速联系面板注册。'
    }
  },
  {
    q: {
      en: 'Is private 1-on-1 coaching available?',
      km: 'តើមានការបង្វឹកផ្ទាល់ខ្លួន ១ទល់១ ដែរឬទេ?',
      zh: '是否提供一对一口服私教服务？'
    },
    a: {
      en: 'Yes, Master Ny Rithy and our head coaches offer private 1-on-1 sessions tailored to your athletic goals, technical mastery, or fight prep.',
      km: 'បាទ! គ្រូនី រិទ្ធី និងគ្រូបង្វឹកប្រធានរបស់យើងមានថ្នាក់បង្វឹកផ្ទាល់ខ្លួន ១ទល់១ ដែលរៀបចំឡើងតាមគោលដៅ និងកាយសម្បទារបស់អ្នក។',
      zh: '是的，Ny Rithy 大师及头牌教练团队根据您的运动目标、技术掌握程度或备战需求提供定制化一对一私教服务。'
    }
  },
  {
    q: {
      en: 'Where is Rithy Martial & Fitness located?',
      km: 'តើ រិទ្ធី ម៉ាសល & ហ្វ៊ីតនេស មានទីតាំងនៅឯណា?',
      zh: 'Rithy 武术与健身位于何处？'
    },
    a: {
      en: 'We are conveniently located in Phnom Penh, Cambodia. Contact us or check our Location map for direct directions.',
      km: 'យើងមានទីតាំងស្ថិតនៅក្នុងរាជធានីភ្នំពេញ ប្រទេសកម្ពុជា។ ទំនាក់ទំនងមកយើង ឬពិនិត្យមើលផែនទីទីតាំងសម្រាប់ទិសដៅផ្ទាល់។',
      zh: '我们位于柬埔寨金边，交通便利。请联系我们或查看我们的位置地图以获取直接路线。'
    }
  }
]
</script>

<style scoped>
.faq-page__list {
  max-width: 800px;
  margin: var(--space-4, 2rem) auto 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: var(--c-surface, #1e1e24);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.faq-item:hover,
.faq-item.is-open {
  border-color: var(--c-primary, #eab308);
}

.faq-item__question {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }
}

.faq-item__icon {
  font-size: 1.25rem;
  color: var(--c-primary, #eab308);
}

.faq-item__answer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--c-border);

  p {
    font-size: 0.95rem;
    color: var(--c-muted, #9ca3af);
    line-height: 1.6;
    margin: 0;
  }
}
</style>
