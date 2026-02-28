<script setup lang="ts">
import { computed } from 'vue'
import { parseDate, type CalendarDate } from '@internationalized/date'
import { Calendar } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as UiCalendar } from '@/components/ui/calendar'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
  }>(),
  {
    placeholder: 'Выберите дату',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  const d = toCalendarDate(props.modelValue)
  if (!d) return props.modelValue
  return d.toDate('UTC').toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
})

const toCalendarDate = (value: string | undefined): CalendarDate | undefined => {
  return value ? parseDate(value) : undefined
}

const onDateChange = (value: CalendarDate | undefined) => {
  emit('update:modelValue', value?.toString())
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button type="button" variant="outline" class="w-full justify-between text-left font-normal">
        <span :class="props.modelValue ? 'text-foreground' : 'text-muted-foreground'">
          {{ displayValue }}
        </span>
        <Calendar class="size-4 opacity-70" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-auto p-0">
      <UiCalendar
        :model-value="toCalendarDate(props.modelValue)"
        @update:model-value="(value) => onDateChange(value as CalendarDate | undefined)"
      />
    </PopoverContent>
  </Popover>
</template>
