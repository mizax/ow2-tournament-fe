<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ChevronRight } from 'lucide-vue-next'
import { formatNumber, formatTime, kd, kad } from '@/lib/statsFormatting'
import type { ProcessedTeam } from '@/types/stats'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const props = defineProps<{
  team: ProcessedTeam
  mapOrder: number
  roundIdx: number
  tournamentSef: string
  homeTeam: string
  awayTeam: string
  expandedPlayers: Set<string>
}>()

const emit = defineEmits<{ 'toggle-player': [key: string] }>()

const { t } = useI18n()

function playerKey(playerId: number): string {
  return `${props.mapOrder}-${props.roundIdx}-${playerId}`
}
</script>

<template>
  <div>
    <div
      :class="[
        'mb-2 text-sm font-semibold pl-2 border-l-2',
        team.teamName === homeTeam
          ? 'border-sky-500/60 text-sky-300/80'
          : team.teamName === awayTeam
            ? 'border-red-500/60 text-red-300/80'
            : 'border-white/20 text-muted-foreground',
      ]"
    >
      {{ team.teamName }}
    </div>

    <div class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow class="border-white/10 hover:bg-transparent">
            <TableHead class="w-8 p-0"></TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium">{{ t('stats.player') }}</TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium">{{ t('stats.hero') }}</TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">
              <Tooltip>
                <TooltipTrigger class="cursor-default">{{ t('stats.elims') }}</TooltipTrigger>
                <TooltipContent>{{ t('stats.elims-tooltip') }}</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">
              <Tooltip>
                <TooltipTrigger class="cursor-default">{{ t('stats.fb') }}</TooltipTrigger>
                <TooltipContent>{{ t('stats.fb-tooltip') }}</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">
              <Tooltip>
                <TooltipTrigger class="cursor-default">{{ t('stats.deaths') }}</TooltipTrigger>
                <TooltipContent>{{ t('stats.deaths-tooltip') }}</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">
              <Tooltip>
                <TooltipTrigger class="cursor-default">{{ t('stats.assists') }}</TooltipTrigger>
                <TooltipContent>{{ t('stats.assists-tooltip') }}</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">
              <Tooltip>
                <TooltipTrigger class="cursor-default">{{ t('stats.kd') }}</TooltipTrigger>
                <TooltipContent>{{ t('stats.kd-tooltip') }}</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">
              <Tooltip>
                <TooltipTrigger class="cursor-default">{{ t('stats.kad') }}</TooltipTrigger>
                <TooltipContent>{{ t('stats.kad-tooltip') }}</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right min-w-[130px]">{{ t('stats.hero-damage') }}</TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.healing') }}</TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">
              <Tooltip>
                <TooltipTrigger class="cursor-default">{{ t('stats.blocked') }}</TooltipTrigger>
                <TooltipContent>Damage Blocked</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">
              <Tooltip>
                <TooltipTrigger class="cursor-default">{{ t('stats.ults') }}</TooltipTrigger>
                <TooltipContent>Ultimates Used / Earned</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.time') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="group in team.groups" :key="group.player_id">
            <!-- Summary row (aggregated across heroes) -->
            <TableRow
              :class="[
                'border-white/5 transition-colors',
                group.rows.length > 1 ? 'cursor-pointer hover:bg-white/5' : '',
              ]"
              @click="group.rows.length > 1 && emit('toggle-player', playerKey(group.player_id))"
            >
              <TableCell class="w-8 pr-0">
                <ChevronRight
                  v-if="group.rows.length > 1"
                  class="h-4 w-4 text-muted-foreground/40 transition-transform duration-200"
                  :class="expandedPlayers.has(playerKey(group.player_id)) ? 'rotate-90' : ''"
                />
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <img
                    v-if="group.role && group.role !== 'flex'"
                    :src="`/roles/${group.role}.svg`"
                    :alt="group.role ? t(`registration.roles.${group.role}`, group.role) : ''"
                    :title="group.role ? t(`registration.roles.${group.role}`, group.role) : ''"
                    class="h-4 w-4 shrink-0 brightness-0 invert opacity-50"
                  />
                  <router-link
                    :to="`/tournament/${tournamentSef}/player/${group.player_id}`"
                    class="font-medium hover:text-primary transition-colors"
                    @click.stop
                  >
                    {{ group.nickname }}
                  </router-link>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1.5 items-center">
                  <template v-for="hero in group.heroes" :key="hero.name">
                    <img
                      v-if="hero.url"
                      :src="hero.url"
                      :alt="hero.name"
                      :title="hero.name"
                      class="h-8 w-8 rounded-full object-cover object-top ring-1 ring-white/10"
                    />
                    <span
                      v-else
                      class="rounded px-1.5 py-0.5 text-xs bg-white/5 text-muted-foreground"
                    >{{ hero.name }}</span>
                  </template>
                </div>
              </TableCell>
              <TableCell class="text-right tabular-nums">
                <Tooltip>
                  <TooltipTrigger class="cursor-default">{{ formatNumber(group.elims) }}</TooltipTrigger>
                  <TooltipContent>
                    <div class="text-xs space-y-0.5">
                      <div>Solo: {{ formatNumber(group.solo_kills) }}</div>
                      <div>Obj: {{ formatNumber(group.obj_kills) }}</div>
                      <div>Env: {{ formatNumber(group.env_kills) }}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell class="text-right tabular-nums">{{ formatNumber(group.final_blows) }}</TableCell>
              <TableCell class="text-right tabular-nums">
                <Tooltip v-if="group.env_deaths > 0">
                  <TooltipTrigger class="cursor-default">{{ formatNumber(group.deaths) }}</TooltipTrigger>
                  <TooltipContent>Env: {{ formatNumber(group.env_deaths) }}</TooltipContent>
                </Tooltip>
                <span v-else>{{ formatNumber(group.deaths) }}</span>
              </TableCell>
              <TableCell class="text-right tabular-nums">{{ formatNumber(group.assists) }}</TableCell>
              <TableCell class="text-right tabular-nums">{{ kd(group.elims, group.deaths) }}</TableCell>
              <TableCell class="text-right tabular-nums">{{ kad(group.elims, group.assists, group.deaths) }}</TableCell>
              <TableCell class="text-right tabular-nums min-w-[130px]">
                <div class="flex flex-col gap-1 items-end">
                  <span>{{ formatNumber(group.hero_damage) }}</span>
                  <Progress
                    :model-value="Math.round((group.hero_damage / team.maxDamage) * 100)"
                    class="h-1 w-20"
                  />
                </div>
              </TableCell>
              <TableCell class="text-right tabular-nums">{{ formatNumber(group.healing) }}</TableCell>
              <TableCell class="text-right tabular-nums">{{ formatNumber(group.damage_blocked) }}</TableCell>
              <TableCell class="text-right tabular-nums">
                {{ formatNumber(group.ults_used) }}/{{ formatNumber(group.ults_earned) }}
              </TableCell>
              <TableCell class="text-right tabular-nums">{{ formatTime(group.time_played) }}</TableCell>
            </TableRow>

            <!-- Per-hero detail rows (visible when expanded) -->
            <template v-if="expandedPlayers.has(playerKey(group.player_id))">
              <TableRow
                v-for="row in group.rows"
                :key="row.hero_name"
                class="border-white/5 bg-white/[0.02]"
              >
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell class="pl-4">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="row.heroUrl"
                      :src="row.heroUrl"
                      :alt="row.hero_name"
                      class="h-6 w-6 rounded-full object-cover object-top ring-1 ring-white/10 opacity-70"
                    />
                    <span class="text-xs text-muted-foreground/60">{{ row.hero_name }}</span>
                  </div>
                </TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">{{ formatNumber(row.elims) }}</TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">{{ formatNumber(row.final_blows) }}</TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">{{ formatNumber(row.deaths) }}</TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">{{ formatNumber(row.assists) }}</TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">{{ kd(row.elims, row.deaths) }}</TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">{{ kad(row.elims, row.assists, row.deaths) }}</TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60 min-w-[130px]">{{ formatNumber(row.hero_damage) }}</TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">{{ formatNumber(row.healing) }}</TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">{{ formatNumber(row.damage_blocked) }}</TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">
                  {{ formatNumber(row.ults_used) }}/{{ formatNumber(row.ults_earned) }}
                </TableCell>
                <TableCell class="text-right tabular-nums text-sm text-muted-foreground/60">{{ formatTime(row.time_played) }}</TableCell>
              </TableRow>
            </template>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
