<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { selfCheckin, getSelfCheckin } from '@/services/balancerApi'
import { toast } from 'vue-sonner'

interface Props {
  tournamentId: number
  checkinFrom?: string
  checkinTo?: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const checkedIn = ref(false)
const checkinChecked = ref(false)

const isWindowOpen = computed(() => {
  const now = Date.now()
  if (props.checkinFrom) {
    const from = new Date(props.checkinFrom).getTime()
    if (now < from) return false
  }
  if (props.checkinTo) {
    const to = new Date(props.checkinTo).getTime()
    if (now > to) return false
  }
  return !!(props.checkinFrom || props.checkinTo)
})

onMounted(async () => {
  if (!authStore.isAuthenticated || !props.tournamentId) return
  const r = await getSelfCheckin(props.tournamentId)
  if (r.success && r.data) {
    const data = r.data as { checked_in?: boolean }
    checkedIn.value = data.checked_in === true
  }
  checkinChecked.value = true
})

async function doCheckin() {
  if (loading.value) return
  loading.value = true
  const r = await selfCheckin(props.tournamentId)
  loading.value = false
  if (r.success) {
    checkedIn.value = true
    toast.success(t('tournament.checkin_button.success'))
  } else {
    const err = r.errorData as { error?: string } | undefined
    const msg = err?.error ?? t('tournament.checkin_button.error_fallback')
    toast.error(msg)
  }
}
</script>

<template>
  <div v-if="authStore.isAuthenticated && isWindowOpen && checkinChecked" class="mt-4">
    <div v-if="checkedIn" class="inline-flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-600 dark:text-green-400">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      {{ t('tournament.checkin_button.checked_in') }}
    </div>
    <Button v-else :disabled="loading" @click="doCheckin">
      {{ loading ? t('tournament.checkin_button.loading') : t('tournament.checkin_button.action') }}
    </Button>
  </div>
</template>
