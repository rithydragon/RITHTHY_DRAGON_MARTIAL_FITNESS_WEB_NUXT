<template>
  <header class="navbar" :class="{ 'is-scrolled': screen.isScrolled, 'is-open': isMenuOpen }">
    <div class="navbar__inner container">
      <!-- Logo using NuxtLink -->
      <NuxtLink :to="localePath('/')" class="navbar__logo" @click="closeMenu">
        <span class="navbar__logo-mark">RMF</span>
      </NuxtLink>

      <!-- Desktop Primary Navigation -->
      <nav v-if="!screen.isMobile" class="navbar__menu" aria-label="Primary">
        <div v-for="item in menuList" :key="item.id" class="navbar__item">
          <!-- Level 0 Top Item -->
          <NuxtLink
            :to="localePath(item.path || '/')"
            class="navbar__link"
            :class="{ 'is-active': isRouteActive(item.path) }"
          >
            {{ getLabel(item.label) }}
            <!-- <i v-if="item.children" class="ri-arrow-down-s-line navbar__caret"></i> -->
          </NuxtLink>

          <!-- Level 1 Dropdown Menu -->
          <div v-if="item.children" class="navbar__dropdown">
            <div
              v-for="child in item.children"
              :key="child.id"
              class="navbar__dropdown-item"
            >
              <NuxtLink
                :to="localePath(child.path || '/')"
                class="navbar__dropdown-link"
                :class="{ 'has-sub': child.children || child.subChildren }"
              >
                <span>{{ getLabel(child.label) }}</span>
                <!-- <i v-if="child.children || child.subChildren" class="ri-arrow-right-s-line navbar__sub-caret"></i> -->
              </NuxtLink>

              <!-- Level 2 Sub-Dropdown Flyout Menu -->
              <div v-if="child.children || child.subChildren" class="navbar__sub-dropdown">
                <NuxtLink
                  v-for="subChild in (child.children || child.subChildren)"
                  :key="subChild.id"
                  :to="localePath(subChild.path || '/')"
                  class="navbar__sub-dropdown-link"
                >
                  {{ getLabel(subChild.label) }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Actions -->
      <div class="navbar__actions">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
        <template v-if="auth.isLoggedIn">
          <NuxtLink :to="localePath('/account')" class="navbar__user">
            <span class="navbar__user-avatar">{{ auth.userInitials }}</span>
          </NuxtLink>
        </template>
        <template v-else>
          <button class="btn btn--ghost navbar__btn-login" @click="openLogin">{{ t('common.login') || 'Login' }}</button>
          <button class="btn btn--primary navbar__btn-join" @click="openJoin">{{ t('common.joinNow') || 'Join Now' }}</button>
        </template>
      </div>

      <!-- Mobile Hamburger Button -->
      <button class="navbar__burger" :class="{ 'is-active': isMenuOpen }" @click="toggleMenu" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Mobile Drawer Menu -->
    <Transition name="slide-down">
      <nav v-if="isMenuOpen" class="navbar__mobile">
        <div v-for="item in menuList" :key="item.id" class="navbar__mobile-group">
          <div class="navbar__mobile-head">
            <NuxtLink
              :to="localePath(item.path || '/')"
              class="navbar__mobile-link"
              @click="closeMenu"
            >
              {{ getLabel(item.label) }}
            </NuxtLink>
            <button
              v-if="item.children"
              class="navbar__mobile-expand-btn"
              @click="toggleMobileSub(item.id)"
            >
              <i :class="expandedMobileSubs.includes(item.id) ? 'ri-subtract-line' : 'ri-add-line'"></i>
            </button>
          </div>

          <!-- Mobile Sub-Menu Level 1 -->
          <div v-if="item.children && expandedMobileSubs.includes(item.id)" class="navbar__mobile-sub">
            <div v-for="child in item.children" :key="child.id" class="navbar__mobile-sub-item">
              <NuxtLink
                :to="localePath(child.path || '/')"
                class="navbar__mobile-sub-link"
                @click="closeMenu"
              >
                {{ getLabel(child.label) }}
              </NuxtLink>

              <!-- Mobile Sub-Children Level 2 -->
              <div v-if="child.children || child.subChildren" class="navbar__mobile-subchild-list">
                <NuxtLink
                  v-for="subChild in (child.children || child.subChildren)"
                  :key="subChild.id"
                  :to="localePath(subChild.path || '/')"
                  class="navbar__mobile-subchild-link"
                  @click="closeMenu"
                >
                  └ {{ getLabel(subChild.label) }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div class="navbar__mobile-actions">
          <button class="btn btn--ghost" @click="openLogin">{{ t('common.login') || 'Login' }}</button>
          <button class="btn btn--primary" @click="openJoin">{{ t('common.joinNow') || 'Join Now' }}</button>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const screen = useScreenStore()
const auth = useAuthStore()
const menu = await useMenuData()
const { t } = useI18n()
const route = useRoute()
const menuList = ref([])
const isMenuOpen = ref(false)
const expandedMobileSubs = ref([])

onMounted(() => {
  menuList.value = Array.isArray(menu.navbar) ? menu.navbar : []
})

function getLabel(lblKey) {
  if (!lblKey) return ''
  if (lblKey.startsWith('nav.')) {
    const translated = t(lblKey)
    return translated !== lblKey ? translated : lblKey.replace('nav.', '')
  }
  return t(`nav.${lblKey}`)
}

function isRouteActive(targetPath) {
  if (!targetPath) return false
  if (targetPath === '/' && route.path === '/') return true
  if (targetPath !== '/' && route.path.startsWith(targetPath)) return true
  return false
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function toggleMobileSub(id) {
  const idx = expandedMobileSubs.value.indexOf(id)
  if (idx > -1) {
    expandedMobileSubs.value.splice(idx, 1)
  } else {
    expandedMobileSubs.value.push(id)
  }
}

function openLogin() {
  closeMenu()
  navigateTo(localePath('/?auth=login'))
}

function openJoin() {
  closeMenu()
  navigateTo(localePath('/?auth=join'))
}

watch(() => route.path, () => closeMenu())
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height, 80px);
  background: transparent;
  z-index: 9999;
  transition: background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
}

.navbar.is-scrolled {
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: var(--space-2, 1rem);
}

.navbar__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.navbar__logo-mark {
  font-family: var(--font-sans, sans-serif);
  font-weight: 800;
  font-size: 1.35rem;
  color: var(--c-primary, #eab308);
  letter-spacing: 0.05em;
}

.navbar__menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar__item {
  position: relative;
}

.navbar__link {
  font-weight: 500;
  font-size: 0.94rem;
  padding: 0.5rem 0;
  color: var(--c-muted);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.navbar__link:hover,
.navbar__link.is-active {
  color: var(--c-primary, #eab308);
  border-color: var(--c-primary, #eab308);
}

.navbar__caret {
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.navbar__item:hover .navbar__caret {
  transform: rotate(180deg);
}

/* Level 1 Dropdown */
.navbar__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  display: none;
  flex-direction: column;
  padding: 0.5rem 0;
  background: var(--c-surface);
  backdrop-filter: blur(16px);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.navbar__item:hover .navbar__dropdown {
  display: flex;
}

.navbar__dropdown-item {
  position: relative;
}

.navbar__dropdown-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  color: var(--c-text);
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.navbar__dropdown-link:hover {
  background: var(--c-primary-soft);
  color: var(--c-primary);
}

.navbar__sub-caret {
  font-size: 0.85rem;
}

/* Level 2 Sub-Dropdown Flyout */
.navbar__sub-dropdown {
  position: absolute;
  top: 0;
  left: 100%;
  min-width: 220px;
  display: none;
  flex-direction: column;
  padding: 0.5rem 0;
  background: var(--c-surface);
  backdrop-filter: blur(16px);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
  z-index: 101;
}

.navbar__dropdown-item:hover .navbar__sub-dropdown {
  display: flex;
}

.navbar__sub-dropdown-link {
  padding: 0.55rem 1rem;
  font-size: 0.825rem;
  color: var(--c-muted);
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.navbar__sub-dropdown-link:hover {
  background: var(--c-primary-soft);
  color: var(--c-primary);
}

/* Navbar Actions */
.navbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar__btn-login {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

.navbar__btn-join {
  padding: 0.5rem 1.25rem;
  font-size: 0.8125rem;
}

.navbar__user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(234, 179, 8, 0.15);
  color: var(--c-primary, #eab308);
  font-weight: 700;
  font-size: 0.75rem;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

/* Burger Button */
.navbar__burger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;

  span {
    width: 24px;
    height: 2px;
    background: var(--c-text);
    border-radius: 2px;
    transition: all 0.25s ease;
  }

  &.is-active span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  &.is-active span:nth-child(2) {
    opacity: 0;
  }
  &.is-active span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }
}

@media (min-width: 1024px) {
  .navbar__burger {
    display: none;
  }
}

/* Mobile Drawer */
.navbar__mobile {
  position: absolute;
  top: var(--header-height, 80px);
  left: 0;
  right: 0;
  background: var(--c-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--c-border);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-height: 80vh;
  overflow-y: auto;
}

.navbar__mobile-group {
  display: flex;
  flex-direction: column;
}

.navbar__mobile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar__mobile-link {
  padding: 0.6rem 0.8rem;
  color: var(--c-text);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
}

.navbar__mobile-expand-btn {
  background: transparent;
  border: none;
  color: var(--c-primary, #eab308);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.4rem;
}

.navbar__mobile-sub {
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-left: 2px solid rgba(234, 179, 8, 0.3);
  margin-left: 0.5rem;
}

.navbar__mobile-sub-link {
  color: var(--c-muted);
  font-size: 0.875rem;
  text-decoration: none;

  &:hover {
    color: var(--c-primary);
  }
}

.navbar__mobile-subchild-list {
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

.navbar__mobile-subchild-link {
  font-size: 0.8rem;
  color: var(--c-muted);
  text-decoration: none;

  &:hover {
    color: var(--c-primary);
  }
}

.navbar__mobile-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--c-border);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
