<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'

</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TheHeader />

    <main class="grow flex flex-col">
      <div class="container mx-auto p-4 flex flex-col items-center grow">
        <slot />
      </div>
    </main>

    <TheFooter />
  </div>
</template>

<style scoped></style>
