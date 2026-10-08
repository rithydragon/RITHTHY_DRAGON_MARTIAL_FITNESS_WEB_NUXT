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
const { data } = await useWeb(`/api/v1/rty/dragon/site/pages/${slug.value}`)
const pageComponent = computed(() => {
  const flatKey = `/components/pages/${slug.value}.vue`
  const dirKey = `/components/pages/${slug.value}/index.vue`
  
  if (modules[flatKey]) return defineAsyncComponent(modules[flatKey])
  if (modules[dirKey]) return defineAsyncComponent(modules[dirKey])
  return null
})
 
const notFound = computed(() => !pageComponent.value && !data.value)

// detail routes only, so a listing page doesn't take its first item's title
const item = computed(() =>
  slug.value.includes('/') ? data.value?.data?.item ?? data.value?.data?.items?.[0] ?? null : null
)

if (notFound.value && import.meta.server) {
  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}

useSeo(() =>
  notFound.value
    ? { path: route.path, title: 'Page not found', noindex: true }
    : { path: route.path, object: data.value, item: item.value }
)


// Swap this for the real endpoint/store — this is the shape from the
// provided API sample: { status, data: { items, pagination }, seo }
// const { data, error } = await useWeb(`/api/v1/rty/dragon/site/pages/${slug.value}`)
 
// const item = computed(() => data.value?.data?.items?.[0] ?? null)
 

</script>