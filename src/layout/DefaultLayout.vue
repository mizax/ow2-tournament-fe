<script setup lang="ts">
import TheHeader from '@/components/page-elements/TheHeader.vue'
import TheFooter from '@/components/page-elements/TheFooter.vue'

</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <TheHeader />

    <main class="grow flex flex-col bg-background">
      <div class="container mx-auto p-4 flex flex-col items-center grow">
        <slot />
      </div>
    </main>

    <TheFooter />
  </div>
</template>

<style scoped></style>
