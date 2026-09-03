<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: {
    type: [String, Object],
    default: '/'
  }
})

const computedTo2 = computed(() => {
  if (!props.to) return '/'
  if (typeof props.to !== 'string') {
    return props.to
  }

  return /^(https?:)?\/\//.test(props.to)
    ? props.to
    : localePath(props.to)
})

const computedTo = computed(() => {
  if (!props.to) return localePath('/')

  if (typeof props.to !== 'string') {
    return props.to
  }

  // External URL
  if (/^(https?:)?\/\//.test(props.to)) {
    return props.to
  }

  // Internal route
  return localePath(props.to)
})

console.log(" ===== RLink ===== ",computedTo.value)
</script>

<template>
  <NuxtLink
    v-bind="$attrs"
    :to="localePath(props.to)"
  >
    <slot />
  </NuxtLink>
</template>