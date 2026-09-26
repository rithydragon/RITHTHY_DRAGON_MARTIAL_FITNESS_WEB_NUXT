<template>
  <component :is="pageComponent" v-if="pageComponent" />
  <NotFound v-else />
</template>

<script setup>
import { defineAsyncComponent, computed, watchEffect } from 'vue'
import { useSeo } from '#imports'
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
 
// Swap this for the real endpoint/store — this is the shape from the
// provided API sample: { status, data: { items, pagination }, seo }
// const { data, error } = await useWeb(`/api/v1/rty/dragon/site/pages/${slug.value}`)
 
const item = computed(() => data.value?.data?.items?.[0] ?? null)
 
// This is the whole point: pass the route path plus the raw API response,
// and useSeo pulls metaTitle/description/openGraph/twitter/structuredData
// straight out of response.seo, falling back to page_seo.json for anything
// the API didn't send.
// useSeo({ path: route.path, object: response.value })
// Automatically bind SEO metadata from page_seo.json via useSeo
watchEffect( async () => {
  if (slug.value) {
    const { data, error } = await useWeb(`/api/v1/rty/dragon/site/pages/${slug.value}`)
    // useSeo(slug.value)
    useSeo({ path: route.path,object: data.value?.seo })
  }
})
</script>