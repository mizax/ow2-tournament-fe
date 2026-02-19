<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TournamentRegistrationForm from '@/components/tournament/registration/TournamentRegistrationForm.vue'
import type { RegistrationFormValues } from '@/components/tournament/registration/types'
import { useTournamentStore } from '@/stores/tournamentStore'
import { fetchWithAuth } from '@/services/apiService'

interface RegistrationResponse {
  registration_id: number
  status: string
}

interface RegistrationErrorResponse {
  error?: string
  details?: string
  errors?: string[]
}

const { t, te } = useI18n()
const route = useRoute()
const router = useRouter()
const tournamentStore = useTournamentStore()

const tournamentSef = computed(() => route.params.tournamentSef as string | undefined)
const tournamentTitle = computed(() =>
  tournamentSef.value ? tournamentStore.tournaments[tournamentSef.value]?.title : undefined,
)
const tournamentLoading = ref(false)

const showValidationErrors = (errors: string[]) => {
  errors.forEach((errorKey) => {
    const message = te(errorKey) ? t(errorKey) : errorKey
    toast.error(message)
  })
}

const handleSubmit = async (payload: RegistrationFormValues) => {
  if (!tournamentSef.value) {
    toast.error(t('errors.unknown'))
    return
  }

  const response = await fetchWithAuth<RegistrationResponse, RegistrationErrorResponse>(
    `/api/secured/v1/tournaments/${tournamentSef.value}/register`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.success) {
    const errorData = response.errorData
    if (errorData?.error === 'validation_error' && Array.isArray(errorData.errors)) {
      showValidationErrors(errorData.errors)
      return
    }

    if (errorData?.error === 'already_registered') {
      toast.error(t('errors.already_registered'))
      return
    }

    if (errorData?.error === 'registration_not_started') {
      toast.error(t('errors.registration_not_started'))
      return
    }

    if (errorData?.error === 'registration_closed') {
      toast.error(t('errors.registration_closed'))
      return
    }

    if (errorData?.details) {
      toast.error(errorData.details)
      return
    }

    toast.error(t('errors.unknown'))
    return
  }

  if (!response.data?.registration_id) {
    toast.error(t('errors.unknown'))
    return
  }

  await router.push({
    name: 'tournament-registration-status',
    params: {
      tournamentSef: tournamentSef.value,
      registrationId: response.data.registration_id,
    },
  })
}

const loadTournament = async () => {
  if (!tournamentSef.value || tournamentTitle.value) {
    return
  }

  tournamentLoading.value = true
  const response = await tournamentStore.fetchTournament(tournamentSef.value)
  tournamentLoading.value = false

  if (!response.success) {
    console.error('Error fetching tournament details:', response.errorCode)
  }
}

onMounted(loadTournament)
</script>

<template>
  <div class="container mx-auto py-8">
    <Card>
      <CardHeader class="space-y-1">
        <CardTitle class="text-xl">
          {{ t('tournament.registration_form.title') }}
          <RouterLink
            v-if="tournamentTitle"
            :to="{ name: 'tournament-details-home', params: { tournamentSef } }"
            class="hover:underline text-muted-foreground"
          >
            &laquo;{{ tournamentTitle }}&raquo;
          </RouterLink>
          <span v-else-if="tournamentLoading" class="text-muted-foreground">
            {{ t('registration.smart_button.loading') }}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TournamentRegistrationForm :on-submit="handleSubmit" />
      </CardContent>
    </Card>
  </div>
</template>

<style scoped></style>
