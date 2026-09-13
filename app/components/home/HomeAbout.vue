<template>
  <section id="about" class="section about">
    <div class="container about__grid">
      <!-- Image -->
      <div data-animate class="about__media">
        <div class="about__frame">
          <img
            src="/images/Home1.jpg"
            alt="Gym training"
            class="about__image"
          />
        </div>
        <!-- Badge -->
        <div class="about__badge">
          <div class="about__badge-number">10+</div>
          <div class="about__badge-label">
            {{ tBy({
              en: 'Years Coaching',
              km: 'ឆ្នាំនៃការបង្វឹក',
              cn: '教学经验'
            }) }}
          </div>
        </div>
      </div>

      <!-- About Info -->
      <div class="about__content">
        <div data-animate class="eyebrow">
          {{ $t('sections.about_subtitle') }}
        </div>
        <h2 data-animate data-delay="1" class="about__heading">
          {{ tBy({
            en: 'Welcome to Riththy Martial & Fitness Gym',
            km: 'សូមស្វាគមន៍មកកាន់ក្លឹប រិទ្ធី ក្បាច់គុន និងហ្វីតណេស',
            cn: '欢迎来到 Riththy 武术与健身房'
          }) }}
        </h2>
        <p data-animate data-delay="2" class="about__text">
          {{ tBy({
            en: 'Founded by Kru Riththy, a seasoned Muay Thai competitor and dedicated sports scientist, our facility is Phnom Penh\'s premier training hub for martial arts and comprehensive athletic conditioning. We believe that true fitness comes from building mental resilience alongside physical strength.',
            km: 'បង្កើតឡើងដោយ គ្រូរិទ្ធី ដែលជាអតីតកីឡាករគុនខ្មែរឆ្នើម និងជាអ្នកស្រាវជ្រាវផ្នែកកីឡា។ ក្លឹបរបស់យើងជាមជ្ឈមណ្ឌលហ្វឹកហាត់ក្បាច់គុន និងកាយសម្បទាឈានមុខគេក្នុងរាជធានីភ្នំពេញ។ យើងជឿជាក់ថា សុខភាពល្អពិតប្រាកដ កើតចេញពីការកសាងស្មារតីរឹងមាំទន្ទឹមនឹងកម្លាំងកាយ។',
            cn: '由经验丰富的泰拳选手兼运动科学家 Riththy 教练创立，我们的健身房是金边首屈一指的武术与体能训练枢纽。我们深信，真正的健康源于在锻炼身体力量的同时，培养强大的意志韧性。'
          }) }}
        </p>

        <!-- Stats Grid -->
        <div data-animate data-delay="3" class="about__stats">
          <div class="about__stat">
            <div class="about__stat-number">500+</div>
            <div class="about__stat-label">
              {{ tBy({ en: 'Active Members', km: 'សមាជិកសកម្ម', cn: '活跃会员' }) }}
            </div>
          </div>
          <div class="about__stat">
            <div class="about__stat-number">15+</div>
            <div class="about__stat-label">
              {{ tBy({ en: 'Championship Belts', km: 'ខ្សែក្រវាត់ជើងឯក', cn: '冠军腰带' }) }}
            </div>
          </div>
          <div class="about__stat">
            <div class="about__stat-number">100%</div>
            <div class="about__stat-label">
              {{ tBy({ en: 'Grit & dedication', km: 'ការតស៊ូ និងការប្តេជ្ញា', cn: '坚韧与专注' }) }}
            </div>
          </div>
          <div class="about__stat">
            <div class="about__stat-number">3+</div>
            <div class="about__stat-label">
              {{ tBy({ en: 'Global Languages', km: 'ភាសាសកល', cn: '全球语言' }) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style lang="scss" scoped>
// ============================================================
// About Section
// STRICT RULE: Only CSS Custom Properties. No Sass variables ($).
// Reuses the global palette / spacing / radius / shadow tokens
// defined in main.scss — no new color tokens are introduced here.
// ============================================================

.about {
  background: var(--c-bg);
  transition: background-color var(--transition-base);
}

.about__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  align-items: center;

  // Matches --bp-lg (1024px) from main.scss's breakpoint tokens
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

// ---- Media / image ----

.about__media {
  position: relative;
}

.about__frame {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-lg);
}

.about__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);

  .about__frame:hover & {
    transform: scale(1.05);
  }
}

.about__badge {
  position: absolute;
  right: calc(var(--space-3) * -1);
  bottom: calc(var(--space-3) * -1);
  max-width: 200px;
  padding: var(--space-3);
  background: var(--c-secondary);
  color: var(--c-text);
  border: 1px solid var(--c-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: none;

  @media (min-width: 640px) {
    display: block;
  }
}

.about__badge-number {
  font-family: var(--font-800, var(--font-fallback));
  font-size: 1.875rem;
  line-height: 1.1;
}

.about__badge-label {
  margin-top: var(--space-1);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

// ---- Content ----

.about__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.about__heading {
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
}

.about__text {
  color: var(--c-muted);
  font-weight: 500;
  line-height: 1.7;
  max-width: 60ch;
}

// ---- Stats ----

.about__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  padding-top: var(--space-3);
}

.about__stat {
  padding-left: var(--space-2);
  border-left: 4px solid var(--c-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.about__stat-number {
  font-family: var(--font-800, var(--font-fallback));
  font-size: 1.5rem;
  color: var(--c-text);
}

.about__stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .about__image {
    transition: none;
  }
}
</style>
