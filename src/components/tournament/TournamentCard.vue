<script setup lang="ts">
import { format } from 'date-fns'
import type { Tournament } from '@/types/tournament.ts'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  tournament: Tournament
}>()
</script>

<template>
  <Card class="overflow-hidden hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle>{{ tournament.title }}</CardTitle>
    </CardHeader>
    <CardContent class="flex flex-row justify-between gap-4">
      <div class="flex flex-wrap gap-2">
        <Badge v-for="date in tournament.dates" :key="date" variant="secondary">
          {{ format(date, 'dd.MM.yyyy') }}
        </Badge>
      </div>
      <p v-if="tournament.prize_pool" class="font-bold">
        {{ t('tournament.hero.prize_pool') }}: {{ tournament.prize_pool }}
      </p>
    </CardContent>
    <CardFooter class="flex justify-end">
      <Button
        class="cursor-pointer underline hover:text-muted-foreground"
        :as="RouterLink"
        variant="link"
        :to="`/tournament/${tournament.uri}`"
      >
        {{ t('tournament_card.details') }}
      </Button>
    </CardFooter>
  </Card>
</template>
