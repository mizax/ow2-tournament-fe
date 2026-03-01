<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { fetchAdminUsers, grantAuthority, revokeAuthority, type AdminUser } from '@/services/adminApi'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const AUTHORITY_CREATE_TOURNAMENT = 'create_tournament'

const { t } = useI18n()

const loading = ref(false)
const users = ref<AdminUser[]>([])
const search = ref('')
const mutationInProgressByUserId = ref<Record<number, boolean>>({})
let searchTimer: ReturnType<typeof setTimeout> | null = null

const isMutating = (userId: number) => mutationInProgressByUserId.value[userId] === true

const loadUsers = async () => {
  loading.value = true
  const response = await fetchAdminUsers(search.value, 100, 0)
  loading.value = false

  if (!response.success || !response.data) {
    toast.error(t('admin.users.load_error'))
    return
  }

  users.value = response.data
}

const hasCreateTournamentAuthority = (user: AdminUser) =>
  user.authorities.includes(AUTHORITY_CREATE_TOURNAMENT)

const toggleCreateTournamentAuthority = async (user: AdminUser) => {
  const userId = user.id
  mutationInProgressByUserId.value = {
    ...mutationInProgressByUserId.value,
    [userId]: true,
  }

  const response = hasCreateTournamentAuthority(user)
    ? await revokeAuthority(user.id, AUTHORITY_CREATE_TOURNAMENT)
    : await grantAuthority(user.id, AUTHORITY_CREATE_TOURNAMENT)

  mutationInProgressByUserId.value = {
    ...mutationInProgressByUserId.value,
    [userId]: false,
  }

  if (!response.success) {
    toast.error(t('admin.users.mutation_error'))
    return
  }

  if (hasCreateTournamentAuthority(user)) {
    user.authorities = user.authorities.filter((value) => value !== AUTHORITY_CREATE_TOURNAMENT)
    toast.success(t('admin.users.authority_revoked'))
    return
  }

  user.authorities = [...new Set([...user.authorities, AUTHORITY_CREATE_TOURNAMENT])]
  toast.success(t('admin.users.authority_granted'))
}

watch(
  () => search.value,
  () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    searchTimer = setTimeout(() => {
      void loadUsers()
    }, 300)
  },
)

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="page-shell">
    <section class="page-head">
      <p class="page-kicker">{{ t('admin.users.kicker') }}</p>
      <h1 class="page-title mt-2">{{ t('admin.users.title') }}</h1>
      <p class="mt-3 text-sm text-muted-foreground">{{ t('admin.users.subtitle') }}</p>
    </section>

    <Card class="border-border/70 bg-card/75">
      <CardHeader class="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle class="text-base">{{ t('admin.users.search_title') }}</CardTitle>
        <Input
          v-model="search"
          class="sm:max-w-xs"
          :placeholder="t('admin.users.search_placeholder')"
        />
      </CardHeader>
      <CardContent>
        <div
          v-if="loading"
          class="flex items-center justify-center gap-2 py-12 text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Spinner class="animate-spin" />
          <span>{{ t('admin.users.loading') }}</span>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('admin.users.columns.battletag') }}</TableHead>
              <TableHead>{{ t('admin.users.columns.flags') }}</TableHead>
              <TableHead>{{ t('admin.users.columns.authorities') }}</TableHead>
              <TableHead class="text-right">{{ t('admin.users.columns.actions') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell>
                <div class="font-medium">{{ user.battletag || `User #${user.id}` }}</div>
                <div class="text-xs text-muted-foreground">ID: {{ user.id }}</div>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-2">
                  <Badge v-if="user.is_admin" variant="default">{{ t('admin.users.flags.admin') }}</Badge>
                  <Badge v-if="user.is_banned" variant="destructive">{{ t('admin.users.flags.banned') }}</Badge>
                  <Badge v-if="!user.is_admin && !user.is_banned" variant="secondary">
                    {{ t('admin.users.flags.user') }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div v-if="user.authorities.length" class="flex flex-wrap gap-2">
                  <Badge
                    v-for="authority in user.authorities"
                    :key="`${user.id}-${authority}`"
                    variant="outline"
                  >
                    {{ authority }}
                  </Badge>
                </div>
                <span v-else class="text-xs text-muted-foreground">
                  {{ t('admin.users.no_authorities') }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  size="sm"
                  :variant="hasCreateTournamentAuthority(user) ? 'outline' : 'default'"
                  :disabled="isMutating(user.id)"
                  @click="toggleCreateTournamentAuthority(user)"
                >
                  {{
                    hasCreateTournamentAuthority(user)
                      ? t('admin.users.actions.revoke_create_tournament')
                      : t('admin.users.actions.grant_create_tournament')
                  }}
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!users.length">
              <TableCell colspan="4" class="py-8 text-center text-muted-foreground">
                {{ t('admin.users.empty') }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
