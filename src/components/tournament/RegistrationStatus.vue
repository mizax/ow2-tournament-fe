<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()

const registrationId = computed(() => route.params.registrationId)
</script>

<template>
  <div class="container mx-auto py-12">
    <div class="rounded-xl border border-border bg-card p-6 text-center">
      <h2 class="text-xl font-semibold mb-3">
        {{ t('tournament.registration_status.title') }}
      </h2>
      <p class="text-muted-foreground">
        {{ t('tournament.registration_status.message', { id: registrationId }) }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
