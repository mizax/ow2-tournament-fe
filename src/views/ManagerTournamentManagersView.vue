<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { RouterLink } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { TournamentManager, UserSearchResult } from '@/types/tournament-manager'
import {
  listTournamentManagers,
  addTournamentManager,
  removeTournamentManager,
  searchUsersForManager,
} from '@/services/tournamentManagerApi'

const route = useRoute()
const { t } = useI18n()

const tournamentId = computed(() => Number(route.params.tournamentId))

const managers = ref<TournamentManager[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)

const dialogOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<UserSearchResult[]>([])
const searchLoading = ref(false)
const selectedUser = ref<UserSearchResult | null>(null)
const newManagerCanManage = ref(false)
const addSubmitting = ref(false)

const removingId = ref<number | null>(null)

const callerCanManage = computed(() =>
  managers.value.some((m) => m.can_remove || m.is_owner || m.can_manage_managers),
)

const showAddButton = computed(() =>
  managers.value.some((m) => m.can_manage_managers),
)

async function loadManagers() {
  loading.value = true
  loadError.value = null
  const res = await listTournamentManagers(tournamentId.value)
  loading.value = false
  if (res.success && res.data) {
    managers.value = res.data
  } else {
    loadError.value = t('manager.managers.load_error')
  }
}

const debouncedSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searchLoading.value = true
  const res = await searchUsersForManager(searchQuery.value.trim())
  searchLoading.value = false
  if (res.success && res.data) {
    searchResults.value = res.data
  }
}, 300)

watch(searchQuery, () => {
  selectedUser.value = null
  debouncedSearch()
})

function openAddDialog() {
  searchQuery.value = ''
  searchResults.value = []
  selectedUser.value = null
  newManagerCanManage.value = false
  dialogOpen.value = true
}

function selectUser(user: UserSearchResult) {
  selectedUser.value = user
  searchQuery.value = user.battletag ?? String(user.id)
  searchResults.value = []
}

async function submitAddManager() {
  if (!selectedUser.value) return
  addSubmitting.value = true
  const res = await addTournamentManager(
    tournamentId.value,
    selectedUser.value.id,
    newManagerCanManage.value,
  )
  addSubmitting.value = false
  if (res.success) {
    toast.success(t('manager.managers.toasts.added'))
    dialogOpen.value = false
    await loadManagers()
  } else {
    toast.error(t('manager.managers.toasts.add_error'))
  }
}

async function removeManager(manager: TournamentManager) {
  if (!manager.can_remove) return
  removingId.value = manager.user_id
  const res = await removeTournamentManager(tournamentId.value, manager.user_id)
  removingId.value = null
  if (res.success) {
    toast.success(t('manager.managers.toasts.removed'))
    await loadManagers()
  } else {
    toast.error(t('manager.managers.toasts.remove_error'))
  }
}

onMounted(loadManagers)
</script>

<template>
  <div class="page-shell mx-auto max-w-4xl py-8">
    <section class="page-head">
      <div class="mb-4">
        <Button variant="ghost" size="sm" :as="RouterLink" :to="{ name: 'manager-dashboard' }">
          ← {{ t('manager.registrations.back') }}
        </Button>
      </div>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="page-title">{{ t('manager.managers.title') }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('manager.logs.tournament_id', { id: tournamentId }) }}
          </p>
        </div>
        <Button v-if="showAddButton" @click="openAddDialog">
          {{ t('manager.managers.add') }}
        </Button>
      </div>
    </section>

    <div
      v-if="loading"
      class="text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {{ t('manager.managers.loading') }}
    </div>

    <div
      v-else-if="loadError"
      class="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {{ loadError }}
    </div>

    <div v-else-if="managers.length === 0" class="text-sm text-muted-foreground">
      {{ t('manager.managers.empty') }}
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-border/60">
      <table class="w-full text-sm">
        <thead class="border-b border-border/60 bg-muted/30">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">
              {{ t('manager.managers.table.battletag') }}
            </th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">
              {{ t('manager.managers.table.role') }}
            </th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">
              {{ t('manager.managers.table.added_by') }}
            </th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">
              {{ t('manager.managers.table.added_at') }}
            </th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="manager in managers"
            :key="manager.user_id"
            class="border-b border-border/40 last:border-0 hover:bg-muted/20"
          >
            <td class="px-4 py-3 font-medium">
              {{ manager.battletag ?? manager.user_id }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <Badge v-if="manager.is_owner" variant="default" class="text-[11px] uppercase tracking-wide">
                  {{ t('manager.managers.badges.owner') }}
                </Badge>
                <Badge
                  v-if="manager.can_manage_managers"
                  variant="secondary"
                  class="text-[11px] uppercase tracking-wide"
                >
                  {{ t('manager.managers.badges.can_manage') }}
                </Badge>
              </div>
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ manager.added_by_battletag ?? (manager.added_by_user_id != null ? String(manager.added_by_user_id) : '—') }}
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ manager.added_at.slice(0, 10) }}
            </td>
            <td class="px-4 py-3 text-right">
              <Button
                variant="ghost"
                size="sm"
                :disabled="!manager.can_remove || removingId === manager.user_id"
                class="text-destructive hover:text-destructive disabled:opacity-40"
                @click="removeManager(manager)"
              >
                {{ t('manager.managers.remove') }}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Manager Dialog -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('manager.managers.add_title') }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('manager.managers.search_placeholder')"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <div
              v-if="searchResults.length > 0"
              class="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md"
            >
              <button
                v-for="result in searchResults"
                :key="result.id"
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                @click="selectUser(result)"
              >
                {{ result.battletag ?? result.id }}
              </button>
            </div>
            <p v-if="searchLoading" class="mt-1 text-xs text-muted-foreground">
              ...
            </p>
          </div>

          <label class="flex items-center gap-2 text-sm">
            <input
              v-model="newManagerCanManage"
              type="checkbox"
              class="rounded border-input"
            />
            {{ t('manager.managers.can_manage_managers') }}
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">
            {{ t('manager.managers.cancel') }}
          </Button>
          <Button
            :disabled="!selectedUser || addSubmitting"
            @click="submitAddManager"
          >
            {{ addSubmitting ? '...' : t('manager.managers.submit') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
