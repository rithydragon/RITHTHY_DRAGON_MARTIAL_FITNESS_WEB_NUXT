<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="gold" />
    <NuxtLayout :transition="{ name: 'page', mode: 'out-in' }">
      <NuxtPage />
    </NuxtLayout>
    <AutoResponsePanel />
  </div>
</template>

<script setup>
const route = useRoute()
const { locale } = useI18n()

useHead(() => ({
  htmlAttrs: {
    lang: locale.value ?? 'en'
  },
  titleTemplate: (titleChunk) =>
    titleChunk
      ? `${titleChunk} | Rithy Martial & Fitness`
      : 'Rithy Martial & Fitness — Premier Cambodian Martial Arts & Fitness Training'
}))
</script>