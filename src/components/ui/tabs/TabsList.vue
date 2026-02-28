<script setup lang="ts">
import type { TabsListProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { TabsList } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    v-bind="delegatedProps"
    :class="
      cn(
        'text-muted-foreground inline-flex min-h-10 w-fit items-end justify-center gap-1 border-b border-border/70 rounded-none bg-transparent p-0',
        props.class,
      )
    "
  >
    <slot />
  </TabsList>
</template>
