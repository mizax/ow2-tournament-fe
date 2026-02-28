<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useI18n } from 'vue-i18n'
import { DATE_FORMAT } from '@/util/date.ts'
import { format } from 'date-fns'

const { t } = useI18n()

interface ScheduleItem {
  day: number
  date: string
  stage: string
  start_time: string
}

interface Props {
  schedule: ScheduleItem[]
}

defineProps<Props>()
</script>

<template>
  <section class="space-y-4 text-sm leading-6">
    <h2 class="text-lg font-semibold tracking-tight">{{ t('tournament.tabs.schedule') }}</h2>
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[80px]">{{ t('tournament.schedule.day') }}</TableHead>
            <TableHead>{{ t('tournament.schedule.stage') }}</TableHead>
            <TableHead>{{ t('tournament.schedule.date') }}</TableHead>
            <TableHead class="text-right">{{ t('tournament.schedule.start') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in schedule" :key="`${item.day}-${item.stage}`">
            <TableCell class="font-medium">{{ item.day }}</TableCell>
            <TableCell>{{ item.stage }}</TableCell>
            <TableCell>{{ format(item.date, DATE_FORMAT) }}</TableCell>
            <TableCell class="text-right">{{ item.start_time }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </section>
</template>
