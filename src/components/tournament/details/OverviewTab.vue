<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type CustomAttrs, VueMarkdown } from '@crazydos/vue-markdown'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const customAttrs: CustomAttrs = {
  a: (node) => {
    if (
      typeof node.properties?.href === 'string' &&
      !node.properties.href.startsWith(window.location.protocol + '//' + window.location.host) &&
      !node.properties.href.startsWith('#')
    ) {
      return { target: '_blank', rel: 'noopener noreferrer' }
    } else {
      return {}
    }
  },
}

interface Organizer {
  role: string
  name: string
  contact?: string
}

interface Props {
  organizers: Organizer[]
  description: string
}

defineProps<Props>()

const isALink = (text: string) =>
  text.startsWith('http://') ||
  text.startsWith('https://') ||
  text.startsWith('#') ||
  text.startsWith('mailto:')
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t('tournament.tabs.overview') }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <div v-if="description" class="prose dark:prose-invert max-w-none">
        <VueMarkdown :markdown="description" :customAttrs="customAttrs" />
      </div>

      <Separator />

      <div>
        <h3 class="text-lg font-semibold mb-3">{{ t('tournament.overview.organizers') }}</h3>
        <ul class="space-y-2">
          <li v-for="org in organizers" :key="org.name" class="flex flex-col">
            <span class="font-medium">{{ org.role }}: {{ org.name }}</span>
            <span v-if="org.contact" class="text-sm text-muted-foreground">
              <span v-if="isALink(org.contact)"><a :href="org.contact" target="_blank" class="text-muted-foreground hover:underline">{{ org.contact }}</a></span>
              <span v-else>{{ org.contact }}</span>
            </span>
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
</template>
