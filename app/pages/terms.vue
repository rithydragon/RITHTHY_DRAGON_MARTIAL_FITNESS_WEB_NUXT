<template>
  <div class="legal-page terms-page">
    <!-- Hero Banner -->
    <section class="legal-hero">
      <div class="container">
        <div class="legal-hero__badge" data-animate="fade">
          <i class="ri-shield-check-line"></i> {{ tBy({ en: 'RTY FITNESS — OFFICIAL POLICY', km: 'RTY FITNESS — គោលការណ៍ផ្លូវការ', zh: 'RTY FITNESS — 官方条款' }) }}
        </div>
        <h1 class="legal-hero__title" data-animate="fade" data-delay="100">
          {{ tBy({ en: 'Terms of Service & Gym Rules', km: 'លក្ខខណ្ឌសេវាកម្ម និងវិន័យក្លឹប', zh: '服务条款与健身房守则' }) }}
        </h1>
        <p class="legal-hero__subtitle" data-animate="fade" data-delay="200">
          {{ tBy({ en: 'Please read these terms and conditions carefully before using our services or training at RITHTHY Fitness.', km: 'សូមអានលក្ខខណ្ឌនិងបទបញ្ជាទាំងនេះឱ្យបានច្បាស់លាស់មុនពេលប្រើប្រាស់សេវាកម្ម ឬបង្វឹកនៅ RITHTHY Fitness។', zh: '在使用我们的服务或在 RITHTHY Fitness 训练之前，请仔细阅读这些条款与细则。' }) }}
        </p>
        <div class="legal-hero__meta" data-animate="fade" data-delay="300">
          <span class="meta-tag"><i class="ri-calendar-event-line"></i> {{ tBy({ en: 'Last Updated: September 17, 2026', km: 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ ១៧ កញ្ញា ២០២៦', zh: '最后更新时间：2026年9月17日' }) }}</span>
          <span class="meta-tag"><i class="ri-map-pin-2-line"></i> {{ tBy({ en: 'Phnom Penh, Cambodia', km: 'ភ្នំពេញ កម្ពុជា', zh: '柬埔寨金边' }) }}</span>
          <span class="meta-tag"><i class="ri-government-line"></i> Riththy Dragon Martial & Fitness Club</span>
        </div>
      </div>
    </section>

    <!-- Main Content Grid -->
    <section class="legal-content">
      <div class="container">
        <div class="legal-layout">
          <!-- Sidebar Navigation -->
          <aside class="legal-sidebar">
            <div class="sidebar-card">
              <div class="search-box">
                <i class="ri-search-line"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="tBy({ en: 'Search rules & terms...', km: 'ស្វែងរកវិន័យ និងលក្ខខណ្ឌ...', zh: '搜索规则与条款...' })"
                  aria-label="Search terms"
                />
                <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
                  <i class="ri-close-line"></i>
                </button>
              </div>

              <h4 class="sidebar-title">
                <i class="ri-list-check-2"></i> {{ tBy({ en: 'Table of Contents', km: 'មាតិកា', zh: '目录' }) }}
              </h4>
              <nav class="sidebar-nav">
                <a
                  v-for="section in filteredSections"
                  :key="section.id"
                  :href="`#${section.id}`"
                  class="sidebar-link"
                  :class="{ active: activeSection === section.id }"
                  @click.prevent="scrollTo(section.id)"
                >
                  <i :class="section.icon"></i>
                  <span>{{ tBy(section.title) }}</span>
                </a>
              </nav>

              <div class="sidebar-contact">
                <h5>{{ tBy({ en: 'Need Clarification?', km: 'ត្រូវការការបកស្រាយបន្ថែម?', zh: '需要进一步说明？' }) }}</h5>
                <p>{{ tBy({ en: 'Have questions about member rules or training passes?', km: 'មានសំណួរអំពីវិន័យសមាជិក ឬកាតបង្វឹក?', zh: '对会员规则或训练通行证有疑问？' }) }}</p>
                <NuxtLink :to="localePath('/contact')" class="btn-contact">
                  <i class="ri-mail-send-line"></i> {{ tBy({ en: 'Contact Master Trainer', km: 'ទំនាក់ទំនងគ្រូបង្វឹកឯក', zh: '联系总教练' }) }}
                </NuxtLink>
              </div>
            </div>
          </aside>

          <!-- Main Legal Article -->
          <article class="legal-article">
            <!-- Section 1: Agreement -->
            <section id="agreement" class="article-section">
              <div class="section-header">
                <span class="section-number">01</span>
                <div>
                  <h2>{{ tBy({ en: 'Acceptance of Terms & Member Eligibility', km: 'ការយល់ព្រមលើលក្ខខណ្ឌ និងលក្ខណៈសម្បត្តិសមាជិក', zh: '条款接受与会员资格' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Agreement between athlete/member and RITHTHY Fitness.', km: 'កិច្ចព្រមព្រៀងរវាងកីឡាករ/សមាជិក និង RITHTHY Fitness។', zh: '学员/会员与 RITHTHY Fitness 之间的协议。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>
                  {{ tBy({
                    en: 'Welcome to RITHTHY Fitness (Riththy Dragon Martial & Fitness Club), founded and directed by Master Ny Rithy in Phnom Penh, Kingdom of Cambodia. By accessing our web application (rithymartialfitness.com), registering an account, purchasing class passes, or participating in physical training at our center, you agree to comply with and be legally bound by these Terms of Service and Gym Conduct Rules.',
                    km: 'សូមស្វាគមន៍មកកាន់ RITHTHY Fitness (ក្លឹបកីឡាចម្រុះ និងសុខភាព រិទ្ធី ដ្រាហ្គន) បង្កើត និងដឹកនាំដោយលោក ញ៉ី រិទ្ធី នៅរាជធានីភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា។ ដោយការចូលប្រើប្រាស់កម្មវិធីវេបសាយ (rithymartialfitness.com) ចុះឈ្មោះគណនី ទិញកាតថ្នាក់ ឬចូលរួមការបង្វឹកកាយសម្បទានៅមជ្ឈមណ្ឌលរបស់យើង អ្នកយល់ព្រមអនុវត្តតាម និងភ្ជាប់កាតព្វកិច្ចផ្លូវច្បាប់ដោយលក្ខខណ្ឌសេវាកម្ម និងវិន័យក្លឹបទាំងនេះ។',
                    zh: '欢迎来到由 Ny Rithy 大师在柬埔寨王国金边创立并指导的 RITHTHY Fitness（Riththy Dragon 武术与健身俱乐部）。通过访问我们的 Web 应用程序 (rithymartialfitness.com)、注册账户、购买课程通行证或在我们的中心参与体能训练，即表示您同意遵守这些服务条款和健身房守则并受其法律约束。'
                  }) }}
                </p>
                <div class="info-callout">
                  <i class="ri-information-line"></i>
                  <div>
                    <strong>{{ tBy({ en: 'Age Requirement:', km: 'តម្រូវការអាយុ៖', zh: '年龄要求：' }) }}</strong>
                    {{ tBy({
                      en: 'Members under 18 years of age must obtain written parental/guardian consent prior to enrolling in combat martial arts (Bokator, Kun Khmer, Yuthakram Khom) or high-intensity conditioning classes.',
                      km: 'សមាជិកដែលមានអាយុក្រោម ១៨ ឆ្នាំត្រូវតែទទួលបានការយល់ព្រមជាលាយលក្ខណ៍អក្សរពីឪពុកម្តាយ/អាណាព្យាបាលមុនពេលចុះឈ្មោះចូលរៀនថ្នាក់ក្បាច់គុនប្រយុទ្ធ (បុកាទ័រ គុនខ្មែរ យុទ្ធក្រមខ្មែរ) ឬថ្នាក់ពង្រឹងកាយសម្បទាកម្រិតខ្ពស់។',
                      zh: '18 岁以下的会员在报名参加实战武术（斗狮拳、高棉拳、高棉武技）或高强度体能课程之前，必须获得父母/监护人的书面同意。'
                    }) }}
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 2: Gym & Training Rules -->
            <section id="gym-rules" class="article-section">
              <div class="section-header">
                <span class="section-number">02</span>
                <div>
                  <h2>{{ tBy({ en: 'Gym Conduct & Combat Safety Rules', km: 'វិន័យក្លឹប និងសុវត្ថិភាពក្នុងការប្រយុទ្ធ', zh: '健身房守则与实战安全规则' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Mandatory guidelines to preserve honor, safety, and hygiene.', km: 'គោលការណ៍ណែនាំជាកាតព្វកិច្ចដើម្បីរក្សាកិត្តិយស សុវត្ថិភាព និងអនាម័យ។', zh: '旨在维护荣誉、安全与维生的强制性指南。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>
                  {{ tBy({
                    en: 'RITHTHY Fitness honors traditional Khmer martial warrior culture. Discipline, mutual respect, and sportsmanship are non-negotiable pillars of our gym culture.',
                    km: 'RITHTHY Fitness គោរពវប្បធម៌អ្នកច្បាំងក្បាច់គុនខ្មែរប្រពៃណី។ វិន័យ ការគោរពគ្នាទៅវិញទៅមក និងស្មារតីកីឡា គឺជាសសរទ្រទ្រង់ដែលមិនអាចកែប្រែបាននៃវប្បធម៌ក្លឹបរបស់យើង។',
                    zh: 'RITHTHY Fitness 传承传统高棉武士文化。纪律、互相尊重和体育精神是构成我们俱乐部文化不可动摇的基石。'
                  }) }}
                </p>

                <div class="rules-grid">
                  <div class="rule-card">
                    <div class="rule-icon"><i class="ri-t-shirt-air-line"></i></div>
                    <h4>{{ tBy({ en: 'Proper Apparel & Hygiene', km: 'សម្លៀកបំពាក់ត្រឹមត្រូវ និងអនាម័យ', zh: '着装规范与个人卫生' }) }}</h4>
                    <p>{{ tBy({ en: 'Clean athletic attire, clean hand wraps, and sanitized gloves are mandatory for every session. Outdoor footwear is prohibited on mat training areas.', km: 'សម្លៀកបំពាក់កីឡាស្អាត ក្រណាត់រុំដៃស្អាត និងស្រោមដៃសម្លាប់មេរោគ គឺជាកាតព្វកិច្ចសម្រាប់គ្រប់វេនបង្វឹក។ ហាមប្រាមស្បែកជើងក្រៅនៅលើតំបន់កម្រាលបង្វឹក។', zh: '每节课必须穿戴干净的运动服、干净的缠手带和已消毒的手套。训练软垫区严禁穿外鞋。' }) }}</p>
                  </div>

                  <div class="rule-card">
                    <div class="rule-icon"><i class="ri-boxing-line"></i></div>
                    <h4>{{ tBy({ en: 'Controlled Sparring & Safety', km: 'ការប្រយុទ្ធសាកល្បងដោយការត្រួតពិនិត្យ និងសុវត្ថិភាព', zh: '可控实战与安全' }) }}</h4>
                    <p>{{ tBy({ en: 'Sparring is permitted only under direct supervision of Master Ny Rithy or designated trainers. Egos must be left at the door; aggressive or malicious intent results in immediate ban.', km: 'ការប្រយុទ្ធសាកល្បងត្រូវបានអនុញ្ញាតតែក្រោមការត្រួតពិនិត្យផ្ទាល់ពីលោក ញ៉ី រិទ្ធី ឬគ្រូបង្វឹកដែលបានចាត់តាំង។ ហាមប្រើអាកប្បកិរិយាក្រអើតក្រទម ឬចេតនាអាក្រក់ ដែលនឹងនាំឱ្យមានការបណ្តេញចេញភ្លាមៗ។', zh: '实战切磋仅限在 Ny Rithy 大师或指定教练的直接监督下进行。摒弃傲气；任何具有攻击性或恶意的行为将导致立即开除。' }) }}</p>
                  </div>

                  <div class="rule-card">
                    <div class="rule-icon"><i class="ri-shield-keyhole-line"></i></div>
                    <h4>{{ tBy({ en: 'Equipment Care & Storage', km: 'ការថែរក្សា និងរក្សាទុកបរិក្ខារ', zh: '器材使用与归位' }) }}</h4>
                    <p>{{ tBy({ en: 'Wipe down heavy bags, dumbbells, kettlebells, and cardio machines after each set. Return weights to designated racks immediately after use.', km: 'ជូតសំអាតបាវខ្សាច់ ដុំដែក kettlebells និងម៉ាស៊ីនកាយសម្បទាបន្ទាប់ពីប្រើរួច។ យកដុំដែកទៅដាក់លើរ៉ាកដែលបានកំណត់ភ្លាមៗបន្ទាប់ពីប្រើ។', zh: '每组练习后请擦拭重沙袋、哑铃、壶铃和有氧设备。使用后请立即将重物归位至指定架上。' }) }}</p>
                  </div>

                  <div class="rule-card">
                    <div class="rule-icon"><i class="ri-hand-heart-line"></i></div>
                    <h4>{{ tBy({ en: 'Respect & Honor', km: 'ការគោរព និងកិត្តិយស', zh: '尊重与荣誉' }) }}</h4>
                    <p>{{ tBy({ en: 'Always bow to instructors and training partners. Harassment, discrimination, or abusive language will not be tolerated under any circumstances.', km: 'ត្រូវតែអោនសំពះគោរពគ្រូបង្វឹក និងដៃគូបង្វឹកជានិច្ច។ ការរំលោភបំពាន ការរើសអើង ឬពាក្យសម្តីអសុរោះ នឹងមិនត្រូវបានអត់ឱនឡើយ។', zh: '始终向教练和训练伙伴鞠躬致意。在任何情况下均绝不容忍骚扰、歧视或辱骂性言辞。' }) }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 3: Memberships & Payments -->
            <section id="memberships" class="article-section">
              <div class="section-header">
                <span class="section-number">03</span>
                <div>
                  <h2>{{ tBy({ en: 'Memberships, Class Passes & Cancellations', km: 'សមាជិកភាព កាតថ្នាក់ និងការបោះបង់', zh: '会员资格、课程通行证与取消规程' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Payment terms, recurring plans, and booking rules.', km: 'លក្ខខណ្ឌទូទាត់ ផែនការបន្ត និងវិន័យកក់។', zh: '付款条款、续费计划与预约规则。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <ul>
                  <li>
                    <strong>{{ tBy({ en: 'Class Bookings:', km: 'ការកក់ថ្នាក់៖', zh: '课程预约：' }) }}</strong>
                    {{ tBy({
                      en: 'Class slots for group training or private 1-on-1 coaching with Master Ny Rithy must be booked in advance via our online system or mobile interface.',
                      km: 'ពេលវេលាថ្នាក់សម្រាប់ហ្វឹកហាត់ជាក្រុម ឬការបង្វឹកផ្ទាល់ខ្លួន ១ទល់១ ជាមួយលោក ញ៉ី រិទ្ធី ត្រូវតែកក់ទុកមុនតាមរយៈប្រព័ន្ធអនឡាញ ឬកម្មវិធីទូរស័ព្ទរបស់យើង។',
                      zh: '团体训练或 Ny Rithy 大师一对一私教课程必须提前通过我们的在线系统或移动界面预约。'
                    }) }}
                  </li>
                  <li>
                    <strong>{{ tBy({ en: 'Cancellation Policy:', km: 'គោលការណ៍លុបចោល៖', zh: '取消政策：' }) }}</strong>
                    {{ tBy({
                      en: 'Private coaching sessions must be cancelled at least 12 hours in advance. Cancellations within 12 hours will forfeit the class credit.',
                      km: 'វគ្គបង្វឹកផ្ទាល់ខ្លួនត្រូវតែលុបចោលយ៉ាងហោចណាស់ ១២ ម៉ោងមុន។ ការលុបចោលក្នុងរយៈពេល ១២ ម៉ោងនឹងបាត់បង់ក្រេឌីតថ្នាក់នោះ។',
                      zh: '私人辅导课程必须至少提前 12 小时取消。12 小时内的取消将扣除该节课程点数。'
                    }) }}
                  </li>
                  <li>
                    <strong>{{ tBy({ en: 'Refunds:', km: 'ការប្រាក់ត្រឡប់មកវិញ៖', zh: '退款：' }) }}</strong>
                    {{ tBy({
                      en: 'Membership passes and package subscriptions are non-refundable after activation, except in documented cases of medical incapacity certified by a physician.',
                      km: 'កាតសមាជិកភាព និងជាវកញ្ចប់មិនអាចសងប្រាក់វិញបានទេបន្ទាប់ពីបើកដំណើរការ លើកលែងតែមានឯកសារបញ្ជាក់ពីគ្រូពេទ្យអំពីអសមត្ថភាពរាងកាយ។',
                      zh: '会员通行证及套餐订阅在激活后概不退款，但经医生认证有书面医疗证明无法继续训练的情况除外。'
                    }) }}
                  </li>
                  <li>
                    <strong>{{ tBy({ en: 'Pass Expiration:', km: 'ការផុតកំណត់កាត៖', zh: '通行证有效期：' }) }}</strong>
                    {{ tBy({
                      en: 'Class packages have fixed validity periods (e.g., 30 days for 10-class passes). Unused classes expire automatically at the end of the validity window.',
                      km: 'កញ្ចប់ថ្នាក់មានរយៈពេលសុពលភាពកំណត់ (ឧទាហរណ៍ ៣០ ថ្ងៃសម្រាប់កាត ១០ ថ្នាក់)។ ថ្នាក់ដែលមិនបានប្រើនឹងផុតកំណត់ដោយស្វ័យប្រវត្តិ។',
                      zh: '课程套餐具有固定有效期（例如10次卡有效期为30天）。在有效期结束时，未使用的课程将自动失效。'
                    }) }}
                  </li>
                </ul>
              </div>
            </section>

            <!-- Section 4: Liability Waiver -->
            <section id="liability" class="article-section">
              <div class="section-header">
                <span class="section-number">04</span>
                <div>
                  <h2>{{ tBy({ en: 'Health Declaration & Liability Waiver', km: 'ការប្រកាសសុខភាព និងការលះបង់ការទទួលខុសត្រូវ', zh: '健康声明与免责声明' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Physical fitness responsibility and injury waiver.', km: 'ការទទួលខុសត្រូវកាយសម្បទា និងការលះបង់របួស។', zh: '身体状况责任与受害免责。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>
                  {{ tBy({
                    en: 'Martial arts training (Kun Khmer, Bokator, Grappling) and high-load conditioning carry inherent physical risks, including bruises, sprains, or muscle strain. By training at RITHTHY Fitness:',
                    km: 'ការបង្វឹកក្បាច់គុន (គុនខ្មែរ បុកាទ័រ ការចាប់) និងការហាត់កម្លាំងកម្រិតខ្ពស់ មានហានិភ័យរាងកាយរួមមាន ការជាំ គ្រេច ឬតានតឹងសាច់ដុំ។ ដោយការបង្វឹកនៅ RITHTHY Fitness៖',
                    zh: '武术训练（高棉拳、斗狮拳、地面对抗）和高负荷体能训练具有内在的物理风险，包括淤伤、扭伤或肌肉拉伤。在 RITHTHY Fitness 训练即表示：'
                  }) }}
                </p>
                <div class="warning-callout">
                  <i class="ri-alarm-warning-line"></i>
                  <div>
                    <strong>{{ tBy({ en: 'Medical Fitness Confirmation:', km: 'ការបញ្ជាក់កាយសម្បទាវេជ្ជសាស្ត្រ៖', zh: '医疗健康确认：' }) }}</strong>
                    {{ tBy({
                      en: 'You warrant that you are physically fit and have no medical conditions (cardiovascular issues, severe asthma, unhealed fractures) that would prevent safe participation. You voluntarily assume all risks associated with your training.',
                      km: 'អ្នកធានាថាអ្នកមានកាយសម្បទាមាំមួន និងគ្មានជំងឺ (បញ្ហាបេះដូង ហឺតធ្ងន់ធ្ងរ ឆ្អឹងបាក់មិនទាន់សះស្បើយ) ដែលរារាំងការចូលរួមដោយសុវត្ថិភាព។ អ្នកស្ម័គ្រចិត្តទទួលយកហានិភ័យទាំងអស់ដែលទាក់ទងនឹងការបង្វឹករបស់អ្នក។',
                      zh: '您保证您身体健康，且没有任何妨碍安全参与的医疗状况（心血管问题、严重哮喘、未愈合的骨折）。您自愿承担与训练相关的所有风险。'
                    }) }}
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 5: Account & OAuth -->
            <section id="account-oauth" class="article-section">
              <div class="section-header">
                <span class="section-number">05</span>
                <div>
                  <h2>{{ tBy({ en: 'User Accounts & OAuth Integration Rules', km: 'គណនីអ្នកប្រើប្រាស់ និងវិធានការ OAuth', zh: '用户账户与 OAuth 集成规则' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Login authentication rules via Google, Facebook, and Telegram.', km: 'វិន័យការចូលប្រព័ន្ធតាមរយៈ Google, Facebook និង Telegram។', zh: '通过 Google、Facebook 和 Telegram 登录认证规则。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <ul>
                  <li>{{ tBy({ en: 'You are responsible for maintaining the confidentiality of your account credentials and OAuth logins.', km: 'អ្នកមានទទួលខុសត្រូវក្នុងការរក្សាការសម្ងាត់នៃព័ត៌មានសម្ងាត់គណនី និងការចូលប្រព័ន្ធ OAuth របស់អ្នក។', zh: '您有责任对您的账户凭据和 OAuth 登录信息保密。' }) }}</li>
                  <li>{{ tBy({ en: 'OAuth tokens are used strictly to authenticate your account and manage your class reservations securely.', km: 'តូខិន OAuth ត្រូវបានប្រើប្រាស់យ៉ាងតឹងរ៉ឹងដើម្បីបញ្ជាក់អត្តសញ្ញាណគណនី និងគ្រប់គ្រងការកក់ថ្នាក់របស់អ្នកដោយសុវត្ថិភាព។', zh: 'OAuth 令牌严格用于对您的账户进行身份验证并安全地管理您的课程预约。' }) }}</li>
                  <li>{{ tBy({ en: 'Creating fake accounts, malicious bot activity, or sharing accounts with unauthorized individuals will trigger immediate termination.', km: 'ការបង្កើតគណនីក្លែងក្លាយ សកម្មភាពប៊ុតអាក្រក់ ឬការចែករំលែកគណនីជាមួយបុគ្គលគ្មានសិទ្ធិ នឹងនាំឱ្យមានការបញ្ឈប់ភ្លាមៗ។', zh: '创建虚假账户、恶意 Bot 活动或与未授权人员共享账户将导致立即终止服务。' }) }}</li>
                </ul>
              </div>
            </section>

            <!-- Section 6: Intellectual Property -->
            <section id="intellectual-property" class="article-section">
              <div class="section-header">
                <span class="section-number">06</span>
                <div>
                  <h2>{{ tBy({ en: 'Intellectual Property & Brand Protection', km: 'កម្មសិទ្ធិបញ្ញា និងការការពារម៉ាកសញ្ញា', zh: '知识产权与品牌保护' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Ownership of curriculum, brand, and media assets.', km: 'កម្មសិទ្ធិលើកម្មវិធីសិក្សា ម៉ាកសញ្ញា និងមេឌៀ។', zh: '课程、品牌与媒体资产的所有权。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>
                  {{ tBy({
                    en: 'All content published on RITHTHY Fitness—including logos, Bokator training manuals, video demonstrations, articles by Master Ny Rithy, and custom UI design—is protected under Cambodian and international copyright laws. Unauthorized commercial distribution of RTY FITNESS assets is strictly prohibited.',
                    km: 'មាតិកាទាំងអស់ដែលបានបោះពុម្ពផ្សាយនៅលើ RITHTHY Fitness—រួមទាំងឡូហ្គោ សៀវភៅណែនាំបុកាទ័រ វីដេអូបង្ហាញ អត្ថបទដោយលោក ញ៉ី រិទ្ធី និងការរចនា UI—ត្រូវ បានការពារក្រោមច្បាប់រក្សាសិទ្ធិកម្ពុជា និងអន្តរជាតិ។ ការចែកចាយពាណិជ្ជកម្មដោយគ្មានការអនុញ្ញាតត្រូវបានហាមឃាត់យ៉ាងតឹងរ៉ឹង។',
                    zh: 'RITHTHY Fitness 上发布的所有内容——包括标识、斗狮拳训练手册、示范视频、Ny Rithy 大师的文章以及自定义 UI 设计——均受柬埔寨及国际著作权法保护。严禁未经授权商业分发 RTY FITNESS 资产。'
                  }) }}
                </p>
              </div>
            </section>

            <!-- Section 7: Governing Law -->
            <section id="governing-law" class="article-section">
              <div class="section-header">
                <span class="section-number">07</span>
                <div>
                  <h2>{{ tBy({ en: 'Governing Law & Dispute Resolution', km: 'ច្បាប់គ្រប់គ្រង និងការដោះស្រាយវិវាទ', zh: '适用法律与争议解决' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Jurisdiction under the Laws of Cambodia.', km: 'សមត្ថកិច្ចដែនដីក្រោមច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា។', zh: '柬埔寨王国法律管辖权。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>
                  {{ tBy({
                    en: 'These Terms of Service are governed by and construed in accordance with the laws of the Kingdom of Cambodia. Any legal disputes arising out of membership or training shall be submitted to the competent courts of Phnom Penh, Cambodia.',
                    km: 'លក្ខខណ្ឌសេវាកម្មទាំងនេះត្រូវគ្រប់គ្រង និងបកស្រាយស្របតាមច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា។ វិវាទផ្លូវច្បាប់ទាំងឡាយដែលកើតចេញពីសមាជិកភាព ឬការបង្វឹក ត្រូវបញ្ជូនទៅតុលាការមានសមត្ថកិច្ចនៅរាជធានីភ្នំពេញ កម្ពុជា។',
                    zh: '本服务条款受柬埔寨王国法律管辖并按其解释。因会员资格或训练引起的任何法律争议均应提交柬埔寨金边有管辖权的法院审理。'
                  }) }}
                </p>
              </div>
            </section>

            <!-- Section 8: Contact Info -->
            <section id="contact-info" class="article-section">
              <div class="section-header">
                <span class="section-number">08</span>
                <div>
                  <h2>{{ tBy({ en: 'Official Contact Information', km: 'ព័ត៌មានទំនាក់ទំនងផ្លូវការ', zh: '官方联系信息' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Direct contact for legal or membership inquiries.', km: 'ទំនាក់ទំនងផ្ទាល់សម្រាប់សំណួរផ្លូវច្បាប់ ឬសមាជិកភាព។', zh: '法律或会员咨询的直接联系方式。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <div class="contact-card">
                  <div class="contact-row">
                    <i class="ri-building-line"></i>
                    <div>
                      <strong>Riththy Dragon Martial & Fitness Club</strong>
                      <span>{{ tBy({ en: 'Founder & CEO: Master Ny Rithy', km: 'ស្ថាបនិក និង នាយកប្រតិបត្តិ៖ លោក ញ៉ី រិទ្ធី', zh: '创始人兼 CEO：Ny Rithy 大师' }) }}</span>
                    </div>
                  </div>
                  <div class="contact-row">
                    <i class="ri-map-pin-line"></i>
                    <div>
                      <strong>{{ tBy({ en: 'Training Facility Location', km: 'ទីតាំងមជ្ឈមណ្ឌលបង្វឹក', zh: '训练中心地址' }) }}</strong>
                      <span>#123, Street 123, Phnom Penh, Kingdom of Cambodia</span>
                    </div>
                  </div>
                  <div class="contact-row">
                    <i class="ri-phone-line"></i>
                    <div>
                      <strong>{{ tBy({ en: 'Phone / Telegram', km: 'ទូរស័ព្ទ / ឡេក្រាម', zh: '电话 / Telegram' }) }}</strong>
                      <span>+855 97 905 3790 | <a href="https://t.me/NY_RITHY" target="_blank">@NY_RITHY</a></span>
                    </div>
                  </div>
                  <div class="contact-row">
                    <i class="ri-mail-line"></i>
                    <div>
                      <strong>{{ tBy({ en: 'Official Email', km: 'អ៊ីមែលផ្លូវការ', zh: '官方邮箱' }) }}</strong>
                      <span>thynydragon@email.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: 'Terms of Service & Rules | RITHTHY Fitness',
  meta: [
    { name: 'description', content: 'Official Terms of Service, gym conduct rules, membership terms, and safety policies for RITHTHY Fitness Club in Phnom Penh, Cambodia.' },
    { property: 'og:title', content: 'Terms of Service & Rules | RITHTHY Fitness' },
    { property: 'og:description', content: 'Official Gym Conduct Rules and Terms of Service for Riththy Dragon Martial & Fitness Club.' }
  ]
})

const searchQuery = ref('')
const activeSection = ref('agreement')

const sections = [
  { id: 'agreement', title: { en: '1. Acceptance & Eligibility', km: '១. ការយល់ព្រម និងលក្ខណៈសម្បត្តិ', zh: '1. 条款接受与资格' }, icon: 'ri-checkbox-circle-line' },
  { id: 'gym-rules', title: { en: '2. Gym Conduct & Safety', km: '២. វិន័យក្លឹប និងសុវត្ថិភាព', zh: '2. 守则与安全' }, icon: 'ri-shield-flash-line' },
  { id: 'memberships', title: { en: '3. Memberships & Bookings', km: '៣. សមាជិកភាព និងការកក់', zh: '3. 会员与预约' }, icon: 'ri-money-dollar-circle-line' },
  { id: 'liability', title: { en: '4. Health & Liability Waiver', km: '៤. សុខភាព និងការលះបង់របួស', zh: '4. 健康与免责' }, icon: 'ri-heart-pulse-line' },
  { id: 'account-oauth', title: { en: '5. Accounts & OAuth Rules', km: '៥. គណនី និងវិធាន OAuth', zh: '5. 账户与 OAuth' }, icon: 'ri-user-shared-line' },
  { id: 'intellectual-property', title: { en: '6. Intellectual Property', km: '៦. កម្មសិទ្ធិបញ្ញា', zh: '6. 知识产权' }, icon: 'ri-copyright-line' },
  { id: 'governing-law', title: { en: '7. Governing Law', km: '៧. ច្បាប់គ្រប់គ្រង', zh: '7. 适用法律' }, icon: 'ri-government-line' },
  { id: 'contact-info', title: { en: '8. Contact Information', km: '៨. ព័ត៌មានទំនាក់ទំនង', zh: '8. 联系信息' }, icon: 'ri-contacts-book-line' }
]

const filteredSections = computed(() => {
  if (!searchQuery.value.trim()) return sections
  const q = searchQuery.value.toLowerCase()
  return sections.filter(s => tBy(s.title).toLowerCase().includes(q))
})

function scrollTo(id: string) {
  activeSection.value = id
  const el = document.getElementById(id)
  if (el) {
    const yOffset = -90
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    { rootMargin: '-20% 0px -60% 0px' }
  )

  sections.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) observer?.observe(el)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped lang="scss">
.legal-page {
  min-height: 100vh;
  background-color: var(--c-bg, #0a0a0a);
  color: var(--c-text, #e5e5e5);
  padding-bottom: var(--space-8, 5rem);
}

.legal-hero {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(10, 10, 10, 0.95) 100%),
              radial-gradient(circle at 50% 0%, rgba(234, 179, 8, 0.12), transparent 70%);
  border-bottom: 1px solid var(--c-border, rgba(255, 255, 255, 0.1));
  padding-block: calc(var(--header-height, 80px) + 2rem) 3rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #dc2626, #eab308, #dc2626);
  }
}

.legal-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(220, 38, 38, 0.2);
  border: 1px solid rgba(220, 38, 38, 0.4);
  color: #f87171;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
}

.legal-hero__title {
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.legal-hero__subtitle {
  font-size: 1.125rem;
  color: var(--c-muted, #a3a3a3);
  max-width: 680px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
}

.legal-hero__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: var(--c-muted, #a3a3a3);
  background: var(--c-surface, rgba(255, 255, 255, 0.05));
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  border: 1px solid var(--c-border, rgba(255, 255, 255, 0.08));

  i {
    color: #eab308;
  }
}

/* Layout */
.legal-content {
  padding-top: 3rem;
}

.legal-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: 320px 1fr;
  }
}

/* Sidebar */
.legal-sidebar {
  @media (min-width: 1024px) {
    position: sticky;
    top: calc(var(--header-height, 80px) + 1.5rem);
    height: fit-content;
  }
}

.sidebar-card {
  background: var(--c-surface, #141414);
  border: 1px solid var(--c-border, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--c-border, rgba(255, 255, 255, 0.12));
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  margin-bottom: 1.5rem;

  i {
    color: var(--c-muted, #737373);
  }

  input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 0.875rem;

    &::placeholder {
      color: #737373;
    }
  }

  .clear-btn {
    background: transparent;
    border: none;
    color: #a3a3a3;
    cursor: pointer;
    padding: 0;

    &:hover {
      color: #ffffff;
    }
  }
}

.sidebar-title {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #eab308;
  margin-bottom: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.85rem;
  font-size: 0.875rem;
  color: var(--c-muted, #a3a3a3);
  border-radius: 8px;
  transition: all 0.2s ease;
  text-decoration: none;

  i {
    font-size: 1.1rem;
    color: #737373;
    transition: color 0.2s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;

    i {
      color: #eab308;
    }
  }

  &.active {
    background: rgba(220, 38, 38, 0.15);
    color: #ffffff;
    border-left: 3px solid #dc2626;

    i {
      color: #f87171;
    }
  }
}

.sidebar-contact {
  border-top: 1px solid var(--c-border, rgba(255, 255, 255, 0.08));
  padding-top: 1.25rem;

  h5 {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.35rem;
  }

  p {
    font-size: 0.8125rem;
    color: #a3a3a3;
    margin-bottom: 0.85rem;
    line-height: 1.4;
  }

  .btn-contact {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
    }
  }
}

/* Article */
.legal-article {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.article-section {
  background: var(--c-surface, #141414);
  border: 1px solid var(--c-border, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  padding: 2rem;
  scroll-margin-top: calc(var(--header-height, 80px) + 1rem);
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  margin-bottom: 1.5rem;

  .section-number {
    font-family: monospace;
    font-size: 1.5rem;
    font-weight: 800;
    color: #dc2626;
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.3);
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  h2 {
    font-size: 1.35rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.25rem;
  }

  .section-sub {
    font-size: 0.875rem;
    color: #a3a3a3;
  }
}

.section-body {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #d4d4d4;

  p {
    margin-bottom: 1rem;
  }

  ul {
    margin-bottom: 1.25rem;
    padding-left: 1.25rem;

    li {
      margin-bottom: 0.6rem;
    }
  }

  a {
    color: #f87171;
    text-decoration: underline;

    &:hover {
      color: #eab308;
    }
  }
}

.info-callout {
  display: flex;
  gap: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 1rem;

  i {
    font-size: 1.5rem;
    color: #60a5fa;
    flex-shrink: 0;
  }

  strong {
    color: #ffffff;
  }
}

.warning-callout {
  display: flex;
  gap: 1rem;
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 1rem;

  i {
    font-size: 1.5rem;
    color: #eab308;
    flex-shrink: 0;
  }

  strong {
    color: #ffffff;
  }
}

.rules-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 1.25rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.rule-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 1.25rem;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: rgba(220, 38, 38, 0.4);
    transform: translateY(-2px);
  }

  .rule-icon {
    font-size: 1.75rem;
    color: #dc2626;
    margin-bottom: 0.65rem;
  }

  h4 {
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.4rem;
  }

  p {
    font-size: 0.85rem;
    color: #a3a3a3;
    margin-bottom: 0;
    line-height: 1.5;
  }
}

.contact-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1.5rem;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 1rem;

  i {
    font-size: 1.5rem;
    color: #eab308;
    background: rgba(234, 179, 8, 0.1);
    width: 44px;
    height: 44px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  div {
    display: flex;
    flex-direction: column;

    strong {
      color: #ffffff;
      font-size: 0.9375rem;
    }

    span {
      font-size: 0.85rem;
      color: #a3a3a3;
    }
  }
}
</style>
