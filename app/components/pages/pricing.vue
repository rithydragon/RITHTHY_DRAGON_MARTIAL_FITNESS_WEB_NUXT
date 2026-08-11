<template>
  <div class="pricing-page section">
    <div class="container">
      <SectionHeader
        eyebrow="TRANSPARENT RATES"
        title="Membership & Pass Tiers"
        subtitle="Choose a flexible plan that fits your athletic goals. All memberships include access to open gym hours."
        centered
      />

      <div class="pricing-page__grid">
        <div
          v-for="plan in plans"
          :key="plan.name.en"
          :class="['card pricing-card', { 'pricing-card--popular': plan.popular }]"
          data-animate="fade"
        >
          <div v-if="plan.popular" class="pricing-card__badge">MOST POPULAR</div>
          <h3 class="pricing-card__name">{{ tBy(plan.name) }}</h3>
          <div class="pricing-card__price">
            <span class="currency">$</span>
            <span class="amount">{{ plan.price }}</span>
            <span class="period">/ {{ tBy(plan.period) }}</span>
          </div>

          <p class="pricing-card__desc">{{ tBy(plan.desc) }}</p>

          <ul class="pricing-card__features">
            <li v-for="(feat, idx) in plan.features" :key="idx">
              <i class="ri-check-line"></i> {{ tBy(feat) }}
            </li>
          </ul>

          <RLink to="/contact" :class="['btn', plan.popular ? 'btn--primary' : 'btn--outline', 'btn--full']">
            Select Plan
          </RLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const { tBy } = useTBy()

// useSeo('pricing')

const plans = [
  {
    name: { en: 'Day Drop-In Pass', km: 'សំបុត្រចូលហាត់ប្រចាំថ្ងៃ', zh: '单次体验卡' },
    price: '10',
    period: { en: 'day', km: 'ថ្ងៃ', zh: '天' },
    desc: {
      en: 'Perfect for visitors and traveling martial artists looking for a single session.',
      km: 'ល្អឥតខ្ចោះសម្រាប់ភ្ញៀវទេសចរ និងអ្នកកីឡាក្រៅស្រុកដែលចង់ហាត់តែមួយវគ្គ។',
      zh: '适合寻找单次体验课的游客和习武者。'
    },
    features: [
      { en: 'Access to 1 group class', km: 'ចូលរួមថ្នាក់ក្រុម ១ វគ្គ', zh: '包含1次团体课程' },
      { en: 'Open gym locker access', km: 'ប្រើប្រាស់ទូរក្លឹបឥតគិតថ្លៃ', zh: '储物柜使用权' },
      { en: 'Equipment provided for session', km: 'ផ្តល់បរិក្ខារហាត់ជូនក្នុងវគ្គសិក្សា', zh: '课程中提供必要的装备' }
    ]
  },
  {
    name: { en: 'Unlimited Fighter', km: 'កញ្ចប់សមាជិកមិនកំណត់', zh: '无限次战士卡' },
    price: '65',
    period: { en: 'month', km: 'ខែ', zh: '月' },
    popular: true,
    desc: {
      en: 'Our flagship membership for dedicated martial artists and fitness enthusiasts.',
      km: 'កញ្ចប់សមាជិកភាពឈានមុខគេសម្រាប់អ្នកស្រឡាញ់ក្បាច់គុន និងកាយសម្បទា។',
      zh: '我们为献身武术和健身爱好者打造的旗舰会员卡。'
    },
    features: [
      { en: 'Unlimited Bokator & Kun Khmer classes', km: 'ថ្នាក់បុកាទ័រ និងគុនខ្មែរ មិនកំណត់', zh: '无限次斗狮拳与高棉拳课程' },
      { en: 'Unlimited BJJ & Grappling sessions', km: 'ថ្នាក់រៀន BJJ និងចំបាប់ មិនកំណត់', zh: '无限次巴西柔术与缠斗课程' },
      { en: 'Full access to Strength & Conditioning gym', km: 'ចូលហាត់កាយសម្បទាពេញលេញ', zh: '完全使用力量与体能健身房' },
      { en: '10% off personal coaching', km: 'បញ្ចុះតម្លៃ ១០% លើការបង្វឹកផ្ទាល់ខ្លួន', zh: '私教课程享受9折优惠' }
    ]
  },
  {
    name: { en: '3-Month Warrior Pass', km: 'កញ្ចប់អ្នកច្បាំង ៣ ខែ', zh: '3个月战士季卡' },
    price: '170',
    period: { en: '3 months', km: '៣ ខែ', zh: '3个月' },
    desc: {
      en: 'Save on long-term commitment. Accelerate your fitness transformation.',
      km: 'សន្សំសំចៃសម្រាប់ការហ្វឹកហាត់រយៈពេលវែង។ ពន្លឿនការផ្លាស់ប្តូរកាយសម្បទារបស់អ្នក។',
      zh: '长期承诺享受折扣优惠。加速您的体能蜕变。'
    },
    features: [
      { en: 'All Unlimited Fighter perks', km: 'អត្ថប្រយោជន៍ទាំងអស់នៃកញ្ចប់មិនកំណត់', zh: '包含无限次卡的所有权益' },
      { en: 'Free RMF Fighter T-Shirt', km: 'អាវយឺត RMF Fighter ឥតគិតថ្លៃ ១', zh: '赠送 RMF 专属战士 T 恤一件' },
      { en: 'Quarterly athletic progress review', km: 'ការវាយតម្លៃកាយសម្បទាប្រចាំត្រីមាស', zh: '季度运动表现评估' },
      { en: 'Priority class booking', km: 'អាទិភាពក្នុងការកក់ម៉ោងសិក្សា', zh: '优先预订热门课程' }
    ]
  }
]
</script>

<style scoped>
.pricing-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4, 2rem);
  margin-top: var(--space-4, 2rem);
}

@media (min-width: 768px) {
  .pricing-page__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.pricing-card {
  position: relative;
  background: var(--c-surface, #1e1e24);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-4, 2rem);
  border: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
}

.pricing-card--popular {
  border-color: var(--c-primary, #eab308);
  box-shadow: 0 15px 40px rgba(234, 179, 8, 0.25);
  transform: translateY(-8px);
}

.pricing-card__badge {
  position: absolute;
  top: -12px;
  right: 1.5rem;
  background: var(--c-primary, #eab308);
  color: #000;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.pricing-card__name {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
}

.pricing-card__price {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.75rem;
}

.pricing-card__price .currency {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--c-primary, #eab308);
}

.pricing-card__price .amount {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--c-text);
}

.pricing-card__price .period {
  font-size: 0.875rem;
  color: var(--c-muted, #9ca3af);
  margin-left: 0.3rem;
}

.pricing-card__desc {
  font-size: 0.875rem;
  color: var(--c-muted, #9ca3af);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.pricing-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
}

.pricing-card__features li {
  font-size: 0.875rem;
  color: var(--c-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pricing-card__features i {
  color: var(--c-primary, #eab308);
}

.btn--full {
  width: 100%;
  text-align: center;
  justify-content: center;
}
</style>
