<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import { type CustomAttrs, VueMarkdown } from '@crazydos/vue-markdown'
import { computed } from 'vue'
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
  summary?: string
  placements?: Array<{ place: number; team_name: string; captain_battletag?: string }>
  mvp?: string
  vodUrl?: string
  bracketUrl?: string
}

const props = defineProps<Props>()

const hasResults = computed(
  () =>
    Boolean(props.summary) ||
    Boolean(props.placements && props.placements.length) ||
    Boolean(props.mvp) ||
    Boolean(props.vodUrl) ||
    Boolean(props.bracketUrl),
)

const isALink = (text: string) =>
  text.startsWith('http://') ||
  text.startsWith('https://') ||
  text.startsWith('#') ||
  text.startsWith('mailto:')
</script>

<template>
  <section class="space-y-6">
    <h2 class="text-lg font-semibold tracking-tight">{{ t('tournament.tabs.overview') }}</h2>
    <div class="space-y-6">
      <div
        v-if="description"
        class="prose prose-sm md:prose-base leading-7 text-muted-foreground dark:prose-invert max-w-none"
      >
        <VueMarkdown :markdown="description" :customAttrs="customAttrs" />
      </div>

      <template v-if="hasResults">
        <Separator />

        <div>
          <h2 class="text-lg font-semibold tracking-tight mb-3">
            {{ t('tournament.overview.results') }}
          </h2>
          <div class="space-y-3 text-sm">
            <p v-if="summary" class="text-muted-foreground">{{ summary }}</p>
            <ul v-if="placements && placements.length" class="space-y-1">
              <li
                v-for="item in placements"
                :key="`${item.place}-${item.team_name}`"
                class="text-foreground"
              >
                #{{ item.place }} — {{ item.team_name }}
                <span v-if="item.captain_battletag" class="text-muted-foreground"
                  >({{ item.captain_battletag }})</span
                >
              </li>
            </ul>
            <p v-if="mvp" class="text-foreground">
              {{ t('tournament.overview.mvp') }}: <span class="font-medium">{{ mvp }}</span>
            </p>
            <p v-if="vodUrl" class="text-muted-foreground">
              {{ t('tournament.overview.vod') }}:
              <a :href="vodUrl" target="_blank" rel="noopener noreferrer" class="hover:underline">{{
                vodUrl
              }}</a>
            </p>
            <p v-if="bracketUrl" class="text-muted-foreground">
              {{ t('tournament.overview.bracket') }}:
              <a
                :href="bracketUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:underline"
                >{{ bracketUrl }}</a
              >
            </p>
          </div>
        </div>
      </template>

      <Separator />

      <div>
        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          {{ t('tournament.overview.organizers') }}
        </h3>
        <ul class="space-y-2 text-sm">
          <li v-for="org in organizers" :key="org.name" class="flex flex-col">
            <span class="font-medium text-foreground">{{ org.role }}: {{ org.name }}</span>
            <span v-if="org.contact" class="text-xs text-muted-foreground">
              <span v-if="isALink(org.contact)"
                ><a
                  :href="org.contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-muted-foreground hover:underline"
                  >{{ org.contact }}</a
                ></span
              >
              <span v-else>{{ org.contact }}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
