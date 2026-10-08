<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="gold" />
    <NuxtLayout :transition="{ name: 'page', mode: 'out-in' }" :dark="!false">
      <NuxtPage />
    </NuxtLayout>
    <!-- <AutoResponsePanel /> -->
    <NotifPanel />
    <UserProfilePanel />
    <AIAssistantFloat />
    <AppToastContainer />
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
      ? `${titleChunk} | RTY Fitness`
      : 'RTY Fitness — Premier Fitness Training',
  link: [
    {
      rel: 'canonical',
      href: 'https://rtyfitness.riththydragon.site/',
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'RTY Fitness',
        alternateName: ['RTY FITNESS', 'RTY'],
        url: 'https://rtyfitness.riththydragon.site/',
      }),
    },
  ],
}))
</script>