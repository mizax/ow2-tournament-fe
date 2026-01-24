<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { cn } from "@/lib/utils"

type ErrorMessage =
  | string
  | { message?: string; params?: Record<string, unknown> }
  | undefined

const props = defineProps<{
  class?: HTMLAttributes["class"]
  errors?: ErrorMessage[]
}>()

const { t } = useI18n()

const resolveMessage = (error: ErrorMessage) => {
  if (!error)
    return null

  if (typeof error === "string") {
    return t(error)
  }

  if (!error.message) {
    return null
  }

  return t(error.message, error.params!)
}

const content = computed(() => {
  if (!props.errors || props.errors.length === 0)
    return null

  const resolvedErrors = props.errors
    .map(resolveMessage)
    .filter((message): message is string => Boolean(message))

  const uniqueErrors = [...new Set(resolvedErrors)]

  if (uniqueErrors.length === 1) {
    return uniqueErrors[0]
  }

  return uniqueErrors
})
</script>

<template>
  <div
    v-if="$slots.default || content"
    role="alert"
    data-slot="field-error"
    :class="cn('text-destructive text-sm font-normal', props.class)"
  >
    <slot v-if="$slots.default" />

    <template v-else-if="typeof content === 'string'">
      {{ content }}
    </template>

    <ul v-else-if="Array.isArray(content)" class="ml-4 flex list-disc flex-col gap-1">
      <li v-for="(error, index) in content" :key="index">
        {{ error }}
      </li>
    </ul>
  </div>
</template>
