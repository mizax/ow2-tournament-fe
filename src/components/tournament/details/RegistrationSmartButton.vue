<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAuthStore } from '@/stores/authStore.ts'
import { storeToRefs } from 'pinia'
import { useAuthReady } from '@/composables/useAuthReady.ts'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import { fetchWithAuth } from '@/services/apiService.ts'
import { Label } from '@/components/ui/label'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{ tournamentUri: string }>()

const { t } = useI18n()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const router = useRouter()
const authReady = useAuthReady()
const loading = ref(false)
const requestStatusResponse = ref<{ status: string; request_id: number } | undefined>(undefined)

const loadRequestStatusInner = async () => {
  if (isAuthenticated.value) {
    const response = await fetchWithAuth<{ status: string; request_id: number }>(
      `/api/secured/v1/tournaments/${props.tournamentUri}/registration-status`,
    )

    if (response.success) {
      requestStatusResponse.value = response.data
    } else {
      requestStatusResponse.value = { status: 'ERROR', request_id: -1 }
    }
  }
}

const loadRequestStatus = async () => {
  loading.value = true
  try {
    await loadRequestStatusInner()
  } catch (err) {
    console.error('Error fetching tournament registration status:', err)
    requestStatusResponse.value = { status: 'ERROR', request_id: -1 }
  } finally {
    loading.value = false
  }
}

const loadRequestStatusDebounced = async () => {
  loading.value = true
  try {
    await useDebounceFn(loadRequestStatusInner, 500)()
  } catch (err) {
    console.error('Error fetching tournament registration status:', err)
    requestStatusResponse.value = { status: 'ERROR', request_id: -1 }
  } finally {
    loading.value = false
  }
}

onMounted(loadRequestStatus)

const buttonConfig = computed(() => {
  if (!isAuthenticated.value) {
    return {
      is: Label,
      text: t('registration.button.login_to_register'),
      classes: '',
      action: () => {},
    }
  }
  if (requestStatusResponse.value?.status === null) {
    return {
      is: Button,
      text: t('registration.smart_button.register'),
      classes: 'bg-[oklch(0.6265_0.2171_141.88)] text-lg cursor-pointer',
      action: () =>
        router.push({
          name: 'tournament-registration',
          params: { tournamentSef: props.tournamentUri },
        }),
    }
  } else if (requestStatusResponse.value?.status !== undefined) {
    const navigateToRequestStatusPage = async () => {
      await router.push({
        name: 'tournament-registration-status',
        params: {
          tournamentSef: props.tournamentUri,
          registrationId: requestStatusResponse.value?.request_id,
        },
      })
    }
    switch (requestStatusResponse.value?.status) {
      case 'ACCEPTED':
        return {
          is: Button,
          text: t('registration.smart_button.already_registered'),
          classes: 'bg-[oklch(0.5_0.1751_141.88)] text-lg cursor-pointer',
          action: navigateToRequestStatusPage,
        }
      case 'DECLINED':
        return {
          is: Button,
          text: t('registration.smart_button.declined'),
          classes: 'bg-black text-lg text-white cursor-pointer',
          action: navigateToRequestStatusPage,
        }
      case 'PENDING':
        return {
          is: Button,
          text: t('registration.smart_button.pending'),
          classes: 'bg-[oklch(0.764_0.1392_100.59)] text-lg cursor-pointer',
          action: navigateToRequestStatusPage,
        }
      case 'PROCESSING':
        return {
          is: Button,
          text: t('registration.smart_button.processing'),
          classes: 'bg-[oklch(0.5412_0.1357_50.82)] text-lg cursor-pointer',
          action: navigateToRequestStatusPage,
        }
      case 'ACTION_REQUIRED':
        return {
          is: Button,
          text: t('registration.smart_button.action_required'),
          classes: 'bg-[oklch(0.4588_0.1702_15.88)] text-md cursor-pointer',
          action: navigateToRequestStatusPage,
        }
      default:
        return {
          is: Button,
          text: t('registration.smart_button.status_error'),
          classes: 'bg-destructive text-md',
          action: loadRequestStatusDebounced,
        }
    }
  }

  return {
    is: Button,
    text: t('registration.smart_button.loading'),
    classes: 'text-lg',
    action: () => {},
  }
})
</script>

<template>
  <div class="text-right">
    <component
      :is="buttonConfig.is"
      :class="buttonConfig.classes"
      size="lg"
      @click.prevent="buttonConfig.action"
    >
      <Spinner v-if="!authReady || loading" class="animate-spin" />
      {{ buttonConfig.text }}
    </component>
  </div>
</template>

<style scoped></style>
