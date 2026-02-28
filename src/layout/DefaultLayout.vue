<script setup lang="ts">
import TheHeader from '@/components/page-elements/TheHeader.vue'
import TheFooter from '@/components/page-elements/TheFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <TheHeader />

    <main class="grow flex flex-col">
      <div class="container mx-auto w-full px-4 py-6 md:px-6 md:py-8 flex flex-col grow">
        <slot />
      </div>
    </main>

    <TheFooter />
  </div>
</template>

<style scoped></style>
