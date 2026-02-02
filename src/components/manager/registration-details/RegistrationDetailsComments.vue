<script setup lang="ts">
import type { RegistrationDetailResponse } from '@/types/registrationManager'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  comments: RegistrationDetailResponse['comments']
  formatDate: (value?: string) => string
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-3">
    <h3 class="text-base font-semibold tracking-tight">
      {{ t('manager.details.comments.title') }}
    </h3>
    <div v-if="comments.length" class="space-y-2">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="rounded-md bg-muted/5 ring-1 ring-white/5 p-3 text-sm space-y-1"
      >
        <p class="text-sm leading-6">{{ comment.comment }}</p>
        <p class="text-xs uppercase tracking-wide text-muted-foreground">
          {{ formatDate(comment.created_at) }}
        </p>
      </div>
    </div>
    <p v-else class="text-sm text-muted-foreground">
      {{ t('manager.details.comments.empty') }}
    </p>
    <Textarea
      :model-value="modelValue"
      :placeholder="t('manager.details.comments.placeholder')"
      @update:modelValue="(value) => emit('update:modelValue', value)"
    />
    <Button class="w-full" variant="secondary" @click="emit('submit')">
      {{ t('manager.details.comments.submit') }}
    </Button>
  </div>
</template>
