<template>
  <div class="legal-page privacy-page">
    <!-- Hero Banner -->
    <section class="legal-hero">
      <div class="container">
        <div class="legal-hero__badge" data-animate="fade">
          <i class="ri-lock-2-line"></i> {{ tBy({ en: 'RTY FITNESS — PRIVACY & OAUTH2 CERTIFIED', km: 'RTY FITNESS — គោលការណ៍ឯកជនភាព និង OAUTH2', zh: 'RTY FITNESS — 隐私与 OAUTH2 认证' }) }}
        </div>
        <h1 class="legal-hero__title" data-animate="fade" data-delay="100">
          {{ tBy({ en: 'Privacy Policy & Data Protection', km: 'គោលការណ៍ឯកជនភាព និងការការពារទិន្នន័យ', zh: '隐私政策与数据保护' }) }}
        </h1>
        <p class="legal-hero__subtitle" data-animate="fade" data-delay="200">
          {{ tBy({ en: 'How RTY Fitness collects, uses, and safeguards your personal data during account creation, OAuth login, and class bookings.', km: 'របៀបដែល RTY Fitness ប្រមូល ប្រើប្រាស់ និងការពារទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកក្នុងពេលបង្កើតគណនី ការចូលតាម OAuth និងការកក់ថ្នាក់។', zh: 'RTY Fitness 如何在账户创建、OAuth 登录和课程预约期间收集、使用和保护您的个人数据。' }) }}
        </p>
        <div class="legal-hero__meta" data-animate="fade" data-delay="300">
          <span class="meta-tag"><i class="ri-shield-check-line"></i> {{ tBy({ en: 'GDPR & OAuth2 Compliant', km: 'អនុវត្តតាម GDPR & OAuth2', zh: '符合 GDPR 与 OAuth2 标准' }) }}</span>
          <span class="meta-tag"><i class="ri-calendar-event-line"></i> {{ tBy({ en: 'Last Updated: September 17, 2026', km: 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ ១៧ កញ្ញា ២០២៦', zh: '最后更新时间：2026年9月17日' }) }}</span>
          <span class="meta-tag"><i class="ri-global-line"></i> rithymartialfitness.com</span>
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
                  :placeholder="tBy({ en: 'Search privacy topics...', km: 'ស្វែងរកប្រធានបទឯកជនភាព...', zh: '搜索隐私主题...' })"
                  aria-label="Search privacy policy"
                />
                <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
                  <i class="ri-close-line"></i>
                </button>
              </div>

              <h4 class="sidebar-title">
                <i class="ri-node-tree"></i> {{ tBy({ en: 'Navigation Menu', km: 'ម៉ឺនុយរុករក', zh: '导航菜单' }) }}
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
                <h5>{{ tBy({ en: 'Data Deletion Request?', km: 'សើ្នសុំលុបទិន្នន័យ?', zh: '数据删除请求？' }) }}</h5>
                <p>{{ tBy({ en: 'Want to export your personal data or erase your account completely?', km: 'ចង់នាំចេញទិន្នន័យផ្ទាល់ខ្លួន ឬលុបគណនីរបស់អ្នកទាំងស្រុង?', zh: '想要导出您的个人数据或彻底注销账户？' }) }}</p>
                <NuxtLink :to="localePath('/contact')" class="btn-contact">
                  <i class="ri-user-unfollow-line"></i> {{ tBy({ en: 'Request Account Erase', km: 'ស្នើសុំលុបគណនី', zh: '申请注销账户' }) }}
                </NuxtLink>
              </div>
            </div>
          </aside>

          <!-- Main Legal Article -->
          <article class="legal-article">
            <!-- Section 1: Overview -->
            <section id="introduction" class="article-section">
              <div class="section-header">
                <span class="section-number">01</span>
                <div>
                  <h2>{{ tBy({ en: 'Introduction & Data Controller Information', km: 'សេចក្តីផ្តើម និងព័ត៌មានអ្នកគ្រប់គ្រងទិន្នន័យ', zh: '引言与数据控制者信息' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Who we are and our commitment to protecting your privacy.', km: 'តើយើងជានរណា និងការប្តេជ្ញាចិត្តក្នុងការការពារឯកជនភាពរបស់អ្នក។', zh: '我们是谁以及我们保护您隐私的承诺。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>
                  {{ tBy({
                    en: 'This Privacy Policy describes how RTY Fitness (Riththy Dragon Martial & Fitness Club) ("we", "us", or "our"), operated under the leadership of Master Ny Rithy in Phnom Penh, Kingdom of Cambodia, collects, uses, stores, and protects personal information when you visit our web application (rithymartialfitness.com) or use our martial arts & fitness booking services.',
                    km: 'គោលការណ៍ឯកជនភាពនេះរៀបរាប់អំពីរបៀបដែល RTY Fitness (ក្លឹបកីឡាចម្រុះ និងសុខភាព រិទ្ធី ដ្រាហ្គន) ដឹកនាំដោយលោក ញ៉ី រិទ្ធី នៅរាជធានីភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា ប្រមូល ប្រើប្រាស់ រក្សាទុក និងការពារព័ត៌មានផ្ទាល់ខ្លួននៅពេលអ្នកចូលមើលកម្មវិធីវេបសាយ (rithymartialfitness.com) ឬប្រើប្រាស់សេវាកម្មកក់ថ្នាក់ក្បាច់គុន និងកាយសម្បទារបស់យើង។',
                    zh: '本隐私政策说明了由 Ny Rithy 大师在柬埔寨王国金边领衔运营的 RTY Fitness（Riththy Dragon 武术与健身俱乐部）在您访问我们的 Web 应用程序 (rithymartialfitness.com) 或使用我们的武术与健身预约服务时，如何收集、使用、存储和保护个人信息。'
                  }) }}
                </p>
                <div class="info-callout">
                  <i class="ri-shield-keyhole-line"></i>
                  <div>
                    <strong>{{ tBy({ en: 'Data Protection Commitment:', km: 'ការប្តេជ្ញាចិត្តការពារទិន្នន័យ៖', zh: '数据保护承诺：' }) }}</strong>
                    {{ tBy({
                      en: 'We respect your fundamental privacy rights. We do not sell, rent, or trade member or visitor personal information under any circumstances.',
                      km: 'យើងគោរពសិទ្ធិឯកជនភាពជាមូលដ្ឋានរបស់អ្នក។ យើងមិនលក់ ជួល ឬផ្លាស់ប្តូរព័ត៌មានផ្ទាល់ខ្លួនរបស់សមាជិក ឬអ្នកទស្សនាឡើយ ក្នុងគ្រប់ករណីទាំងអស់។',
                      zh: '我们尊重您的基本隐私权利。在任何情况下，我们都不会出售、出租或交易会员或访问者的个人信息。'
                    }) }}
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 2: Data We Collect -->
            <section id="data-collected" class="article-section">
              <div class="section-header">
                <span class="section-number">02</span>
                <div>
                  <h2>{{ tBy({ en: 'Information We Collect', km: 'ព័ត៌មានដែលយើងប្រមូល', zh: '我们收集的信息' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Data collected directly or through OAuth2 authentication.', km: 'ទិន្នន័យដែលបានប្រមូលដោយផ្ទាល់ ឬតាមរយៈការផ្ទៀងផ្ទាត់ OAuth2។', zh: '直接收集或通过 OAuth2 身份验证收集的数据。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <div class="data-types-grid">
                  <div class="data-card">
                    <div class="data-card-header">
                      <i class="ri-user-3-line"></i>
                      <h4>{{ tBy({ en: 'Identity & Profile Data', km: 'ទិន្នន័យអត្តសញ្ញាណ និងប្រវត្តិរូប', zh: '身份与个人资料数据' }) }}</h4>
                    </div>
                    <p>{{ tBy({ en: 'Full Name, Username, Profile Avatar URL, Language Preference, and Gender (optional for fitness customization).', km: 'ឈ្មោះពេញ ឈ្មោះអ្នកប្រើប្រាស់ រូបតំណាងប្រវត្តិរូប ភាសា និងភេទ (ជម្រើស)។', zh: '全名、用户名、个人头像 URL、语言偏好和性别（可选）。' }) }}</p>
                  </div>

                  <div class="data-card">
                    <div class="data-card-header">
                      <i class="ri-contacts-line"></i>
                      <h4>{{ tBy({ en: 'Contact Details', km: 'ព័ត៌មានទំនាក់ទំនង', zh: '联系方式详情' }) }}</h4>
                    </div>
                    <p>{{ tBy({ en: 'Email address, phone number (optional), and Telegram handle for class notifications and membership support.', km: 'អាសយដ្ឋានអ៊ីមែល លេខទូរស័ព្ទ និងគណនី Telegram សម្រាប់ការជូនដំណឹងថ្នាក់។', zh: '电子邮箱、电话号码以及用于课程通知的 Telegram 账号。' }) }}</p>
                  </div>

                  <div class="data-card">
                    <div class="data-card-header">
                      <i class="ri-google-line"></i>
                      <h4>{{ tBy({ en: 'OAuth Credentials', km: 'ព័ត៌មានសម្ងាត់ OAuth', zh: 'OAuth 登录凭据' }) }}</h4>
                    </div>
                    <p>{{ tBy({ en: 'Unique OAuth User ID, Provider Name (Google, Facebook, Telegram), access scope token, and verified email status.', km: 'អាយឌី OAuth ឈ្មោះសេវា (Google, Facebook, Telegram) តូខិន និងស្ថានភាពអ៊ីមែល។', zh: '唯一 OAuth 用户 ID、提供商名称（Google、Facebook、Telegram）、访问令牌与已验证邮箱状态。' }) }}</p>
                  </div>

                  <div class="data-card">
                    <div class="data-card-header">
                      <i class="ri-calendar-check-line"></i>
                      <h4>{{ tBy({ en: 'Fitness & Booking History', km: 'ប្រវត្តិកាយសម្បទា និងការកក់', zh: '健身与预约历史' }) }}</h4>
                    </div>
                    <p>{{ tBy({ en: 'Class booking history (Bokator, Kun Khmer, Strength & Conditioning), membership subscription tier, and attendance logs.', km: 'ប្រវត្តិកក់ថ្នាក់ (បុកាទ័រ គុនខ្មែរ កាយសម្បទា) កម្រិតសមាជិកភាព និងកំណត់ត្រាវត្តមាន។', zh: '课程预约历史（斗狮拳、高棉拳、体能训练）、会员订阅级别与出勤日志。' }) }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 3: Third-Party OAuth -->
            <section id="oauth-integration" class="article-section">
              <div class="section-header">
                <span class="section-number">03</span>
                <div>
                  <h2>{{ tBy({ en: 'Third-Party OAuth2 Providers (Google, Facebook, Telegram)', km: 'សេវា OAuth2 ភាគីទីបី (Google, Facebook, Telegram)', zh: '第三方 OAuth2 提供商（Google、Facebook、Telegram）' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'OAuth login verification & data scope usage.', km: 'ការផ្ទៀងផ្ទាត់ការចូល OAuth និងការប្រើប្រាស់វិសាលភាពទិន្នន័យ។', zh: 'OAuth 登录验证与数据作用域使用。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>
                  {{ tBy({
                    en: 'RTY Fitness supports single-click authentication via OAuth2 identity providers. When you register or log in using third-party services:',
                    km: 'RTY Fitness គាំទ្រការផ្ទៀងផ្ទាត់ការចូលដោយចុចតែម្តងតាមរយៈសេវាអត្តសញ្ញាណ OAuth2។ នៅពេលអ្នកចុះឈ្មោះ ឬចូលប្រើប្រាស់៖',
                    zh: 'RTY Fitness 支持通过 OAuth2 身份提供商进行一键登录验证。当您使用第三方服务注册或登录时：'
                  }) }}
                </p>
                <ul>
                  <li>
                    <strong>Google Sign-In:</strong>
                    {{ tBy({
                      en: 'We request access to openid, profile, and email. We use your Google profile name, avatar image, and email address solely to establish your RTY Fitness member account.',
                      km: 'យើងស្នើសុំការចូលប្រើប្រាស់ openid, profile, និង email។ យើងប្រើឈ្មោះ រូបថត និងអ៊ីមែល Google របស់អ្នកដើម្បីបង្កើតគណនីសមាជិក RTY Fitness ប៉ុណ្ណោះ។',
                      zh: '我们申请访问 openid、profile 和 email。我们使用您的 Google 个人资料姓名、头像和电子邮箱仅用于建立您的 RTY Fitness 会员账户。'
                    }) }}
                  </li>
                  <li>
                    <strong>Meta / Facebook Login:</strong>
                    {{ tBy({
                      en: 'We access public profile information (Name, Avatar Picture, Email). We never post content to your Facebook timeline or request friend list permissions.',
                      km: 'យើងចូលប្រើព័ត៌មានប្រវត្តិរូបសាធារណៈ (ឈ្មោះ រូបថត អ៊ីមែល)។ យើងមិនដែលផុសមាតិកាលើ Facebook របស់អ្នក ឬស្នើសុំបញ្ជីមិត្តភក្តិឡើយ។',
                      zh: '我们获取公开个人资料信息（姓名、头像、邮箱）。我们绝不会向您的 Facebook 时间线发布内容或索取好友列表权限。'
                    }) }}
                  </li>
                  <li>
                    <strong>Telegram Auth / Bot Login:</strong>
                    {{ tBy({
                      en: 'We verify the authentication cryptographic signature issued by Telegram (via our official bot RithyMartialBot) using Telegram User ID and username.',
                      km: 'យើងផ្ទៀងផ្ទាត់ហត្ថលេខាសុវត្ថិភាពពី Telegram (តាមរយៈប៊ុតផ្លូវការ RithyMartialBot) ដោយប្រើ Telegram User ID និង username។',
                      zh: '我们使用 Telegram 用户 ID 和用户名验证由 Telegram（通过官方 Bot RithyMartialBot）签发的身份验证加密签名。'
                    }) }}
                  </li>
                </ul>
              </div>
            </section>

            <!-- Section 4: Data Usage -->
            <section id="how-we-use-data" class="article-section">
              <div class="section-header">
                <span class="section-number">04</span>
                <div>
                  <h2>{{ tBy({ en: 'How We Use Your Personal Data', km: 'របៀបដែលយើងប្រើប្រាស់ទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក', zh: '我们如何使用您的个人数据' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Purpose and legal grounds for processing.', km: 'គោលបំណង និងមូលដ្ឋានច្បាប់សម្រាប់ការដំណើរការ។', zh: '处理数据的目的与法律依据。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>{{ tBy({ en: 'We process your personal information strictly for legitimate operational purposes:', km: 'យើងដំណើរការព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកយ៉ាងតឹងរ៉ឹងសម្រាប់គោលបំណងប្រតិបត្តិការស្របច្បាប់៖', zh: '我们严格出于合法的运营目的处理您的个人信息：' }) }}</p>
                <ul>
                  <li><strong>{{ tBy({ en: 'Account Management:', km: 'ការគ្រប់គ្រងគណនី៖', zh: '账户管理：' }) }}</strong> {{ tBy({ en: 'Creating, maintaining, and verifying your member identity.', km: 'បង្កើត រក្សាទុក និងផ្ទៀងផ្ទាត់អត្តសញ្ញាណសមាជិករបស់អ្នក។', zh: '创建、维护并验证您的会员身份。' }) }}</li>
                  <li><strong>{{ tBy({ en: 'Class Scheduling:', km: 'ការរៀបចំតារាងថ្នាក់៖', zh: '课程排课：' }) }}</strong> {{ tBy({ en: 'Processing bookings for Bokator, Kun Khmer, and 1-on-1 private training with Master Ny Rithy.', km: 'ដំណើរការការកក់សម្រាប់បុកាទ័រ គុនខ្មែរ និងការបង្វឹកផ្ទាល់ខ្លួន ១ទល់១ ជាមួយលោក ញ៉ី រិទ្ធី។', zh: '处理斗狮拳、高棉拳与 Ny Rithy 大师一对一私教课程的预约。' }) }}</li>
                  <li><strong>{{ tBy({ en: 'Communications:', km: 'ការទំនាក់ទំនង៖', zh: '沟通通知：' }) }}</strong> {{ tBy({ en: 'Sending class reminder notifications, booking confirmations, or security alerts.', km: 'ផ្ញើការជូនដំណឹងរំលឹកថ្នាក់ ការបញ្ជាក់ការកក់ ឬការជូនដំណឹងសុវត្ថិភាព។', zh: '发送上课提醒通知、预约确认或安全警报。' }) }}</li>
                  <li><strong>{{ tBy({ en: 'Security & Integrity:', km: 'សុវត្ថិភាព និងភាពត្រឹមត្រូវ៖', zh: '平台安全：' }) }}</strong> {{ tBy({ en: 'Detecting fraudulent logins, preventing unauthorized bot activity, and improving web performance.', km: 'ស្វែងរកការចូលប្រព័ន្ធបោកប្រាស់ ការពារសកម្មភាពប៊ុតគ្មានសិទ្ធិ និងកែលម្អប្រសិទ្ធភាពវេប។', zh: '检测欺诈性登录，防止未经授权的 Bot 活动并提高 Web 性能。' }) }}</li>
                </ul>
              </div>
            </section>

            <!-- Section 5: Cookies & Local Storage -->
            <section id="cookies-storage" class="article-section">
              <div class="section-header">
                <span class="section-number">05</span>
                <div>
                  <h2>{{ tBy({ en: 'Cookies & Local Storage Policy', km: 'គោលការណ៍ Cookies និងការរក្សាទុកក្នុងម៉ាស៊ីន', zh: 'Cookies 与本地存储政策' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Browser storage mechanisms used for session state.', km: 'យន្តការរក្សាទុកក្នុងកម្មវិធីរុករកសម្រាប់ស្ថានភាពវេន។', zh: '用于会话状态的浏览器存储机制。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>{{ tBy({ en: 'Our website utilizes cookies and browser localStorage to deliver a seamless browsing experience:', km: 'វេបសាយរបស់យើងប្រើប្រាស់ cookies និង localStorage ដើម្បីផ្តល់បទពិសោធន៍រុករកយ៉ាងរលូន៖', zh: '我们的网站利用 Cookie 和浏览器 localStorage 提供无缝的浏览体验：' }) }}</p>
                <ul>
                  <li><code>rmf-theme</code>: {{ tBy({ en: 'Stores your visual theme preference (Dark Mode or Light Mode).', km: 'រក្សាទុកចំណូលចិត្តរូបរាង (Dark Mode ឬ Light Mode)។', zh: '存储您的视觉主题偏好（深色模式或浅色模式）。' }) }}</li>
                  <li><code>i18n_redirected</code>: {{ tBy({ en: 'Stores your language selection (English, Khmer, or Chinese).', km: 'រក្សាទុកការជ្រើសរើសភាសា (អង់គ្លេស ខ្មែរ ឬចិន)។', zh: '存储您的语言选择（英语、高棉语或中文）。' }) }}</li>
                  <li><code>auth_token</code>: {{ tBy({ en: 'Secure HTTP-only tokens used to keep you signed in securely across page reloads.', km: 'តូខិនសុវត្ថិភាពប្រើដើម្បីរក្សាការចូលប្រព័ន្ធរបស់អ្នកដោយសុវត្ថិភាព។', zh: '用于在页面刷新间维持安全登录状态的 HTTP-only 令牌。' }) }}</li>
                </ul>
              </div>
            </section>

            <!-- Section 6: Data Sharing Policy -->
            <section id="data-sharing" class="article-section">
              <div class="section-header">
                <span class="section-number">06</span>
                <div>
                  <h2>{{ tBy({ en: 'Data Sharing & Third-Party Disclosure', km: 'ការចែករំលែកទិន្នន័យ និងការបង្ហើបឱ្យភាគីទីបី', zh: '数据共享与第三方披露' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'No selling or unauthorized sharing of member data.', km: 'គ្មានការលក់ ឬការចែករំលែកទិន្នន័យសមាជិកដោយគ្មានសិទ្ធិ។', zh: '绝不出售或未授权共享会员数据。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <div class="warning-callout">
                  <i class="ri-hand-coin-line"></i>
                  <div>
                    <strong>{{ tBy({ en: 'Strict No-Sale Policy:', km: 'គោលការណ៍ម៉ឺងម៉ាត់មិនលក់ទិន្នន័យ៖', zh: '严格的不出售政策：' }) }}</strong>
                    {{ tBy({
                      en: 'RTY Fitness will NEVER sell, lease, commercialize, or share your personal information with third-party advertisers, data brokers, or marketing syndicates.',
                      km: 'RTY Fitness នឹងមិនលក់ ជួល ឬចែករំលែកព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកទៅកាន់អ្នកផ្សាយពាណិជ្ជកម្ម ឬក្រុមហ៊ុនទីផ្សារឡើយ។',
                      zh: 'RTY Fitness 绝不会向第三方广告商、数据经纪人或营销财团出售、出租、商业化或共享您的个人信息。'
                    }) }}
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 7: User Rights & Deletion -->
            <section id="user-rights-deletion" class="article-section">
              <div class="section-header">
                <span class="section-number">07</span>
                <div>
                  <h2>{{ tBy({ en: 'Your Rights & Account Deletion Requests', km: 'សិទ្ធិរបស់អ្នក និងការស្នើសុំលុបគណនី', zh: '您的权利与账户注销申请' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'How to request data export or permanent account erasure.', km: 'របៀបស្នើសុំនាំចេញទិន្នន័យ ឬលុបគណនីជារៀងរហូត។', zh: '如何申请数据导出或永久注销账户。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <p>{{ tBy({ en: 'Under global privacy standards, you hold the following rights regarding your personal data:', km: 'ក្រោមស្តង់ដារឯកជនភាពសកល អ្នកមានសិទ្ធិដូចខាងក្រោមលើទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក៖', zh: '根据全球隐私标准，您对自己的个人数据享有以下权利：' }) }}</p>
                <ul>
                  <li><strong>{{ tBy({ en: 'Right to Access:', km: 'សិទ្ធិចូលមើល៖', zh: '访问权：' }) }}</strong> {{ tBy({ en: 'Request a copy of all personal data held about your account.', km: 'ស្នើសុំច្បាប់ចម្លងនៃទិន្នន័យផ្ទាល់ខ្លួនទាំងអស់ដែលបានរក្សាទុក។', zh: '索取您账户下保存的所有个人数据的副本。' }) }}</li>
                  <li><strong>{{ tBy({ en: 'Right to Rectification:', km: 'សិទ្ធិកែប្រែ៖', zh: '更正权：' }) }}</strong> {{ tBy({ en: 'Update inaccurate name, email, or contact information directly in your profile settings.', km: 'ធ្វើបច្ចុប្បន្នភាពឈ្មោះ អ៊ីមែល ឬព័ត៌មានទំនាក់ទំនងក្នុងកំណត់រចនាសម្ព័ន្ធប្រវត្តិរូប។', zh: '在个人资料设置中直接更新不准确的姓名、邮箱或联系信息。' }) }}</li>
                  <li><strong>{{ tBy({ en: 'Right to Erasure:', km: 'សិទ្ធិលុបចោល៖', zh: '删除权（注销账户）：' }) }}</strong> {{ tBy({ en: 'Request permanent deletion of your profile, booking records, and linked OAuth tokens.', km: 'ស្នើសុំលុបប្រវត្តិរូប កំណត់ត្រាកក់ និងតូខិន OAuth ជារៀងរហូត។', zh: '申请永久删除您的个人资料、预约记录和关联的 OAuth 令牌。' }) }}</li>
                </ul>

                <div class="deletion-box">
                  <h4><i class="ri-delete-bin-6-line"></i> {{ tBy({ en: 'How to Request Immediate Account & Data Erasure', km: 'របៀបស្នើសុំលុបគណនី និងទិន្នន័យភ្លាមៗ', zh: '如何申请立即注销账户与擦除数据' }) }}</h4>
                  <ol>
                    <li>{{ tBy({ en: 'Send an email to thynydragon@email.com with subject Data Deletion Request - [Username].', km: 'ផ្ញើសារអ៊ីមែលទៅកាន់ thynydragon@email.com ជាមួយប្រធានបទ Data Deletion Request - [ឈ្មោះអ្នកប្រើប្រាស់]។', zh: '发送电子邮件至 thynydragon@email.com，主题为 Data Deletion Request - [用户名]。' }) }}</li>
                    <li>{{ tBy({ en: 'Alternatively, contact Master Ny Rithy via Telegram at @NY_RITHY or phone +855 97 905 3790.', km: 'ឬទំនាក់ទំនងលោក ញ៉ី រិទ្ធី តាម Telegram @NY_RITHY ឬទូរស័ព្ទ +855 97 905 3790។', zh: '或者通过 Telegram @NY_RITHY 或致电 +855 97 905 3790 联系 Ny Rithy 大师。' }) }}</li>
                    <li>{{ tBy({ en: 'Upon verification, your account, credentials, and associated data will be permanently purged within 48 hours.', km: 'បន្ទាប់ពីការផ្ទៀងផ្ទាត់ គណនី និងទិន្នន័យដែលទាក់ទងរបស់អ្នកនឹងត្រូវលុបជារៀងរហូតក្នុងរយៈពេល ៤៨ ម៉ោង។', zh: '在验证身份后，您的账户、凭据和关联数据将在 48 小时内被永久清除。' }) }}</li>
                  </ol>
                </div>
              </div>
            </section>

            <!-- Section 8: Contact Information -->
            <section id="privacy-contact" class="article-section">
              <div class="section-header">
                <span class="section-number">08</span>
                <div>
                  <h2>{{ tBy({ en: 'Contact Privacy Officer', km: 'ទំនាក់ទំនងមន្ត្រីឯកជនភាព', zh: '联系隐私专员' }) }}</h2>
                  <p class="section-sub">{{ tBy({ en: 'Get in touch regarding privacy or OAuth2 compliance.', km: 'ទំនាក់ទំនងទាក់ទងនឹងឯកជនភាព ឬការអនុវត្តតាម OAuth2។', zh: '就隐私或 OAuth2 合规问题与我们联系。' }) }}</p>
                </div>
              </div>
              <div class="section-body">
                <div class="contact-card">
                  <div class="contact-row">
                    <i class="ri-building-4-line"></i>
                    <div>
                      <strong>Riththy Dragon Martial & Fitness Club</strong>
                      <span>{{ tBy({ en: 'Data Privacy Controller: Mr. Ny Rithy', km: 'អ្នកគ្រប់គ្រងឯកជនភាពទិន្នន័យ៖ លោក ញ៉ី រិទ្ធី', zh: '数据隐私控制人：Ny Rithy 大师' }) }}</span>
                    </div>
                  </div>
                  <div class="contact-row">
                    <i class="ri-map-pin-line"></i>
                    <div>
                      <strong>{{ tBy({ en: 'Facility Address', km: 'អាសយដ្ឋានមជ្ឈមណ្ឌល', zh: '场馆地址' }) }}</strong>
                      <span>#123, Street 123, Phnom Penh, Kingdom of Cambodia</span>
                    </div>
                  </div>
                  <div class="contact-row">
                    <i class="ri-mail-send-line"></i>
                    <div>
                      <strong>{{ tBy({ en: 'Official Email & OAuth Support', km: 'អ៊ីមែលផ្លូវការ និងគាំទ្រ OAuth', zh: '官方邮箱与 OAuth 支持' }) }}</strong>
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
  title: 'Privacy Policy & Data Protection | RTY Fitness',
  meta: [
    { name: 'description', content: 'Official Privacy Policy for RTY Fitness. Learn how we collect, protect, and process user data, OAuth2 logins, and account deletion requests.' },
    { property: 'og:title', content: 'Privacy Policy & Data Protection | RTY Fitness' },
    { property: 'og:description', content: 'Official Privacy Policy and OAuth2 Data Protection Guidelines for Riththy Dragon Martial & Fitness Club.' }
  ]
})

const searchQuery = ref('')
const activeSection = ref('introduction')

const sections = [
  { id: 'introduction', title: { en: '1. Introduction & Controller', km: '១. សេចក្តីផ្តើម និងអ្នកគ្រប់គ្រង', zh: '1. 引言与控制者' }, icon: 'ri-information-line' },
  { id: 'data-collected', title: { en: '2. Information We Collect', km: '២. ព័ត៌មានដែលយើងប្រមូល', zh: '2. 收集的信息' }, icon: 'ri-user-shared-line' },
  { id: 'oauth-integration', title: { en: '3. OAuth2 Providers (Google/FB/TG)', km: '៣. សេវា OAuth2 (Google/FB/TG)', zh: '3. OAuth2 提供商' }, icon: 'ri-google-line' },
  { id: 'how-we-use-data', title: { en: '4. How We Use Data', km: '៤. របៀបប្រើប្រាស់ទិន្នន័យ', zh: '4. 数据使用方式' }, icon: 'ri-settings-4-line' },
  { id: 'cookies-storage', title: { en: '5. Cookies & Local Storage', km: '៥. Cookies និងការរក្សាទុក', zh: '5. Cookies 与存储' }, icon: 'ri-database-2-line' },
  { id: 'data-sharing', title: { en: '6. Data Sharing Policy', km: '៦. ការចែករំលែកទិន្នន័យ', zh: '6. 数据共享政策' }, icon: 'ri-hand-coin-line' },
  { id: 'user-rights-deletion', title: { en: '7. User Rights & Deletion', km: '៧. សិទ្ធិ និងការលុបគណនី', zh: '7. 权利与注销' }, icon: 'ri-user-unfollow-line' },
  { id: 'privacy-contact', title: { en: '8. Contact Privacy Officer', km: '៨. ទំនាក់ទំនងមន្ត្រីឯកជនភាព', zh: '8. 联系隐私专员' }, icon: 'ri-contacts-book-line' }
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
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(10, 10, 10, 0.95) 100%),
              radial-gradient(circle at 50% 0%, rgba(220, 38, 38, 0.12), transparent 70%);
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
    background: linear-gradient(90deg, #2563eb, #eab308, #2563eb);
  }
}

.legal-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(37, 99, 235, 0.4);
  color: #60a5fa;
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
    color: #60a5fa;
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
  color: #60a5fa;
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
      color: #60a5fa;
    }
  }

  &.active {
    background: rgba(37, 99, 235, 0.15);
    color: #ffffff;
    border-left: 3px solid #2563eb;

    i {
      color: #60a5fa;
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
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
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
    color: #2563eb;
    background: rgba(37, 99, 235, 0.1);
    border: 1px solid rgba(37, 99, 235, 0.3);
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

  code {
    background: rgba(255, 255, 255, 0.1);
    color: #eab308;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-size: 0.85em;
  }

  a {
    color: #60a5fa;
    text-decoration: underline;

    &:hover {
      color: #eab308;
    }
  }
}

.info-callout {
  display: flex;
  gap: 1rem;
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.3);
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
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 1rem;

  i {
    font-size: 1.5rem;
    color: #f87171;
    flex-shrink: 0;
  }

  strong {
    color: #ffffff;
  }
}

.data-types-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 1.25rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.data-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 1.25rem;

  .data-card-header {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 0.5rem;

    i {
      font-size: 1.35rem;
      color: #2563eb;
    }

    h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
    }
  }

  p {
    font-size: 0.85rem;
    color: #a3a3a3;
    margin-bottom: 0;
    line-height: 1.5;
  }
}

.deletion-box {
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 1.25rem;

  h4 {
    font-size: 1.05rem;
    font-weight: 700;
    color: #f87171;
    margin-bottom: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  ol {
    padding-left: 1.25rem;
    margin-bottom: 0;

    li {
      margin-bottom: 0.6rem;
      font-size: 0.9rem;
      color: #e5e5e5;
    }
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
    color: #2563eb;
    background: rgba(37, 99, 235, 0.1);
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
