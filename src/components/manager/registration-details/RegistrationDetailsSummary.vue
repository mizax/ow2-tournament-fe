<script setup lang="ts">
import type { RegistrationDetailResponse } from '@/types/registrationManager'
import type { RoleValue } from '@/components/tournament/registration/types'
import { Copyable } from '@/components/ui/copyable'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  registration: RegistrationDetailResponse['registration']
  registrationId: number | null
  roleLabel: (role?: RoleValue | null) => string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="rounded-lg bg-muted/5 ring-1 ring-white/5 p-3 space-y-3">
    <div class="grid gap-2 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
        t('manager.details.info.alt_accounts')
      }}</span>
      <div v-if="registration.alt_accounts?.length" class="flex flex-wrap justify-end gap-1">
        <Copyable
          class="chip max-w-full break-all px-2 py-0.5 text-[0.7rem]"
          v-for="account in registration.alt_accounts || []"
          :key="`alt-${registrationId}-${account}`"
          :value="account"
        >
          {{ account }}
        </Copyable>
      </div>
      <span v-else class="text-sm text-muted-foreground text-right">
        {{ t('manager.common.not_available') }}
      </span>
    </div>
    <div class="grid items-center gap-2 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
        t('manager.details.info.twitch')
      }}</span>
      <div class="flex justify-end">
        <Copyable
          class="chip max-w-full break-all px-2 py-0.5 text-[0.7rem]"
          :value="registration.twitch"
        >
          {{ registration.twitch || t('manager.common.not_available') }}
        </Copyable>
      </div>
    </div>
    <div class="grid items-center gap-2 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
        t('manager.details.info.discord')
      }}</span>
      <div class="flex justify-end">
        <Copyable
          class="chip max-w-full break-all px-2 py-0.5 text-[0.7rem]"
          :value="registration.discord"
        >
          {{ registration.discord || t('manager.common.not_available') }}
        </Copyable>
      </div>
    </div>
    <div class="grid gap-2 text-sm">
      <div class="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
          t('manager.details.summary.primary_role')
        }}</span>
        <span class="text-right text-sm font-medium">
          {{ roleLabel(registration.primary_role) }}
        </span>
      </div>
      <div class="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
          t('manager.details.summary.secondary_role')
        }}</span>
        <span class="text-right text-sm font-medium">
          {{ roleLabel(registration.secondary_role) }}
        </span>
      </div>
      <div class="grid gap-2 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
          t('manager.details.info.guarantors')
        }}</span>
        <div v-if="registration.guarantors?.length" class="flex flex-wrap justify-end gap-1">
          <Copyable
            class="chip max-w-full break-all px-2 py-0.5 text-[0.7rem]"
            v-for="guarantor in registration.guarantors || []"
            :key="`gua-${registrationId}-${guarantor}`"
            :value="guarantor"
          >
            {{ guarantor }}
          </Copyable>
        </div>
        <span v-else class="text-sm text-muted-foreground text-right">
          {{ t('manager.common.not_available') }}
        </span>
      </div>
      <div class="space-y-1">
        <p class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          {{ t('manager.details.info.additional_info') }}
        </p>
        <div class="rounded-md border p-2 text-sm leading-6 whitespace-pre-line">
          {{ registration.additional_info || t('manager.common.not_available') }}
        </div>
      </div>
    </div>
  </div>
</template>
