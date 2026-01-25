<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AnyFieldApi } from '@tanstack/vue-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  type RoleOption,
  type RegistrationRoleFieldName,
  type RegistrationFormApi,
  RoleValue,
} from './types'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  form: RegistrationFormApi
  name: RegistrationRoleFieldName
  labelKey: string
  placeholderKey: string
  options: RoleOption[]
  required?: boolean
  disabledValues?: RoleValue[]
  isInvalid: (field: AnyFieldApi) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabledValues: () => [],
})
const { t } = useI18n()
const selectId = computed(() => `role-select-${props.name}`)
</script>

<template>
  <form.Field :name="name" #default="{ field }">
    <Field :data-invalid="isInvalid(field)">
      <FieldLabel :for="selectId" :class="{ 'form-field-required': required }">
        {{ t(labelKey) }}
      </FieldLabel>
      <Select
        :name="field.name"
        :model-value="field.state.value"
        @update:model-value="field.handleChange($event as RoleValue)"
        @blur="field.handleBlur"
      >
        <SelectTrigger :id="selectId" class="cursor-pointer" :aria-invalid="isInvalid(field)">
          <SelectValue :placeholder="t(placeholderKey)"></SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="disabledValues.includes(option.value)"
          >
            {{ t(option.labelKey) }}
          </SelectItem>
        </SelectContent>
      </Select>
      <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
    </Field>
  </form.Field>
</template>
