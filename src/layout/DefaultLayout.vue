<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'

</script>

<template>
  <TheHeader />

  <main class="container mx-auto p-4 mt-16 mb-16 flex flex-col items-center">
    <slot />
  </main>

  <TheFooter />
</template>

<style scoped></style>
