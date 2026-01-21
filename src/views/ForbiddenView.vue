<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <h1 class="text-5xl font-bold mb-4">401 Forbidden</h1>
    <p class="text-xl text-muted-foreground">{{ t('errors.forbidden') }}</p>
  </div>
</template>
