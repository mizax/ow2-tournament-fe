<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'

import DefaultLayout from '@/layout/DefaultLayout.vue'
import AuthProvider from '@/components/providers/AuthProvider.vue'
import { TooltipProvider } from '@/components/ui/tooltip'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <Suspense>
        <AuthProvider>
          <TooltipProvider>
            <DefaultLayout>
              <component :is="Component"></component>
            </DefaultLayout>
          </TooltipProvider>
        </AuthProvider>
        <template #fallback>
          <div class="flex justify-center items-center h-screen">
            <div
              class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
            ></div>
          </div>
        </template>
      </Suspense>
    </template>
  </RouterView>
  <Toaster />
</template>

<style scoped></style>
