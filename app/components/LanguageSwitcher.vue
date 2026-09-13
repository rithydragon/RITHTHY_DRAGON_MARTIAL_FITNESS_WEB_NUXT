<template>
  <div class="lang-switcher" :class="{ 'is-open': isOpen }" ref="targetRef">
    <button class="lang-switcher__btn" @click="isOpen = !isOpen" :aria-label="t('common.language')">
      <img :src="currentLang(locale)?.flag"/>
    </button>
    <Transition name="fade">
      <ul v-if="isOpen" class="lang-switcher__menu">
        <li v-for="l in localesLangs" :key="l.code">
          <button
            class="lang-switcher__option"
            :class="{ 'is-active': locale === l.code }"
            :disabled="locale === l.code"
            @click="select(l.code)"
          >
            <img :src="l.flag" /> <span class="lang-switcher__name">{{ l.name }}</span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const { locale, locales,setLocale, t } = useI18n()
console.log(" locale ======================> ", locale)
const isOpen = ref(false)
const targetRef = ref(null)
onClickOutside(targetRef, () => {
  isOpen.value = false
})

const i18n_redirected = useCookie('i18n_redirected')
console.log(" i18n_redirected ======================> ", i18n_redirected.value)
const currentLang = (lang) => {
  const item = locales.value?.find((e) => e.code === lang)

  return item
    ? { code: item.code, flag: item.flag, name: item.name }
    : null
}

const locales1 = [
  { code: 'en' , name: 'English' ,img:''},
  { code: 'km' , name: 'ខ្មែរ' ,img:''},
  { code: 'zh' , name: '中文' ,img:''},
]
const localesLangs = computed(() => {
  return locales.value.map(lang => ({
    code: lang.code,
    name: lang.name,
    flag: `/flags/${lang.code === 'en'
      ? 'gb'
      : lang.code === 'km'
        ? 'kh'
        : 'zh'
    }.svg`
  }))
})

function select(l) {
  setLocale(l)
  i18n_redirected.value = l
  isOpen.value = false
}
</script>

<style lang="scss" scoped>
.lang-switcher {
  position: relative;
}

.lang-switcher__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  // height: 40px !important;
  // width: 40px !important;
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
  // @media (max-width: 768px) {
  //   width: 30px !important;
  //   height: 30px !important;
  // }
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
    pointer-events: none;
    opacity: 0.8;
  }
}

.lang-switcher__btn img{
  min-width: 25px !important;
  min-height: 25px !important;
  border-radius: 50%;
  object-fit:cover;
}

.lang-switcher__option img{
  width: 25px !important;
  height: 25px !important;
  border-radius: 50%;
  object-fit: cover;
  padding: 2px;
  border: 1px solid green;
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
