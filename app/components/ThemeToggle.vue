<template>
  <div class="relative theme-toggle-btn">
    <button :aria-label="theme.isDark ? 'Switch to light' : 'Switch to dark'" @click="theme.toggle()">
      <i :class="theme.isDark ? 'ri-sun-line' : 'ri-moon-line'" class="icon"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
const theme = useThemeStore()
</script>

<style lang="scss" scoped>

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px !important;
  height: 32px !important;
  border-radius: var(--radius-full) !important;
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  cursor: pointer;
  transition:
    color var(--transition-base),
    border-color var(--transition-base),
    background-color var(--transition-base);

  &:hover {
    color: var(--c-primary);
    border: 1px solid var(--c-primary);
    background-color: var(--c-primary-light); // if this variable exists
  }

  .icon {
    font-size: 18px;
  }

  @media (max-width: 768px) {
    width: 30px !important;
    height: 30px !important;

    .icon {
      font-size: 15px;
    }
  }
}

</style>
