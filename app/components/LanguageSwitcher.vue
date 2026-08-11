<template>
  <div class="lang-switcher" :class="{ 'is-open': isOpen }" ref="targetRef">
    <button class="lang-switcher__btn" @click="isOpen = !isOpen" :aria-label="t('common.language')">
      <span class="lang-switcher__current">{{ locale.toUpperCase() }}</span>
    </button>
    <Transition name="fade">
      <ul v-if="isOpen" class="lang-switcher__menu">
        <li v-for="l in locales" :key="l.code">
          <button
            class="lang-switcher__option"
            :class="{ 'is-active': locale === l.code }"
            @click="select(l.code)"
          >
            <span class="lang-switcher__code">{{ l.code.toUpperCase() }}</span>
            <span class="lang-switcher__name">{{ l.name }}</span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { Locale } from '~/app/composables/useI18n'

const { locale, setLocale, t } = useI18n()
const isOpen = ref(false)
const targetRef = ref<HTMLElement | null>(null)
onClickOutside(targetRef, () => {
  isOpen.value = false
})

const locales = [
  { code: 'en' as Locale, name: 'English' ,img:''},
  { code: 'km' as Locale, name: 'ខ្មែរ' ,img:''},
  { code: 'zh' as Locale, name: '中文' ,img:''},
]

function select(l: Locale) {
  setLocale(l)
  isOpen.value = false
}
</script>

<style scoped>
.lang-switcher {
  position: relative;
}

.lang-switcher__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
  height: 40px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  font-weight: 600;
  font-size: 0.75rem;
  transition: all var(--transition-base);

  &:hover {
    color: var(--c-primary);
    border-color: var(--c-primary);
  }
}

.lang-switcher__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  padding: 0.25rem;
  z-index: var(--z-header);
}

.lang-switcher__option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--c-muted);
  font-size: 0.8125rem;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--c-primary-soft);
    color: var(--c-primary);
  }

  &.is-active {
    color: var(--c-primary);
    font-weight: 600;
  }
}

.lang-switcher__code {
  font-weight: 600;
  font-size: 0.75rem;
  min-width: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
