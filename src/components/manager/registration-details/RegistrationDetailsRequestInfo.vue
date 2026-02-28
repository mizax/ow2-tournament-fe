<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { RegistrationDetailResponse } from '@/types/registrationManager'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  registration: RegistrationDetailResponse['registration']
  formatDate: (value?: string) => string
}>()

const { t } = useI18n()
const geoIpInfo = computed(() => props.registration.geo_ip ?? null)
const geoIpFlagUrl = computed(() => geoIpInfo.value?.flag_url?.trim() || '')
const geoIpLocation = computed(() => {
  if (!geoIpInfo.value) {
    return t('manager.common.not_available')
  }
  return [geoIpInfo.value.city, geoIpInfo.value.region, geoIpInfo.value.country_code]
    .filter((value) => value.length > 0)
    .join(', ')
})
const geoIpTimezone = computed(
  () => geoIpInfo.value?.timezone?.trim() || t('manager.common.not_available'),
)
const geoIpOrg = computed(() => geoIpInfo.value?.org?.trim() || t('manager.common.not_available'))
const isGeoIpTooltipOpen = ref(false)
const isTouchInput = useMediaQuery('(hover: none), (pointer: coarse)')
const lastTouchToggleAt = ref(0)

const toggleGeoIpTooltipOnTouch = (event: TouchEvent) => {
  if (!isTouchInput.value) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  lastTouchToggleAt.value = Date.now()
  isGeoIpTooltipOpen.value = !isGeoIpTooltipOpen.value
}

const handleGeoIpTooltipOpenChange = (value: boolean) => {
  if (isTouchInput.value && !value && Date.now() - lastTouchToggleAt.value < 350) {
    return
  }
  isGeoIpTooltipOpen.value = value
}
</script>

<template>
  <div class="space-y-3">
    <h3 class="text-base font-semibold tracking-tight">
      {{ t('manager.details.info.title') }}
    </h3>
    <div class="grid gap-2 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          {{ t('manager.details.info.rules_accepted') }}
        </span>
        <span class="text-sm font-medium">
          {{
            registration.rules_accepted
              ? t('manager.details.info.yes')
              : t('manager.details.info.no')
          }}
        </span>
      </div>
      <div v-if="registration.decline_reason" class="flex items-center justify-between">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          {{ t('manager.details.info.decline_reason') }}
        </span>
        <span class="text-right text-sm">{{ registration.decline_reason }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
          t('manager.details.info.ip_address')
        }}</span>
        <span class="inline-flex items-center gap-2 text-sm">
          {{ registration.ip_address || t('manager.common.not_available') }}
          <Tooltip
            v-if="geoIpFlagUrl"
            :open="isGeoIpTooltipOpen"
            @update:open="handleGeoIpTooltipOpenChange"
          >
            <TooltipTrigger as-child>
              <button
                type="button"
                class="inline-flex items-center"
                :aria-label="t('manager.details.info.geoip')"
                @touchstart="toggleGeoIpTooltipOnTouch"
              >
                <img
                  :src="geoIpFlagUrl"
                  :alt="geoIpInfo?.country || t('manager.details.info.geoip')"
                  class="h-3.5 w-5 rounded-sm object-cover ring-1 ring-border"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent class="w-72 space-y-2 text-xs">
              <p class="font-medium leading-none">
                {{ geoIpInfo?.country || t('manager.common.not_available') }}
              </p>
              <div class="space-y-1.5">
                <p class="flex items-start justify-between gap-3">
                  <span class="text-muted-foreground">{{
                    t('manager.details.info.location')
                  }}</span>
                  <span class="text-right break-words">{{ geoIpLocation }}</span>
                </p>
                <p class="flex items-start justify-between gap-3">
                  <span class="text-muted-foreground">{{
                    t('manager.details.info.timezone')
                  }}</span>
                  <span class="text-right break-words">{{ geoIpTimezone }}</span>
                </p>
                <p class="flex items-start justify-between gap-3">
                  <span class="text-muted-foreground">{{
                    t('manager.details.info.provider')
                  }}</span>
                  <span class="text-right break-words">{{ geoIpOrg }}</span>
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
          t('manager.details.info.user_agent')
        }}</span>
        <span class="text-right text-xs leading-5 text-muted-foreground">
          {{ registration.user_agent || t('manager.common.not_available') }}
        </span>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {{ t('manager.details.summary.created') }}
      </span>
      <span class="text-sm">{{ formatDate(registration.created_at) }}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {{ t('manager.details.summary.updated') }}
      </span>
      <span class="text-sm">{{ formatDate(registration.updated_at) }}</span>
    </div>
  </div>
</template>
