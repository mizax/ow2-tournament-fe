<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import TournamentRegistrationForm from '@/components/tournament/registration/TournamentRegistrationForm.vue'
import type { RegistrationFormValues } from '@/components/tournament/registration/types'
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

const showValidationErrors = (errors: string[]) => {
  errors.forEach((errorKey) => {
    const message = te(errorKey) ? t(errorKey) : errorKey
    toast.error(message)
  })
}

const handleSubmit = async (payload: RegistrationFormValues) => {
  const tournamentSef = route.params.tournamentSef as string | undefined

  if (!tournamentSef) {
    toast.error(t('errors.unknown'))
    return
  }

  const response = await fetchWithAuth<RegistrationResponse, RegistrationErrorResponse>(
    `/api/secured/v1/tournaments/${tournamentSef}/register`,
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
      tournamentSef,
      registrationId: response.data.registration_id,
    },
  })
}
</script>

<template>
  <TournamentRegistrationForm :on-submit="handleSubmit" />
</template>

<style scoped></style>
