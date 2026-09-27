<template>
  <div v-if="links.telegram || links.telegramPhone" class="r-telegram-links">
    <a
      v-if="links.telegram"
      :href="links.telegram"
      target="_blank"
      rel="noopener noreferrer"
      class="r-telegram-links__item"
      :title="tBy({ en: 'Message on Telegram', km: 'ផ្ញើសារតាម Telegram' })"
    >
      <i class="ri-telegram-fill" />
      <span>@{{ sanitizedUsername }}</span>
    </a>

    <a
      v-if="links.telegramPhone"
      :href="links.telegramPhone"
      target="_blank"
      rel="noopener noreferrer"
      class="r-telegram-links__item"
      :title="tBy({ en: 'Message via phone number', km: 'ផ្ញើសារតាមលេខទូរស័ព្ទ' })"
    >
      <i class="ri-phone-fill" />
      <span>{{ tBy({ en: 'Telegram (phone)', km: 'តេឡេក្រាម (ទូរស័ព្ទ)' }) }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildTelegramLinks } from '~/utils/telegram'

const props = defineProps<{
  username?: string | null
  phone?: string | null
}>()

const links = computed(() =>
  buildTelegramLinks({ username: props.username, phone: props.phone }),
)

const sanitizedUsername = computed(() => (props.username || '').trim().replace(/^@/, ''))
</script>

<style lang="scss" scoped>
.r-telegram-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    border: 1px solid var(--c-border);
    background: var(--c-surface);
    color: var(--c-text);
    font-size: 0.8rem;
    text-decoration: none;
    transition: background 0.15s ease, border-color 0.15s ease;

    &:hover {
      border-color: #24a1de;
      background: rgba(36, 161, 222, 0.1);
      color: #24a1de;
    }

    i {
      color: #24a1de;
      font-size: 1rem;
    }
  }
}
</style>
