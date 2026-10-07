<!-- components/AppToastContainer.vue -->
<template>
  <!-- <div class="fixed top-5 right-5 z-50 space-y-3">
    <AppToast
      v-for="toast in toasts"
      :key="toast.id"
      v-bind="toast"
      @close="removeToast"
    />
  </div> -->
  <div class="fixed top-5 right-5 z-50 space-y-3">
    <AppToast
      v-for="toast in toasts"
      :key="toast.id"
      :title="toast.title"
      :message="toast.message"
      :description="toast.description"
      :type="toast.type"
      :color="toast.color"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToast()
</script>