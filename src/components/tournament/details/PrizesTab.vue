<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface PrizePlace {
  place: number
  amount: number
}

interface Props {
  prizePool: {
    currency: string
    places: PrizePlace[]
  }
}

defineProps<Props>()
</script>

<template>
  <Card class="bg-transparent shadow-none ring-0">
    <CardHeader>
      <CardTitle class="text-lg font-semibold tracking-tight">{{ t('tournament.tabs.prizes') }}</CardTitle>
    </CardHeader>
    <CardContent class="text-sm leading-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{{ t('tournament.prizes.place') }}</TableHead>
            <TableHead class="text-right">{{ t('tournament.prizes.prize') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in prizePool.places" :key="item.place">
            <TableCell class="font-medium">{{ item.place }}</TableCell>
            <TableCell class="text-right">{{ item.amount }} {{ prizePool.currency }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
