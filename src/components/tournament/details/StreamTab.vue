<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchWithoutAuth } from '@/services/apiService'
import { useI18n } from 'vue-i18n'
import { Tv } from 'lucide-vue-next'

const { t } = useI18n()

interface LiveStreamSummary {
  user_login: string
  user_name: string
  title: string
  viewer_count: number
  started_at: string
  game_name: string
  thumbnail_url: string
}

interface Props {
  tournamentSef: string
  stream?: {
    platform?: string
    channel?: string
  }
}

const props = defineProps<Props>()
const isLoadingLiveStreams = ref(false)
const liveStreamsError = ref<string | null>(null)
const liveStreams = ref<LiveStreamSummary[]>([])

const hasOfficialChannel = computed(() => Boolean(props.stream?.channel))

const formatViewerCount = (value: number) => new Intl.NumberFormat('ru-RU').format(value)

const liveThumbnailUrl = (url: string) =>
  url.replace('{width}', '640').replace('{height}', '360')

const loadLiveStreams = async () => {
  if (!props.tournamentSef) {
    liveStreams.value = []
    return
  }

  isLoadingLiveStreams.value = true
  liveStreamsError.value = null

  const response = await fetchWithoutAuth<LiveStreamSummary[]>(
    `/api/public/v1/tournaments/${props.tournamentSef}/live-streams`,
  )

  if (!response.success) {
    console.error('Error fetching live streams:', response.errorCode)
    liveStreamsError.value = t('tournament.stream.live_load_error')
    liveStreams.value = []
  } else {
    liveStreams.value = response.data ?? []
  }

  isLoadingLiveStreams.value = false
}

onMounted(loadLiveStreams)
watch(() => props.tournamentSef, loadLiveStreams)
</script>

<template>
  <Card class="bg-transparent shadow-none ring-0">
    <CardHeader>
      <CardTitle class="text-lg font-semibold tracking-tight">{{ t('tournament.tabs.stream') }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-8 text-sm leading-6">
      <div v-if="hasOfficialChannel" class="flex flex-col items-center justify-center py-6">
        <Tv class="w-16 h-16 mb-4 text-primary" />
        <h3 class="text-xl font-semibold mb-4">{{ stream?.channel }}</h3>
        <Button as="a" :href="`https://twitch.tv/${stream?.channel}`" target="_blank" size="lg">
          {{ t('tournament.stream.watch_on_twitch') }}
        </Button>
      </div>

      <div class="space-y-4">
        <h3 class="text-base font-semibold tracking-tight">{{ t('tournament.stream.live_participants') }}</h3>

        <div v-if="isLoadingLiveStreams" class="flex items-center justify-center py-8 text-muted-foreground">
          {{ t('tournament.stream.live_loading') }}
        </div>

        <div v-else-if="liveStreamsError" class="py-8 text-center text-destructive">
          {{ liveStreamsError }}
        </div>

        <div v-else-if="!liveStreams.length" class="py-8 text-center text-muted-foreground">
          {{ t('tournament.stream.live_empty') }}
        </div>

        <ul v-else class="grid gap-4 md:grid-cols-2">
          <li
            v-for="streamItem in liveStreams"
            :key="streamItem.user_login"
            class="overflow-hidden rounded-xl border border-white/10 bg-muted/20"
          >
            <a :href="`https://twitch.tv/${streamItem.user_login}`" target="_blank" class="block">
              <img
                :src="liveThumbnailUrl(streamItem.thumbnail_url)"
                :alt="streamItem.user_name"
                class="h-40 w-full object-cover"
              />
            </a>
            <div class="space-y-2 px-4 py-3">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-semibold leading-tight">{{ streamItem.user_name }}</p>
                  <p class="text-xs text-muted-foreground">@{{ streamItem.user_login }}</p>
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ t('tournament.stream.live_viewers', { count: formatViewerCount(streamItem.viewer_count) }) }}
                </p>
              </div>
              <p class="line-clamp-2 text-sm">{{ streamItem.title }}</p>
              <p v-if="streamItem.game_name" class="text-xs text-muted-foreground">
                {{ streamItem.game_name }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
</template>
