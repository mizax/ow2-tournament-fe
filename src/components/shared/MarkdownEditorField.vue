<script setup lang="ts">
import { computed, ref } from 'vue'
import { VueMarkdown } from '@crazydos/vue-markdown'
import remarkGfm from 'remark-gfm'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  class?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const mode = ref<'edit' | 'preview'>('edit')
const value = computed(() => props.modelValue ?? '')

const onInput = (nextValue: string) => {
  emit('update:modelValue', nextValue)
}
</script>

<template>
  <div>
    <div class="mb-1 flex justify-end gap-1">
      <Button
        type="button"
        size="sm"
        :variant="mode === 'edit' ? 'default' : 'ghost'"
        @click="mode = 'edit'"
      >
        Редактировать
      </Button>
      <Button
        type="button"
        size="sm"
        :variant="mode === 'preview' ? 'default' : 'ghost'"
        @click="mode = 'preview'"
      >
        Предпросмотр
      </Button>
    </div>

    <Textarea
      v-if="mode === 'edit'"
      :model-value="value"
      :placeholder="props.placeholder"
      :class="props.class"
      @update:model-value="(next) => onInput(String(next))"
    />

    <div
      v-else
      :class="[
        'prose prose-sm dark:prose-invert max-w-none rounded-md border px-3 py-2 min-h-16',
        props.class,
      ]"
    >
      <VueMarkdown :markdown="value" :remarkPlugins="[remarkGfm]" :sanitize="true" />
      <p v-if="!value" class="text-muted-foreground text-sm italic">Нет содержимого</p>
    </div>
  </div>
</template>
