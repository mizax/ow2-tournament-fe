<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TournamentEditForm from '@/components/manager/tournament-edit/TournamentEditForm.vue'
import {
  fetchManagedTournament,
  updateManagedTournament,
} from '@/services/tournamentManagerApi'
import type { TournamentEditFormValues } from '@/types/tournament-manager'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const tournamentId = computed(() => String(route.params.tournamentId ?? ''))
const loading = ref(true)
const loadError = ref(false)
const title = ref('')
const values = ref<TournamentEditFormValues | null>(null)

const loadTournament = async () => {
  loading.value = true
  loadError.value = false
  const response = await fetchManagedTournament(tournamentId.value)
  loading.value = false

  if (!response.success || !response.data) {
    loadError.value = true
    toast.error(t('errors.unknown'))
    return
  }

  const tournament = response.data
  title.value = tournament.title
  values.value = {
    title: tournament.title,
    sef_title: tournament.sef_title,
    discipline: tournament.discipline,
    format: tournament.format,
    type: tournament.type,
    organizers: tournament.organizers,
    rules: tournament.rules,
    eligibility: tournament.eligibility,
    registration: tournament.registration,
    teams: tournament.teams,
    schedule: tournament.schedule,
    match_format: tournament.match_format,
    prize_pool: tournament.prize_pool,
    stream: tournament.stream,
    status: tournament.status,
    results: tournament.results,
    media: tournament.media,
    markdown: tournament.markdown,
  }
}

onMounted(async () => {
  await loadTournament()
})

const handleSubmit = async (payload: TournamentEditFormValues) => {
  const response = await updateManagedTournament(tournamentId.value, payload)

  if (response.success) {
    toast.success('Турнир обновлён')
    await router.push({ name: 'manager-registrations', params: { tournamentId: tournamentId.value } })
    return
  }

  const errorKey =
    response.errorData && typeof response.errorData === 'object' && 'error' in response.errorData
      ? String((response.errorData as { error: string }).error)
      : response.errorCode

  if (errorKey === 'sef_title_taken') {
    toast.error('SEF title уже занят')
    return
  }

  toast.error(t('errors.unknown'))
}
</script>

<template>
  <div class="page-shell">
    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Spinner class="animate-spin" />
      <span>Загрузка турнира...</span>
    </div>

    <Card v-else-if="values">
      <CardHeader>
        <CardTitle>Редактирование турнира «{{ title }}»</CardTitle>
      </CardHeader>
      <CardContent>
        <TournamentEditForm :initial-values="values" :on-submit="handleSubmit" />
      </CardContent>
    </Card>

    <Card v-else-if="loadError">
      <CardHeader>
        <CardTitle>Не удалось загрузить турнир</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <p class="text-sm text-muted-foreground">Проверьте доступ и попробуйте снова.</p>
        <button
          type="button"
          class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          @click="loadTournament"
        >
          Повторить
        </button>
      </CardContent>
    </Card>
  </div>
</template>
