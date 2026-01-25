<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Copyable } from '@/components/ui/copyable'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { DATE_FORMAT_EXTENDED } from '@/util/date.ts'

const { t } = useI18n()

interface Eligibility {
  min_rank?: string
  min_competitive_hours?: number
  min_calibrated_seasons?: number
  wins_current_season_main_role?: number
  subscription?: {
    twitch_channel?: string
    donation_amount_rub?: number
    donation_url?: string
  }
  verification_battletag?: string
}

interface Registration {
  start?: string
  deadline?: string
  checkin?: {
    from?: string
    to?: string
    platform?: string
    platform_url?: string
  }
}

interface Props {
  eligibility?: Eligibility
  registration?: Registration
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-6">
    <Card v-if="eligibility">
      <CardHeader>
        <CardTitle class="text-xl">{{ t('tournament.participation.eligibility') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow v-if="eligibility.min_rank">
              <TableCell class="font-medium">{{
                t('tournament.participation.min_rank')
              }}</TableCell>
              <TableCell>{{ eligibility.min_rank }}</TableCell>
            </TableRow>
            <TableRow v-if="eligibility.min_competitive_hours">
              <TableCell class="font-medium">{{
                t('tournament.participation.min_hours')
              }}</TableCell>
              <TableCell>{{ eligibility.min_competitive_hours }}</TableCell>
            </TableRow>
            <TableRow v-if="eligibility.min_calibrated_seasons">
              <TableCell class="font-medium">{{
                t('tournament.participation.min_seasons')
              }}</TableCell>
              <TableCell>{{ eligibility.min_calibrated_seasons }}</TableCell>
            </TableRow>
            <TableRow v-if="eligibility.wins_current_season_main_role">
              <TableCell class="font-medium">{{
                t('tournament.participation.wins_current_season')
              }}</TableCell>
              <TableCell>{{ eligibility.wins_current_season_main_role }}</TableCell>
            </TableRow>
            <TableRow v-if="eligibility.verification_battletag">
              <TableCell class="font-medium">{{
                t('tournament.participation.verification_btag')
              }}</TableCell>
              <TableCell>
                <Copyable
                  :value="eligibility.verification_battletag"
                  :as="Badge"
                  variant="secondary"
                  class="gap-1.5 px-2 py-0.5"
                >
                  {{ eligibility.verification_battletag }}
                </Copyable>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div v-if="eligibility.subscription" class="mt-4 space-y-2">
          <h4 class="font-semibold">{{ t('tournament.participation.subscription') }}</h4>
          <p v-if="eligibility.subscription.twitch_channel">
            {{ t('tournament.participation.twitch_channel') }}:
            <a
              :href="`https://twitch.tv/${eligibility.subscription.twitch_channel}`"
              class="text-muted-foreground hover:underline"
              target="_blank"
              >{{ eligibility.subscription.twitch_channel }}
            </a>
          </p>
          <p v-if="eligibility.subscription.donation_amount_rub">
            {{ t('tournament.participation.donation') }}:
            {{ eligibility.subscription.donation_amount_rub }} RUB
            <a
              v-if="eligibility.subscription.donation_url"
              class="underline"
              :href="eligibility.subscription.donation_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t('tournament.participation.donation_url') }}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>

    <Card v-if="registration">
      <CardHeader>
        <CardTitle class="text-xl">{{ t('tournament.participation.registration') }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="registration.start">
          <p class="font-semibold">{{ t('tournament.participation.start') }}</p>
          <p>{{ format(registration.start, DATE_FORMAT_EXTENDED) }}</p>
        </div>
        <div v-if="registration.deadline">
          <p class="font-semibold">{{ t('tournament.participation.deadline') }}</p>
          <p>{{ format(registration.deadline, DATE_FORMAT_EXTENDED) }}</p>
        </div>
        <Alert v-if="registration.checkin">
          <AlertTitle>{{ t('tournament.participation.checkin') }}</AlertTitle>
          <AlertDescription>
            <p>{{ registration.checkin.from }} — {{ registration.checkin.to }}</p>
            <p v-if="registration.checkin.platform">
              {{ t('tournament.participation.check-in-platform') }}:
              <a
                v-if="registration.checkin.platform_url"
                :href="registration.checkin.platform_url"
                class="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ registration.checkin.platform }}
              </a>
              <span v-else>{{ registration.checkin.platform }}</span>
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  </div>
</template>
