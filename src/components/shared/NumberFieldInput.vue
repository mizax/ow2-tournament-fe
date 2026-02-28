<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput as UiNumberFieldInput,
} from '@/components/ui/number-field'

const props = withDefaults(
  defineProps<{
    modelValue?: number
    min?: number
    max?: number
    step?: number
    placeholder?: string
  }>(),
  {
    step: 1,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void
}>()

const onUpdate = (value: number | undefined) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <NumberField
    :model-value="props.modelValue"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    @update:model-value="onUpdate"
  >
    <NumberFieldContent>
      <NumberFieldDecrement aria-label="Уменьшить" />
      <UiNumberFieldInput class="dark:bg-input/30" :placeholder="props.placeholder" />
      <NumberFieldIncrement aria-label="Увеличить" />
    </NumberFieldContent>
  </NumberField>
</template>
