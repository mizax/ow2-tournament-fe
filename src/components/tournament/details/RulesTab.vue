<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  <Card>
    <CardHeader>
      <div class="flex justify-between items-center">
        <CardTitle class="text-xl">{{ t('tournament.tabs.rules') }}</CardTitle>
        <div class="text-sm text-muted-foreground space-x-4">
          <span v-if="rules.version">{{ t('tournament.rules.version') }}: {{ rules.version }}</span>
          <span v-if="rules.last_update">{{ t('tournament.rules.last_update') }}: {{ rules.last_update }}</span>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-6">
      <div v-if="rules.full_rules_url" class="mb-4">
        <a :href="rules.full_rules_url" target="_blank" class="text-primary hover:underline font-medium">
          {{ t('tournament.rules.full_rules') }}
        </a>
      </div>

      <div v-if="regulation" class="prose dark:prose-invert max-w-none">
        <MarkdownRenderer :markdown="regulation" />
      </div>
    </CardContent>
  </Card>
</template>
