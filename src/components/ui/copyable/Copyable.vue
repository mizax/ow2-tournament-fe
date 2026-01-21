<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { useClipboard } from '@vueuse/core'
import { Copy, Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props extends PrimitiveProps {
  value: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'span',
})

const { copy, copied } = useClipboard({
  source: () => props.value,
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn('inline-flex items-center gap-1.5 cursor-pointer', props.class)"
    @click.stop="copy()"
  >
    <slot />
    <slot name="icon" :copied="copied">
      <Check v-if="copied" class="h-3.5 w-3.5 text-green-500" />
      <Copy v-else class="h-3.5 w-3.5" />
    </slot>
  </Primitive>
</template>
