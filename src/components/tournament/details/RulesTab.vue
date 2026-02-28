<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'

const { t } = useI18n()

interface Props {
  rules: {
    full_rules_url?: string
    version?: string
    last_update?: string
  }
  regulation?: string
}

defineProps<Props>()
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold tracking-tight">{{ t('tournament.tabs.rules') }}</h2>
      <div class="space-x-4 text-sm text-muted-foreground">
        <span v-if="rules.version">{{ t('tournament.rules.version') }}: {{ rules.version }}</span>
        <span v-if="rules.last_update"
          >{{ t('tournament.rules.last_update') }}: {{ rules.last_update }}</span
        >
      </div>
    </div>
    <div class="space-y-6 text-sm leading-7 text-muted-foreground">
      <div v-if="rules.full_rules_url" class="mb-4">
        <a
          :href="rules.full_rules_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline font-medium"
        >
          {{ t('tournament.rules.full_rules') }}
        </a>
      </div>

      <div v-if="regulation" class="prose max-md:prose-sm dark:prose-invert max-w-none">
        <MarkdownRenderer :markdown="regulation" />
      </div>
    </div>
  </section>
</template>
