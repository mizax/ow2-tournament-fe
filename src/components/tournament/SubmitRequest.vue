<script setup lang="ts">
import TournamentRegistrationForm from '@/components/tournament/registration/TournamentRegistrationForm.vue'
</script>

<template>
  <TournamentRegistrationForm @submit="payload => console.log(payload)"/>
</template>

<style scoped></style>
