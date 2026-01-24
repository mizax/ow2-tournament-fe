<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import { Tv } from 'lucide-vue-next'

const { t } = useI18n()

interface Props {
  stream?: {
    platform?: string
    channel?: string
  }
}

defineProps<Props>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xl">{{ t('tournament.tabs.stream') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="stream?.channel" class="flex flex-col items-center justify-center py-12">
        <Tv class="w-16 h-16 mb-4 text-primary" />
        <h3 class="text-xl font-semibold mb-4">{{ stream.channel }}</h3>
        <Button as="a" :href="`https://twitch.tv/${stream.channel}`" target="_blank" size="lg">
          {{ t('tournament.stream.watch_on_twitch') }}
        </Button>
      </div>
      <div v-else class="text-center py-12 text-muted-foreground">
        <!-- Optional: handle case with no stream -->
      </div>
    </CardContent>
  </Card>
</template>
