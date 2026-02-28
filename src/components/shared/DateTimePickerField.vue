<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import DatePickerField from '@/components/shared/DatePickerField.vue'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()

const splitDateTime = (iso: string | undefined) => ({
  date: iso?.slice(0, 10),
  time: iso?.slice(11, 16) ?? '00:00',
})

const parsed = computed(() => splitDateTime(props.modelValue))

const joinDateTime = (date: string, time: string): string => `${date}T${time}:00Z`

const onDateChange = (date: string | undefined) => {
  if (!date) {
    emit('update:modelValue', undefined)
    return
  }
  emit('update:modelValue', joinDateTime(date, parsed.value.time || '00:00'))
}

const onTimeChange = (time: string) => {
  const date = parsed.value.date
  if (!date) {
    return
  }
  emit('update:modelValue', joinDateTime(date, time || '00:00'))
}
</script>

<template>
  <div class="grid gap-2 md:grid-cols-[1fr_140px]">
    <DatePickerField :model-value="parsed.date" @update:model-value="onDateChange" />
    <Input type="time" :model-value="parsed.time" @update:model-value="(value) => onTimeChange(String(value))" />
  </div>
</template>
