<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="gold" />
    <NuxtLayout :transition="{ name: 'page', mode: 'out-in' }" :dark="!false">
      <NuxtPage />
    </NuxtLayout>
    <AutoResponsePanel />
  </div>
</template>

<script setup>
const route = useRoute()
const { locale } = useI18n()

useHead(() => ({
  // bodyAttrs: {
  //   class: 'dark:dark'
  // },
  htmlAttrs: {
    lang: locale.value ?? 'en',
    class: 'dark:dark'
  },
  titleTemplate: (titleChunk) =>
    titleChunk
      ? `${titleChunk} | Rithy Martial & Fitness`
      : 'Rithy Martial & Fitness — Premier Cambodian Martial Arts & Fitness Training'
}))


</script>