<template>
  <component :is="pageComponent" v-if="pageComponent" />
  <NotFound v-else />
</template>

<script setup>
import { defineAsyncComponent, computed, watchEffect } from 'vue'

const route = useRoute()
const modules = import.meta.glob('~/components/pages/**/*.vue')

const slug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? raw.join('/') : raw
})

const pageComponent = computed(() => {
  const flatKey = `/components/pages/${slug.value}.vue`
  const dirKey = `/components/pages/${slug.value}/index.vue`
  
  if (modules[flatKey]) return defineAsyncComponent(modules[flatKey])
  if (modules[dirKey]) return defineAsyncComponent(modules[dirKey])
  return null
})

// Automatically bind SEO metadata from page_seo.json via useSeo
watchEffect(() => {
  if (slug.value) {
    useSeo(slug.value)
  }
})
</script>