<script setup lang="ts">
const revision = import.meta.env.VITE_APP_REVISION
</script>

<template>
  <footer class="brand-footer hidden sm:block p-4 text-center w-full flex-none">
    <div
      class="grid items-center text-sm text-muted-foreground"
      :class="revision ? 'grid-cols-[1fr_auto_1fr]' : 'grid-cols-1'"
    >
      <span v-if="revision" class="justify-self-start">rev {{ revision }}</span>
      <div class="text-sm text-muted-foreground">
        Created by Mizax. All rights reserved.<br />
        All trademarks referenced herein are the properties of their respective owners.
      </div>
      <span v-if="revision" aria-hidden="true" class="justify-self-end"></span>
    </div>
  </footer>
</template>

<style scoped></style>
