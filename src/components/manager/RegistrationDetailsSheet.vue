<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { format } from 'date-fns'
import { DATE_FORMAT_EXTENDED } from '@/util/date'
import { roleValues, RoleValue } from '@/components/tournament/registration/types'
import type {
  RegistrationDetailResponse,
  RegistrationStatus,
  RoleRankingAssignment,
} from '@/types/registrationManager'
import { useRegistrationManagerStore } from '@/stores/registrationManagerStore'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copyable } from '@/components/ui/copyable'

const props = defineProps<{ open: boolean; registrationId: number | null }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

const managerStore = useRegistrationManagerStore()
const localStatus = ref<RegistrationStatus | ''>('')
const declineReason = ref('')
const requestedActionDescription = ref('')
const commentText = ref('')
const roleRankingDraft = ref<Record<RoleValue, string>>({
  [RoleValue.TANK]: '',
  [RoleValue.DAMAGE]: '',
  [RoleValue.SUPPORT]: '',
  [RoleValue.FLEX]: '',
})
const lastInitializedId = ref<number | null>(null)

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const registrationDetails = computed<RegistrationDetailResponse | null>(() => {
  if (!props.registrationId) {
    return null
  }
  return managerStore.registrationDetails[props.registrationId] ?? null
})

const isLoading = computed(() =>
  props.registrationId ? managerStore.registrationDetailsLoading[props.registrationId] : false,
)

const statusOptions: RegistrationStatus[] = [
  'PENDING',
  'PROCESSING',
  'ACCEPTED',
  'ACTION_REQUIRED',
  'DECLINED',
  'DELETED',
]

const formatDate = (value?: string) => {
  if (!value) {
    return 'N/A'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A'
  }
  return format(parsed, DATE_FORMAT_EXTENDED)
}

const roleLabel = (role?: RoleValue | null) => {
  switch (role) {
    case RoleValue.TANK:
      return 'Tank'
    case RoleValue.DAMAGE:
      return 'Damage'
    case RoleValue.SUPPORT:
      return 'Support'
    case RoleValue.FLEX:
      return 'Flex'
    default:
      return 'N/A'
  }
}

const statusLabel = (status?: RegistrationStatus) => status ?? 'Unknown'

const statusBadgeClasses = (status?: RegistrationStatus) => {
  switch (status) {
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
    case 'DELETED':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

const initializeFormState = (details: RegistrationDetailResponse) => {
  localStatus.value = details.registration.status
  declineReason.value = details.registration.decline_reason ?? ''
  requestedActionDescription.value = ''

  const draft: Record<RoleValue, string> = {
    [RoleValue.TANK]: '',
    [RoleValue.DAMAGE]: '',
    [RoleValue.SUPPORT]: '',
    [RoleValue.FLEX]: '',
  }

  details.role_rankings.forEach((ranking) => {
    draft[ranking.role] = String(ranking.ranking)
  })

  roleRankingDraft.value = draft
  commentText.value = ''
}

const ensureDetailsLoaded = async (registrationId: number) => {
  const response = await managerStore.loadRegistrationDetails(registrationId)
  if (!response.success) {
    toast.error('Unable to load registration details.')
  }
}

watch(
  () => props.registrationId,
  async (registrationId) => {
    if (!registrationId) {
      return
    }
    await ensureDetailsLoaded(registrationId)
  },
)

watch(
  () => registrationDetails.value,
  (details) => {
    if (!details || details.registration.id === lastInitializedId.value) {
      return
    }
    lastInitializedId.value = details.registration.id
    initializeFormState(details)
  },
  { immediate: true },
)

const submitStatusUpdate = async () => {
  if (!props.registrationId || !localStatus.value) {
    return
  }

  const payload = {
    status: localStatus.value,
  } as {
    status: RegistrationStatus
    decline_reason?: string | null
    requested_action_description?: string | null
  }

  if (localStatus.value === 'DECLINED') {
    payload.decline_reason = declineReason.value || null
  }

  if (localStatus.value === 'ACTION_REQUIRED') {
    payload.requested_action_description = requestedActionDescription.value || null
  }

  const response = await managerStore.updateRegistrationStatus(props.registrationId, payload)
  if (response.success) {
    toast.success('Status updated')
  } else {
    toast.error('Unable to update status')
  }
}

const submitComment = async () => {
  if (!props.registrationId || !commentText.value.trim()) {
    return
  }

  const response = await managerStore.addRegistrationComment(
    props.registrationId,
    commentText.value.trim(),
  )

  if (response.success) {
    commentText.value = ''
    toast.success('Comment added')
  } else {
    toast.error('Unable to add comment')
  }
}

const submitRoleRankings = async () => {
  if (!props.registrationId) {
    return
  }

  console.log(roleRankingDraft.value)
  const assignments: RoleRankingAssignment[] = roleValues
    .map((role) => {
      let rawValue: string | null = null
      if (typeof roleRankingDraft.value[role] === 'string') {
        rawValue = roleRankingDraft.value[role]?.trim()
      } else {
        rawValue = roleRankingDraft.value[role]
      }
      if (!rawValue) {
        return null
      }
      const ranking = Number(rawValue)
      if (!Number.isFinite(ranking)) {
        return null
      }
      return { role, ranking }
    })
    .filter((assignment): assignment is RoleRankingAssignment => assignment !== null)

  if (!assignments.length) {
    toast.error('Provide at least one ranking')
    return
  }

  const response = await managerStore.updateRoleRankings(props.registrationId, assignments)
  if (response.success) {
    toast.success('Rankings updated')
  } else {
    toast.error('Unable to update rankings')
  }
}

const resolveAction = async (actionId: number) => {
  if (!props.registrationId) {
    return
  }

  const response = await managerStore.resolveRequestedAction(props.registrationId, actionId)
  if (response.success) {
    toast.success('Action resolved')
  } else {
    toast.error('Unable to resolve action')
  }
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent class="sm:max-w-lg">
      <SheetHeader>
        <SheetTitle> Registration #{{ registrationDetails?.registration.id ?? '' }} </SheetTitle>
        <SheetDescription>
          <Copyable v-if="registrationDetails?.battletag" :value="registrationDetails.battletag">
            {{ registrationDetails.battletag }}
          </Copyable>
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto pr-2 space-y-6">
        <div v-if="isLoading" class="flex items-center justify-center gap-2 text-muted-foreground">
          <Spinner class="animate-spin" />
          <span>Loading registration...</span>
        </div>

        <div v-else-if="registrationDetails" class="space-y-6">
          <div class="rounded-lg border p-4 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Status</span>
              <Badge :class="statusBadgeClasses(registrationDetails.registration.status)">
                {{ statusLabel(registrationDetails.registration.status) }}
              </Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Alt accounts</span>
              <div class="flex gap-1">
                <Copyable
                  v-for="account in registrationDetails.registration.alt_accounts || []"
                  :key="`alt-${registrationId}-${account}`"
                  :value="account"
                >
                  {{ account }}
                </Copyable>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Twitch</span>
              <Copyable :value="registrationDetails.registration.twitch">
                {{ registrationDetails.registration.twitch || 'N/A' }}
              </Copyable>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Discord</span>
              <Copyable :value="registrationDetails.registration.discord">
                {{ registrationDetails.registration.discord || 'N/A' }}
              </Copyable>
            </div>
            <div class="grid gap-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Primary role</span>
                <span>{{ roleLabel(registrationDetails.registration.primary_role) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Secondary role</span>
                <span>{{ roleLabel(registrationDetails.registration.secondary_role) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Guarantors</span>
                <div class="flex gap-1">
                  <Copyable
                    v-for="guarantor in registrationDetails.registration.guarantors || []"
                    :key="`gua-${registrationId}-${guarantor}`"
                    :value="guarantor"
                  >
                    {{ guarantor }}
                  </Copyable>
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground">Additional info</p>
                <div class="rounded-md border p-2 text-sm whitespace-pre-line">
                  {{ registrationDetails.registration.additional_info || 'N/A' }}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">Update status</h3>
            <Select v-model="localStatus">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="status in statusOptions" :key="status" :value="status">
                  {{ status }}
                </SelectItem>
              </SelectContent>
            </Select>

            <div v-if="localStatus === 'DECLINED'" class="space-y-2">
              <label class="text-xs text-muted-foreground">Decline reason</label>
              <Textarea v-model="declineReason" placeholder="Provide a reason" />
            </div>

            <div v-if="localStatus === 'ACTION_REQUIRED'" class="space-y-2">
              <label class="text-xs text-muted-foreground">Requested action</label>
              <Textarea
                v-model="requestedActionDescription"
                placeholder="Describe required action"
              />
            </div>

            <Button class="w-full" @click="submitStatusUpdate">Update status</Button>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">Role rankings</h3>
            <div class="grid gap-2">
              <div v-for="role in roleValues" :key="role" class="flex items-center gap-3">
                <span class="w-24 text-sm">{{ roleLabel(role) }}</span>
                <Input v-model="roleRankingDraft[role]" type="number" min="1" placeholder="Rank" />
              </div>
            </div>
            <Button class="w-full" variant="secondary" @click="submitRoleRankings">
              Save rankings
            </Button>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">Requested actions</h3>
            <div v-if="registrationDetails.requested_actions.length" class="space-y-2">
              <div
                v-for="action in registrationDetails.requested_actions"
                :key="action.id"
                class="rounded-md border p-3 space-y-2"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">#{{ action.id }}</span>
                  <Badge
                    :class="
                      statusBadgeClasses(
                        action.status === 'RESOLVED' ? 'ACCEPTED' : 'ACTION_REQUIRED',
                      )
                    "
                  >
                    {{ action.status }}
                  </Badge>
                </div>
                <p class="text-sm">{{ action.description }}</p>
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{{ formatDate(action.created_at) }}</span>
                  <Button
                    v-if="action.status === 'PENDING'"
                    size="sm"
                    variant="secondary"
                    @click="resolveAction(action.id)"
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No requested actions.</p>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">Comments</h3>
            <div v-if="registrationDetails.comments.length" class="space-y-2">
              <div
                v-for="comment in registrationDetails.comments"
                :key="comment.id"
                class="rounded-md border p-3 text-sm space-y-1"
              >
                <p>{{ comment.comment }}</p>
                <p class="text-xs text-muted-foreground">{{ formatDate(comment.created_at) }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No comments yet.</p>
            <Textarea v-model="commentText" placeholder="Add internal comment" />
            <Button class="w-full" variant="secondary" @click="submitComment"> Add comment </Button>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">Registration info</h3>
            <div class="grid gap-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Rules accepted</span>
                <span>{{ registrationDetails.registration.rules_accepted ? 'Yes' : 'No' }}</span>
              </div>
              <div
                v-if="registrationDetails.registration.decline_reason"
                class="flex items-center justify-between"
              >
                <span class="text-muted-foreground">Decline reason</span>
                <span class="text-right">{{
                  registrationDetails.registration.decline_reason
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">IP address</span>
                <span>{{ registrationDetails.registration.ip_address || 'N/A' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">User agent</span>
                <span class="text-right text-xs text-muted-foreground">
                  {{ registrationDetails.registration.user_agent || 'N/A' }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Created</span>
              <span>{{ formatDate(registrationDetails.registration.created_at) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Updated</span>
              <span>{{ formatDate(registrationDetails.registration.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="text-sm text-muted-foreground">
          Select a registration to view details.
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
