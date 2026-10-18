<template>
  <button
    type="button"
    class="flex h-10 w-full items-center justify-center gap-3 rounded border border-[#dadce0] bg-white px-3 text-sm font-medium text-[#3c4043] transition hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-60"
    :disabled="disabled || loading"
    @click="emit('click')"
  >
    <UIcon
      v-if="loading"
      name="i-lucide-loader-circle"
      class="size-[18px] animate-spin"
    />
    <GoogleLogo class="size-[18px] shrink-0" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    label: "Sign in with Google",
    loading: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  click: []
}>()
</script>
