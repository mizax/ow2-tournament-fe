<script setup lang="ts">

import { useRoute } from 'vue-router'

const route = useRoute()
const { tournamentSef } = route.params
console.log(tournamentSef)
</script>

<template>
  DETAILS
  <RouterLink :to="`${tournamentSef}/regulation`">REGULATION</RouterLink>
</template>

<style scoped></style>
