<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBalancerStore } from '@/stores/balancerStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { RosterEntry } from '@/features/balancer/types'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const route = useRoute()
const store = useBalancerStore()

const tournamentId = computed(() => Number(route.params.tournamentId))

const expandedReg = ref<number | null>(null)
const saving = ref(false)

onMounted(async () => {
  store.reset()
  const r = await store.fetchRoster(tournamentId.value)
  if (!r.success) toast.error(t('manager.balancer.toasts.roster_load_error'))
  await store.fetchSavedBalances(tournamentId.value)
})

async function toggleCheckIn(entry: RosterEntry) {
  await store.patchCheckin(tournamentId.value, {
    registration_id: entry.registration_id,
    checked_in: !entry.checked_in,
  })
}

async function runBalance() {
  if (store.includedCount < 10) {
    toast.error(t('manager.balancer.toasts.min_players'))
    return
  }
  await store.runBalance()
}

async function saveSelected() {
  if (!store.selectedBalance) return
  saving.value = true
  const r = await store.saveSelected(tournamentId.value)
  saving.value = false
  if (r?.success) {
    toast.success(t('manager.balancer.toasts.saved'))
  } else {
    toast.error(t('manager.balancer.toasts.save_error'))
  }
}

function roleColor(role: string | null): string {
  switch (role?.toLowerCase()) {
    case 'tank': return 'text-blue-400'
    case 'damage': return 'text-red-400'
    case 'support': return 'text-green-400'
    case 'flex': return 'text-purple-400'
    default: return 'text-muted-foreground'
  }
}
</script>

<template>
  <div class="min-h-screen bg-background px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">{{ t('manager.balancer.title') }}</h1>
      <p class="text-sm text-muted-foreground">
        {{ t('manager.balancer.subtitle', { id: tournamentId, included: store.includedCount, total: store.totalCount, checked: store.checkedInCount }) }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <!-- Left: Roster -->
      <Card class="col-span-1 border border-border/70">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <CardTitle class="text-base">{{ t('manager.balancer.roster.title') }}</CardTitle>
            <div class="flex gap-1">
              <button
                class="text-xs text-muted-foreground hover:text-foreground"
                @click="store.setAllIncluded(true)"
              >{{ t('manager.balancer.roster.select_all') }}</button>
              <span class="text-xs text-muted-foreground">/</span>
              <button
                class="text-xs text-muted-foreground hover:text-foreground"
                @click="store.setAllIncluded(false)"
              >{{ t('manager.balancer.roster.deselect_all') }}</button>
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-0">
          <div v-if="store.rosterLoading" class="flex justify-center py-8">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>

          <div v-else-if="store.roster.length === 0" class="px-4 py-6 text-center text-sm text-muted-foreground">
            {{ t('manager.balancer.roster.empty') }}
          </div>

          <div v-else class="max-h-[70vh] overflow-y-auto divide-y divide-border/50">
            <div
              v-for="entry in store.roster"
              :key="entry.registration_id"
              class="px-4 py-2"
            >
              <div class="flex items-center gap-2">
                <Checkbox
                  :id="`include-${entry.registration_id}`"
                  :checked="store.localIncluded[entry.registration_id]"
                  @update:checked="store.toggleIncluded(entry.registration_id)"
                />
                <Label
                  :for="`include-${entry.registration_id}`"
                  class="flex-1 cursor-pointer truncate text-sm"
                >
                  {{ entry.battletag }}
                </Label>
                <span :class="['text-xs font-medium', roleColor(entry.primary_role)]">
                  {{ entry.primary_role ?? '—' }}
                </span>
                <button
                  :title="t('manager.balancer.roster.checkin_toggle')"
                  class="ml-1 flex h-4 w-4 items-center justify-center rounded-full transition-colors"
                  :class="entry.checked_in ? 'bg-green-500/80 hover:bg-green-400' : 'bg-muted hover:bg-muted-foreground/40'"
                  @click="toggleCheckIn(entry)"
                />
                <button
                  class="text-xs text-muted-foreground hover:text-foreground"
                  @click="expandedReg = expandedReg === entry.registration_id ? null : entry.registration_id"
                >
                  {{ expandedReg === entry.registration_id ? '▲' : '▼' }}
                </button>
              </div>

              <!-- Expanded: role overrides -->
              <div v-if="expandedReg === entry.registration_id" class="mt-2 space-y-1 pl-6 text-xs text-muted-foreground">
                <div class="grid grid-cols-2 gap-x-3 gap-y-1">
                  <span>{{ t('manager.balancer.roster.tank_sr') }}</span>
                  <span>{{ entry.role_rankings['tank'] ?? 0 }}</span>
                  <span>{{ t('manager.balancer.roster.damage_sr') }}</span>
                  <span>{{ entry.role_rankings['damage'] ?? 0 }}</span>
                  <span>{{ t('manager.balancer.roster.support_sr') }}</span>
                  <span>{{ entry.role_rankings['support'] ?? 0 }}</span>
                  <span>{{ t('manager.balancer.roster.full_flex') }}</span>
                  <span>{{ entry.is_full_flex ? t('manager.balancer.roster.yes') : t('manager.balancer.roster.no') }}</span>
                </div>
                <div v-if="entry.overrides" class="mt-1 rounded bg-muted/50 px-2 py-1">
                  {{ t('manager.balancer.roster.overrides_active') }}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Center: Options -->
      <Card class="col-span-1 border border-border/70">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">{{ t('manager.balancer.options.title') }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-1">
            <Label>{{ t('manager.balancer.options.sr_range') }}</Label>
            <Input
              v-model.number="store.balancerOptions.range"
              type="number"
              min="0"
              max="2000"
            />
            <p class="text-xs text-muted-foreground">
              {{ t('manager.balancer.options.sr_range_hint') }}
            </p>
          </div>

          <div class="space-y-1">
            <Label>{{ t('manager.balancer.options.tries') }}</Label>
            <Input
              v-model.number="store.balancerOptions.triesCount"
              type="number"
              min="100"
              max="10000"
            />
            <p class="text-xs text-muted-foreground">
              {{ t('manager.balancer.options.tries_hint') }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <Checkbox
              id="dispersion"
              :checked="store.balancerOptions.dispersionMinimizer"
              @update:checked="store.balancerOptions.dispersionMinimizer = $event"
            />
            <Label for="dispersion">{{ t('manager.balancer.options.dispersion') }}</Label>
          </div>

          <div class="flex items-center gap-2">
            <Checkbox
              id="lowrank"
              :checked="store.balancerOptions.lowRankLimiter"
              @update:checked="store.balancerOptions.lowRankLimiter = $event"
            />
            <Label for="lowrank">{{ t('manager.balancer.options.low_rank') }}</Label>
          </div>

          <div class="flex items-center gap-2">
            <Checkbox
              id="nosec"
              :checked="store.balancerOptions.disallowSecondaryRoles"
              @update:checked="store.balancerOptions.disallowSecondaryRoles = $event"
            />
            <Label for="nosec">{{ t('manager.balancer.options.no_secondary') }}</Label>
          </div>

          <Button
            class="w-full"
            :disabled="store.balanceRunning || store.includedCount < 10"
            @click="runBalance"
          >
            <span v-if="store.balanceRunning" class="flex items-center gap-2">
              <span class="h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground"></span>
              {{ t('manager.balancer.options.running') }}
            </span>
            <span v-else>{{ t('manager.balancer.options.run') }}</span>
          </Button>

          <!-- Saved balances count -->
          <div v-if="store.savedBalances.length > 0" class="text-xs text-muted-foreground">
            {{ t('manager.balancer.options.saved_count', { count: store.savedBalances.length }) }}
          </div>
        </CardContent>
      </Card>

      <!-- Right: Results -->
      <Card class="col-span-1 border border-border/70">
        <CardHeader class="pb-2">
          <CardTitle class="text-base">{{ t('manager.balancer.results.title') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="store.balanceRunning" class="flex justify-center py-8">
            <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>

          <div v-else-if="store.balanceResults.length === 0" class="py-6 text-center text-sm text-muted-foreground">
            {{ t('manager.balancer.results.empty') }}
          </div>

          <div v-else class="max-h-[70vh] overflow-y-auto space-y-2 pr-1">
            <div
              v-for="(result, idx) in store.balanceResults"
              :key="idx"
              class="cursor-pointer rounded border p-2 transition-colors"
              :class="store.selectedBalanceIndex === idx ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'"
              @click="store.selectBalance(idx)"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium">{{ t('manager.balancer.results.balance_n', { n: idx + 1 }) }}</span>
                <Badge variant="secondary" class="text-[10px]">
                  Δ {{ result.dispersion.toFixed(0) }} SR
                </Badge>
              </div>
              <div v-if="result.leftovers?.length" class="mt-1 text-[11px] text-muted-foreground">
                {{ t('manager.balancer.results.leftovers_count', { count: result.leftovers.length }) }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Selected balance preview — full width below columns -->
    <div v-if="store.selectedBalance" class="mt-4 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold">
          {{ t('manager.balancer.results.balance_n', { n: (store.selectedBalanceIndex ?? 0) + 1 }) }}
          <span class="ml-2 text-muted-foreground font-normal">Δ {{ store.selectedBalance.dispersion.toFixed(0) }} SR</span>
        </h2>
        <Button :disabled="saving" @click="saveSelected">
          {{ saving ? t('manager.balancer.results.saving') : t('manager.balancer.results.save') }}
        </Button>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <Card
          v-for="team in store.selectedBalance.teams"
          :key="team.uuid"
          class="border border-border/70"
        >
          <CardHeader class="pb-1 pt-3 px-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-sm">{{ team.name }}</CardTitle>
              <span class="text-xs text-muted-foreground">{{ team.avgSr.toFixed(0) }} SR</span>
            </div>
          </CardHeader>
          <CardContent class="px-3 pb-3 pt-0">
            <ul class="space-y-1">
              <li
                v-for="member in team.members"
                :key="member.uuid"
                class="flex items-center gap-1.5 text-xs"
              >
                <span :class="['w-10 shrink-0 font-medium', roleColor(member.role)]">{{ member.role }}</span>
                <span class="truncate">{{ member.name }}</span>
                <span class="ml-auto shrink-0 text-muted-foreground">{{ member.rank }}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div v-if="store.selectedBalance.leftovers?.length" class="rounded border border-border/50 p-3 text-xs text-muted-foreground">
        <span class="font-medium">{{ t('manager.balancer.results.leftovers_title') }}:</span>
        {{ store.selectedBalance.leftovers.map(l => l.name).join(', ') }}
      </div>
    </div>
  </div>
</template>
