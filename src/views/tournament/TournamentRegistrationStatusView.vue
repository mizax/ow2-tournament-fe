<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copyable } from '@/components/ui/copyable'
import { Spinner } from '@/components/ui/spinner'
import { fetchWithAuth } from '@/services/apiService'
import { format } from 'date-fns'
import { DATE_FORMAT_EXTENDED } from '@/util/date'
import { RoleValue } from '@/components/tournament/registration/types'
import { getRegistrationStatusBadgeClasses } from '@/lib/registrationStatusUi'

interface RegistrationDetailsResponse {
  tournamentTitle: string
  tournamentSefTitle: string
  battleTag: string
  altAccounts?: string[] | null
  twitch: string
  discord: string
  primaryRole?: RoleValue | null
  secondaryRole?: RoleValue | null
  guarantors?: string[] | null
  additionalInfo: string
  status: string
  createdAt: string
  updatedAt: string
  managerComment?: string | null
  declineReason?: string | null
  verificationBattletag?: string | null
  twitchChannel?: string | null
  donationAmountRub?: number | null
}

const { t } = useI18n()
const route = useRoute()

const registrationId = computed(() => String(route.params.registrationId ?? ''))
const registrationDetails = ref<RegistrationDetailsResponse | null>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const formatDate = (value?: string) => {
  if (!value) {
    return t('tournament.registration_status.empty')
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return t('tournament.registration_status.empty')
  }
  return format(parsed, DATE_FORMAT_EXTENDED)
}

const roleLabel = (role?: RoleValue | null) => {
  if (!role) {
    return t('tournament.registration_status.empty')
  }
  switch (role) {
    case RoleValue.TANK:
      return t('tournament.registration_form.roles.options.tank')
    case RoleValue.DAMAGE:
      return t('tournament.registration_form.roles.options.damage')
    case RoleValue.SUPPORT:
      return t('tournament.registration_form.roles.options.support')
    case RoleValue.FLEX:
      return t('tournament.registration_form.roles.options.flex')
    default:
      return role
  }
}

const statusLabel = computed(() => {
  switch (registrationDetails.value?.status) {
    case 'ACCEPTED':
      return t('registration.smart_button.already_registered')
    case 'DECLINED':
      return t('registration.smart_button.declined')
    case 'PENDING':
      return t('registration.smart_button.pending')
    case 'PROCESSING':
      return t('registration.smart_button.processing')
    case 'ACTION_REQUIRED':
      return t('registration.smart_button.action_required')
    default:
      return registrationDetails.value?.status ?? t('registration.smart_button.loading')
  }
})

const statusBadgeClasses = computed(() =>
  getRegistrationStatusBadgeClasses(registrationDetails.value?.status),
)

const showManagerComment = computed(
  () =>
    registrationDetails.value?.status === 'ACTION_REQUIRED' &&
    registrationDetails.value?.managerComment,
)
const showDeclineReason = computed(
  () =>
    registrationDetails.value?.status === 'DECLINED' && registrationDetails.value?.declineReason,
)
const showSteps = computed(() =>
  ['PENDING', 'PROCESSING', 'ACCEPTED', 'ACTION_REQUIRED', 'DECLINED'].includes(
    registrationDetails.value?.status ?? '',
  ),
)
const showActionsPanel = computed(
  () => showSteps.value || showManagerComment.value || showDeclineReason.value,
)

const loadRegistrationDetails = async () => {
  if (!registrationId.value) {
    errorMessage.value = t('errors.unknown')
    return
  }

  loading.value = true
  errorMessage.value = null

  const response = await fetchWithAuth<RegistrationDetailsResponse>(
    `/api/secured/v1/registrations/${registrationId.value}`,
  )

  if (response.success) {
    registrationDetails.value = response.data ?? null
  } else {
    errorMessage.value = t('errors.unknown')
  }

  loading.value = false
}

onMounted(loadRegistrationDetails)
watch(registrationId, loadRegistrationDetails)
</script>

<template>
  <div class="container mx-auto py-8">
    <div v-if="loading" class="flex items-center justify-center gap-2 text-muted-foreground">
      <Spinner class="animate-spin" />
      <span>{{ t('registration.smart_button.loading') }}</span>
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-xl border border-destructive/40 bg-destructive/10 p-4"
    >
      <p class="text-sm text-destructive">{{ errorMessage }}</p>
    </div>

    <div v-else-if="registrationDetails">
      <Card class="overflow-hidden">
        <CardHeader class="space-y-2">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle class="text-xl md:text-2xl">
              {{ t('tournament.registration_status.title') }}
              <RouterLink
                :to="{
                  name: 'tournament-details-home',
                  params: { tournamentSef: registrationDetails.tournamentSefTitle },
                }"
                class="hover:underline text-muted-foreground"
              >
                &laquo;{{ registrationDetails.tournamentTitle }}&raquo;
              </RouterLink>
            </CardTitle>
            <Badge :class="statusBadgeClasses" class="text-sm md:text-base">{{
              statusLabel
            }}</Badge>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>{{ t('tournament.registration_status.subtitle', { id: registrationId }) }}</span>
            <span
              >{{ t('tournament.registration_status.created_at') }}:
              {{ formatDate(registrationDetails.createdAt) }}</span
            >
            <span
              >{{ t('tournament.registration_status.updated_at') }}:
              {{ formatDate(registrationDetails.updatedAt) }}</span
            >
          </div>
        </CardHeader>
        <div class="h-px bg-border/70"></div>
        <CardContent class="space-y-6 py-6">
          <div
            class="grid gap-6"
            :class="showActionsPanel ? 'lg:grid-cols-[1.1fr_0.9fr]' : 'lg:grid-cols-1'"
          >
            <section v-if="showActionsPanel" class="space-y-4">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {{ t('tournament.registration_status.info_title') }}
              </h3>
              <dl class="grid gap-y-3 text-sm">
                <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                  <dt class="font-medium text-muted-foreground">
                    {{ t('tournament.registration_form.battletag.label') }}
                  </dt>
                  <dd>
                    {{ registrationDetails.battleTag || t('tournament.registration_status.empty') }}
                  </dd>
                </div>
                <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                  <dt class="font-medium text-muted-foreground">
                    {{ t('tournament.registration_form.twitch.label') }}
                  </dt>
                  <dd>
                    <a
                      v-if="registrationDetails.twitch"
                      :href="`https://twitch.tv/${registrationDetails.twitch}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-muted-foreground hover:underline"
                    >
                      {{ registrationDetails.twitch }}
                    </a>
                    <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                  </dd>
                </div>
                <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                  <dt class="font-medium text-muted-foreground">
                    {{ t('tournament.registration_form.discord.label') }}
                  </dt>
                  <dd>
                    {{ registrationDetails.discord || t('tournament.registration_status.empty') }}
                  </dd>
                </div>
                <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                  <dt class="font-medium text-muted-foreground">
                    {{ t('tournament.registration_form.roles.primary') }}
                  </dt>
                  <dd>
                    <span v-if="registrationDetails.primaryRole" class="chip">
                      {{ roleLabel(registrationDetails.primaryRole) }}
                    </span>
                    <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                  </dd>
                </div>
                <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                  <dt class="font-medium text-muted-foreground">
                    {{ t('tournament.registration_form.roles.secondary') }}
                  </dt>
                  <dd>
                    <span v-if="registrationDetails.secondaryRole" class="chip">
                      {{ roleLabel(registrationDetails.secondaryRole) }}
                    </span>
                    <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                  </dd>
                </div>
                <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                  <dt class="font-medium text-muted-foreground">
                    {{ t('tournament.registration_form.alt_accounts.label') }}
                  </dt>
                  <dd>
                    <div
                      v-if="registrationDetails.altAccounts?.length"
                      class="flex flex-wrap gap-2"
                    >
                      <span
                        v-for="altAccount in registrationDetails.altAccounts"
                        :key="altAccount"
                        class="chip"
                      >
                        {{ altAccount }}
                      </span>
                    </div>
                    <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                  </dd>
                </div>
                <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                  <dt class="font-medium text-muted-foreground">
                    {{ t('tournament.registration_form.guarantors.label') }}
                  </dt>
                  <dd>
                    <div v-if="registrationDetails.guarantors?.length" class="flex flex-wrap gap-2">
                      <span
                        v-for="guarantor in registrationDetails.guarantors"
                        :key="guarantor"
                        class="chip"
                      >
                        {{ guarantor }}
                      </span>
                    </div>
                    <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                  </dd>
                </div>
                <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                  <dt class="font-medium text-muted-foreground">
                    {{ t('tournament.registration_form.additional_info.label') }}
                  </dt>
                  <dd>
                    {{
                      registrationDetails.additionalInfo ||
                      t('tournament.registration_status.empty')
                    }}
                  </dd>
                </div>
              </dl>
            </section>

            <section class="space-y-4">
              <template v-if="showSteps">
                <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {{ t('tournament.registration_status.steps_title') }}
                </h3>
                <dl class="grid gap-y-3 text-sm">
                  <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                    <dt class="font-medium text-muted-foreground">
                      {{ t('tournament.participation.verification_btag') }}
                    </dt>
                    <dd>
                      <Copyable
                        v-if="registrationDetails.verificationBattletag"
                        :value="registrationDetails.verificationBattletag"
                        :as="Badge"
                        variant="secondary"
                        class="gap-1.5 px-2 py-0.5"
                      >
                        {{ registrationDetails.verificationBattletag }}
                      </Copyable>
                      <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                    </dd>
                  </div>
                  <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                    <dt class="font-medium text-muted-foreground">
                      {{ t('tournament.participation.twitch_channel') }}
                    </dt>
                    <dd>
                      <a
                        v-if="registrationDetails.twitchChannel"
                        :href="`https://twitch.tv/${registrationDetails.twitchChannel}`"
                        class="text-muted-foreground hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ registrationDetails.twitchChannel }}
                      </a>
                      <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                    </dd>
                  </div>
                  <div class="grid grid-cols-1 gap-1 md:grid-cols-[220px_1fr]">
                    <dt class="font-medium text-muted-foreground">
                      {{ t('tournament.participation.donation') }}
                    </dt>
                    <dd>
                      <span
                        v-if="
                          registrationDetails.donationAmountRub !== null &&
                          registrationDetails.donationAmountRub !== undefined
                        "
                      >
                        {{ registrationDetails.donationAmountRub }} RUB
                      </span>
                      <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                    </dd>
                  </div>
                </dl>
              </template>

              <div
                v-if="showManagerComment"
                class="rounded-xl border border-border/60 bg-muted/30 p-4"
              >
                <p class="text-xs uppercase tracking-wide text-muted-foreground">
                  {{ t('tournament.registration_status.manager_comment_title') }}
                </p>
                <p class="mt-2 text-sm">{{ registrationDetails.managerComment }}</p>
              </div>

              <div
                v-if="showDeclineReason"
                class="rounded-xl border border-border/60 bg-muted/30 p-4"
              >
                <p class="text-xs uppercase tracking-wide text-muted-foreground">
                  {{ t('tournament.registration_status.decline_reason_title') }}
                </p>
                <p class="mt-2 text-sm">{{ registrationDetails.declineReason }}</p>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped></style>
