<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: {
    type: [String, Object],
    default: '/'
  }
})

const localePath = useLocalePath()

const computedTo = computed(() => {
  if (!props.to) return '/'
  if (typeof props.to !== 'string') {
    return props.to
  }

  return /^(https?:)?\/\//.test(props.to)
    ? props.to
    : localePath(props.to)
})
</script>

<template>
  <NuxtLink
    v-bind="$attrs"
    :to="computedTo"
  >
    <slot />
  </NuxtLink>
</template>