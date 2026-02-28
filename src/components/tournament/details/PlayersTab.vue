<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { fetchWithoutAuth } from '@/services/apiService'
import { RoleValue } from '@/components/tournament/registration/types'

import roleTank from '@/assets/img/role-tank-64.png'
import roleDamage from '@/assets/img/role-damage-64.png'
import roleSupport from '@/assets/img/role-support-64.png'
import roleFlex from '@/assets/img/role-flex-64.png'

interface PublicRegistrationSummary {
  battletag: string
  primary_role?: RoleValue | null
}

const props = defineProps<{ tournamentSef: string }>()

const { t } = useI18n()
const isLoading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const registrations = ref<PublicRegistrationSummary[]>([])

const roleIcons: Record<RoleValue, string> = {
  [RoleValue.TANK]: roleTank,
  [RoleValue.DAMAGE]: roleDamage,
  [RoleValue.SUPPORT]: roleSupport,
  [RoleValue.FLEX]: roleFlex,
}

const roleIcon = (role?: RoleValue | null) => roleIcons[role ?? RoleValue.FLEX]

const filteredRegistrations = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) {
    return registrations.value
  }
  return registrations.value.filter((registration) =>
    registration.battletag.toLowerCase().includes(query),
  )
})

const countLabel = computed(() =>
  t('tournament.players.count', {
    shown: filteredRegistrations.value.length,
    total: registrations.value.length,
  }),
)

const loadRegistrations = async () => {
  if (!props.tournamentSef) {
    return
  }

  isLoading.value = true
  error.value = null

  const response = await fetchWithoutAuth<PublicRegistrationSummary[]>(
    `/api/public/v1/tournaments/${props.tournamentSef}/registrations`,
  )

  if (!response.success) {
    console.error('Error fetching tournament registrations:', response.errorCode)
    error.value = t('tournament.players.load_error')
    registrations.value = []
  } else {
    registrations.value = response.data ?? []
  }

  isLoading.value = false
}

onMounted(loadRegistrations)
watch(() => props.tournamentSef, loadRegistrations)
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold tracking-tight">{{ t('tournament.tabs.players') }}</h2>
        <p class="text-xs text-muted-foreground">{{ countLabel }}</p>
      </div>
      <div class="w-full max-w-xs space-y-1">
        <Label class="text-xs uppercase text-muted-foreground">
          {{ t('tournament.players.search_label') }}
        </Label>
        <Input v-model="search" :placeholder="t('tournament.players.search_placeholder')" />
      </div>
    </div>
    <div>
      <div
        v-if="isLoading"
        class="flex items-center justify-center gap-2 py-10 text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <Spinner class="size-4 animate-spin" />
        <span class="text-sm">{{ t('tournament.players.loading') }}</span>
      </div>

      <div v-else-if="error" class="py-10 text-center text-destructive" role="alert">
        {{ error }}
      </div>

      <div v-else>
        <div v-if="!filteredRegistrations.length" class="py-10 text-center text-muted-foreground">
          {{ search.trim() ? t('tournament.players.empty_search') : t('tournament.players.empty') }}
        </div>

        <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="(player, index) in filteredRegistrations"
            :key="`${player.battletag}-${index}`"
            class="flex items-center gap-3 rounded-xl border border-border/60 bg-background/35 px-3 py-2"
          >
            <img
              :src="roleIcon(player.primary_role)"
              :alt="player.primary_role ?? RoleValue.FLEX"
              class="h-8 w-8"
              loading="lazy"
              decoding="async"
            />
            <span class="font-medium text-foreground truncate">{{ player.battletag }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
