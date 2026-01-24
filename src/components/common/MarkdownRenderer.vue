<script setup lang="ts">
import { type CustomAttrs, VueMarkdown } from '@crazydos/vue-markdown'
import remarkToc from 'remark-toc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

defineProps<{
  markdown: string
}>()

const customAttrs: CustomAttrs = {
  a: (node) => {
    if (
      typeof node.properties.href === 'string' &&
      !node.properties.href.startsWith(window.location.protocol + '//' + window.location.host) &&
      !node.properties.href.startsWith('#')
    ) {
      return { target: '_blank', rel: 'noopener noreferrer' }
    } else {
      return {}
    }
  },
}
</script>

<template>
  <article class="prose max-w-[60vw] prose-neutral dark:prose-invert mx-auto">
    <VueMarkdown
      :markdown="markdown"
      :customAttrs="customAttrs"
      :rehypePlugins="[rehypeSlug]"
      :remarkPlugins="[
        remarkGfm,
        [remarkToc, { maxDepth: 3, prefix: 'user-content-', heading: 'ОГЛАВЛЕНИЕ', tight: true }],
      ]"
      :sanitize="true"
    >
    </VueMarkdown>
  </article>
</template>

<style scoped></style>
