<script setup lang="ts">
import { format } from 'date-fns'
import type { Tournament } from '@/types/tournament.ts'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { DATE_FORMAT } from '@/util/date.ts'

const { t } = useI18n()

const props = defineProps<{
  tournament: Tournament
}>()

const startDate = props.tournament.dates[0]!
const endDate = props.tournament.dates[props.tournament.dates.length - 1]!
</script>

<template>
  <Card class="overflow-hidden hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle class="text-2xl">{{ tournament.title }}</CardTitle>
      <div class="flex gap-2">
        <Badge variant="outline" class="text-md">{{ tournament.discipline }}</Badge>
        <Badge variant="outline" class="text-md">{{ tournament.format }}</Badge>
      </div>
    </CardHeader>
    <CardContent class="flex flex-col justify-between gap-4">
      <div class="flex flex-wrap gap-2">
        <Badge variant="default" class="bg-[#ee8934] text-lg rounded-md">
          {{ format(startDate, DATE_FORMAT) }} - {{ format(endDate, DATE_FORMAT) }}
        </Badge>
      </div>
      <p v-if="tournament.prize_pool" class="text-md font-bold">
        {{ t('tournament.hero.prize_pool') }}: {{ tournament.prize_pool }}
      </p>
    </CardContent>
    <CardFooter class="flex justify-end">
      <Button
        class="cursor-pointer underline hover:text-muted-foreground px-0"
        :as="RouterLink"
        variant="link"
        :to="`/tournament/${tournament.uri}`"
      >
        {{ t('tournament_card.details') }}
      </Button>
    </CardFooter>
  </Card>
</template>
