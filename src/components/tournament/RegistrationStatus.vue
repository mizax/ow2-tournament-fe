<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Copyable } from '@/components/ui/copyable'
import { Spinner } from '@/components/ui/spinner'
import { fetchWithAuth } from '@/services/apiService'
import { format } from 'date-fns'
import { DATE_FORMAT_EXTENDED } from '@/util/date'
import { RoleValue } from '@/components/tournament/registration/types'

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

const statusBadgeClasses = computed(() => {
  switch (registrationDetails.value?.status) {
    case 'ACCEPTED':
      return 'bg-[oklch(0.5_0.1751_141.88)]'
    case 'DECLINED':
      return 'bg-black text-white'
    case 'PENDING':
      return 'bg-[oklch(0.764_0.1392_100.59)] text-black'
    case 'PROCESSING':
      return 'bg-[oklch(0.5412_0.1357_50.82)] text-white'
    case 'ACTION_REQUIRED':
      return 'bg-[oklch(0.4588_0.1702_15.88)] text-white'
    default:
      return 'bg-destructive text-white'
  }
})

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
  ['PENDING', 'PROCESSING'].includes(registrationDetails.value?.status ?? ''),
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
  <div class="container mx-auto py-12">
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

    <div v-else-if="registrationDetails" class="space-y-6">
      <Card>
        <CardHeader class="space-y-1">
          <CardTitle class="text-xl">
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
          <p class="text-sm text-muted-foreground">
            {{ t('tournament.registration_status.subtitle', { id: registrationId }) }}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell class="font-medium w-3/4">
                  {{ t('tournament.registration_status.status') }}
                </TableCell>
                <TableCell>
                  <Badge :class="statusBadgeClasses" class="text-md">{{ statusLabel }}</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.registration_status.created_at') }}
                </TableCell>
                <TableCell>{{ formatDate(registrationDetails.createdAt) }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.registration_status.updated_at') }}
                </TableCell>
                <TableCell>{{ formatDate(registrationDetails.updatedAt) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-xl">{{
            t('tournament.registration_status.info_title')
          }}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell class="font-medium w-3/4">
                  {{ t('tournament.registration_form.battletag.label') }}
                </TableCell>
                <TableCell>
                  {{ registrationDetails.battleTag || t('tournament.registration_status.empty') }}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.registration_form.twitch.label') }}
                </TableCell>
                <TableCell>
                  <a
                    v-if="registrationDetails.twitch"
                    :href="`https://twitch.tv/${registrationDetails.twitch}`"
                    target="_blank"
                    class="text-muted-foreground hover:underline"
                  >
                    {{ registrationDetails.twitch }}
                  </a>
                  <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.registration_form.discord.label') }}
                </TableCell>
                <TableCell>
                  {{ registrationDetails.discord || t('tournament.registration_status.empty') }}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.registration_form.roles.primary') }}
                </TableCell>
                <TableCell>{{ roleLabel(registrationDetails.primaryRole) }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.registration_form.roles.secondary') }}
                </TableCell>
                <TableCell>{{ roleLabel(registrationDetails.secondaryRole) }}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.registration_form.alt_accounts.label') }}
                </TableCell>
                <TableCell>
                  <div v-if="registrationDetails.altAccounts?.length" class="flex flex-wrap gap-2">
                    <Badge
                      v-for="altAccount in registrationDetails.altAccounts"
                      :key="altAccount"
                      variant="secondary"
                    >
                      {{ altAccount }}
                    </Badge>
                  </div>
                  <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.registration_form.guarantors.label') }}
                </TableCell>
                <TableCell>
                  <div v-if="registrationDetails.guarantors?.length" class="flex flex-wrap gap-2">
                    <Badge
                      v-for="guarantor in registrationDetails.guarantors"
                      :key="guarantor"
                      variant="secondary"
                    >
                      {{ guarantor }}
                    </Badge>
                  </div>
                  <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.registration_form.additional_info.label') }}
                </TableCell>
                <TableCell>
                  {{
                    registrationDetails.additionalInfo || t('tournament.registration_status.empty')
                  }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card v-if="showSteps">
        <CardHeader>
          <CardTitle class="text-xl">{{
            t('tournament.registration_status.steps_title')
          }}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell class="font-medium w-3/4">
                  {{ t('tournament.participation.verification_btag') }}
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.participation.twitch_channel') }}
                </TableCell>
                <TableCell>
                  <a
                    v-if="registrationDetails.twitchChannel"
                    :href="`https://twitch.tv/${registrationDetails.twitchChannel}`"
                    class="text-muted-foreground hover:underline"
                    target="_blank"
                  >
                    {{ registrationDetails.twitchChannel }}
                  </a>
                  <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium">
                  {{ t('tournament.participation.donation') }}
                </TableCell>
                <TableCell>
                  <span
                    v-if="
                      registrationDetails.donationAmountRub !== null &&
                      registrationDetails.donationAmountRub !== undefined
                    "
                  >
                    {{ registrationDetails.donationAmountRub }} RUB
                  </span>
                  <span v-else>{{ t('tournament.registration_status.empty') }}</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card v-if="showManagerComment">
        <CardHeader>
          <CardTitle class="text-xl">
            {{ t('tournament.registration_status.manager_comment_title') }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{{ registrationDetails.managerComment }}</p>
        </CardContent>
      </Card>

      <Card v-if="showDeclineReason">
        <CardHeader>
          <CardTitle class="text-xl">
            {{ t('tournament.registration_status.decline_reason_title') }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{{ registrationDetails.declineReason }}</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped></style>
