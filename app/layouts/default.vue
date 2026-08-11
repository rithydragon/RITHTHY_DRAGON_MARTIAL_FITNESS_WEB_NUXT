<template>
  <div class="app-layout">
    <Header />
    <main class="app-main">
      <slot />
    </main>
    <Footer />
    <NotificationToast />
    <AuthModal
      :isOpen="isAuthOpen"
      :mode="authMode"
      @close="closeAuthModal"
      @switchMode="switchAuthMode"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const isAuthOpen = computed(() => !!route.query.auth)
const authMode = computed<'login' | 'register' | 'join'>(() => {
  const mode = route.query.auth as string
  if (mode === 'join' || mode === 'register' || mode === 'login') return mode
  return 'login'
})

function closeAuthModal() {
  const query = { ...route.query }
  delete query.auth
  router.push({ query })
}

function switchAuthMode(newMode: 'login' | 'register' | 'join') {
  router.push({ query: { ...route.query, auth: newMode } })
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding-top: var(--header-height);
}
</style>
