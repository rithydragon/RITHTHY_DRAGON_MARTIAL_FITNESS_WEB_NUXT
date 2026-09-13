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
      ? `${titleChunk} | RITHTHY Fitness`
      : 'RITHTHY Fitness — Premier Fitness Training'
}))


</script>