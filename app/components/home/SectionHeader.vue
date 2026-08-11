<template>
  <div class="section-header" :class="{ 'is-centered': centered }">
    <span v-if="eyebrow" class="eyebrow" data-animate="slide-down">{{ eyebrow }}</span>
    <h2 class="section-title" data-animate="slide-up">{{ title }}</h2>
    <p v-if="subtitle" class="section-subtitle" data-animate="slide-up" data-delay="100">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
}>()
</script>

<style scoped>
.section-header {
  margin-bottom: var(--space-5);

  &.is-centered {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
