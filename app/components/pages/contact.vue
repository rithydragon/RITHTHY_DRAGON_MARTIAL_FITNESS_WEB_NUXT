<template>
  <div class="contact-page">
    <section class="section">
      <div class="container">
        <SectionHeader
          :eyebrow="t('contact.eyebrow')"
          :title="t('contact.title')"
          :subtitle="t('contact.subtitle')"
          centered
        />

        <div class="contact-page__grid">
          <div class="contact-page__info" data-animate="slide-right">
            <div class="contact-page__info-item">
              <h3>{{ t('contact.address') }}</h3>
              <p>{{ t('contact.addressValue') }}</p>
            </div>
            <div class="contact-page__info-item">
              <h3>{{ t('contact.phone') }}</h3>
              <p>+855 23 123 456</p>
            </div>
            <div class="contact-page__info-item">
              <h3>{{ t('contact.email') }}</h3>
              <p>info@rithymartialfitness.com</p>
            </div>
            <div class="contact-page__info-item">
              <h3>{{ t('contact.hours') }}</h3>
              <p>{{ t('contact.hoursValue') }}</p>
            </div>

            <div class="contact-page__map">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=104.8865%2C11.5440%2C104.9465%2C11.5840&layer=mapnik&marker=11.5640%2C104.9165"
                width="100%"
                height="300"
                style="border:0; border-radius: var(--radius-lg);"
                loading="lazy"
                :title="t('contact.findUs')"
              />
            </div>
          </div>

          <form class="contact-page__form card" data-animate="slide-left" @submit.prevent="handleSubmit">
            <div class="contact-page__field">
              <label>{{ t('contact.formName') }}</label>
              <input v-model="form.name" type="text" required :placeholder="t('contact.formName')" />
            </div>
            <div class="contact-page__field">
              <label>{{ t('contact.formEmail') }}</label>
              <input v-model="form.email" type="email" required :placeholder="t('contact.formEmail')" />
            </div>
            <div class="contact-page__field">
              <label>{{ t('contact.formPhone') }}</label>
              <input v-model="form.phone" type="tel" :placeholder="t('contact.formPhone')" />
            </div>
            <div class="contact-page__field">
              <label>{{ t('contact.formMessage') }}</label>
              <textarea v-model="form.message" rows="5" required :placeholder="t('contact.formMessage')"></textarea>
            </div>
            <button type="submit" class="btn btn--primary" :disabled="submitting">
              {{ submitting ? '...' : t('contact.formSubmit') }}
            </button>
            <Transition name="fade">
              <p v-if="submitted" class="contact-page__success">{{ t('contact.formSuccess') }}</p>
            </Transition>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const { t } = useI18n()
const animate = useAnimate()

useSeo('contact')

onMounted(() => {
  animate.init()
})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
})

const submitting = ref(false)
const submitted = ref(false)

async function handleSubmit() {
  submitting.value = true
  try {
    // In production this would call the API
    await new Promise((r) => setTimeout(r, 1000))
    submitted.value = true
    form.name = ''
    form.email = ''
    form.phone = ''
    form.message = ''
    setTimeout(() => (submitted.value = false), 5000)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.contact-page__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .contact-page__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.contact-page__info-item {
  margin-bottom: var(--space-3);

  h3 {
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--c-primary);
    margin-bottom: 0.25rem;
  }

  p {
    color: var(--c-muted);
    font-size: 0.9375rem;
  }
}

.contact-page__map {
  margin-top: var(--space-3);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.contact-page__field {
  margin-bottom: var(--space-2);

  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--c-muted);
    margin-bottom: 0.25rem;
  }

  input, textarea {
    width: 100%;
    padding: 0.625rem 0.875rem;
    background: var(--c-bg);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-md);
    color: var(--c-text);
    font-size: 0.875rem;
    transition: border-color var(--transition-fast);
    font-family: inherit;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: var(--c-primary);
    }
  }
}

.contact-page__success {
  margin-top: var(--space-2);
  padding: var(--space-2);
  background: var(--c-success);
  color: #fff;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
