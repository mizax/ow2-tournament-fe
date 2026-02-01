<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AnyFieldApi } from '@tanstack/vue-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { TagsInput } from '@/components/ui/tags-input'
import { TagsInputItem } from '@/components/ui/tags-input'
import { TagsInputItemDelete } from '@/components/ui/tags-input'
import { TagsInputItemText } from '@/components/ui/tags-input'
import { TagsInputInput } from '@/components/ui/tags-input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-vue-next'
import type { RegistrationArrayFieldName, RegistrationFormApi } from './types'

interface Props {
  form: RegistrationFormApi
  name: RegistrationArrayFieldName
  labelKey: string
  placeholderKey: string
  tooltipKey: string
  tooltipLabelKey: string
  isInvalid: (field: AnyFieldApi) => boolean
  validateTags?: (value: string[]) => string | string[] | undefined
}

const props = defineProps<Props>()
const { t } = useI18n()
const inputId = computed(() => `tags-input-${props.name}`)
const normalizeTags = (value: unknown) => (Array.isArray(value) ? (value as string[]) : [])
const tagValidators = computed(() => {
  if (!props.validateTags) {
    return undefined
  }

  return {
    onChange: ({ value }: { value: unknown }) => props.validateTags?.(normalizeTags(value)),
    onBlur: ({ value }: { value: unknown }) => props.validateTags?.(normalizeTags(value)),
  }
})
</script>

<template>
  <form.Field :name="name" :validators="tagValidators" #default="{ field }">
    <Field :data-invalid="props.isInvalid(field)">
      <FieldLabel :for="inputId" class="flex items-center gap-2">
        {{ t(props.labelKey) }}
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              :aria-label="t(props.tooltipLabelKey)"
              class="h-6 w-6"
            >
              <Info class="size-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {{ t(props.tooltipKey) }}
          </TooltipContent>
        </Tooltip>
      </FieldLabel>
      <TagsInput
        :model-value="normalizeTags(field.state.value)"
        @update:model-value="(value) => field.handleChange(value as string[])"
        :aria-invalid="props.isInvalid(field)"
        class="px-1 gap-2 w-full bg-input/30 text-base min-h-9 h-auto"
        add-on-blur
        add-on-tab
        @blur="field.handleBlur"
        :convert-value="(value) => value.trim()"
      >
        <TagsInputItem v-for="tag in normalizeTags(field.state.value)" :key="tag" :value="tag">
          <TagsInputItemText />
          <TagsInputItemDelete />
        </TagsInputItem>
        <TagsInputInput
          :id="inputId"
          :placeholder="t(props.placeholderKey)"
          :aria-invalid="props.isInvalid(field)"
          class="placeholder:text-muted-foreground placeholder:text-sm self-center"
          @blur="field.handleBlur"
        />
      </TagsInput>
      <FieldError v-if="props.isInvalid(field)" :errors="field.state.meta.errors" />
    </Field>
  </form.Field>
</template>
