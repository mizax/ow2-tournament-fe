<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'
import UserNav from '@/components/page-elements/UserNav.vue'
import { useAuthStore } from '@/stores/authStore'
import UserRole from '@/types/UserRole'
import { computed } from 'vue'

const authStore = useAuthStore()
const managerRoles = [UserRole.ADMIN, UserRole.TOURNAMENT_MANAGER]
const showManagerLink = computed(() => managerRoles.some((role) => authStore.hasRole(role)))
</script>

<template>
  <header class="border-b w-full flex-none">
    <div class="container flex w-full justify-between align-middle mx-auto">
      <NavigationMenu class="p-4 max-w-none justify-start w-full" :viewport="false">
        <NavigationMenuList>
          <NavigationMenuItem>
            <RouterLink to="/" class="h-8" v-slot="{ navigate }" custom>
              <img
                src="../../assets/img/ow2t-logo-sm.png"
                alt="OW2T Logo"
                class="cursor-pointer"
                @click.prevent="navigate()"
              />
            </RouterLink>
          </NavigationMenuItem>
          <NavigationMenuItem v-if="showManagerLink">
            <NavigationMenuLink as-child>
              <Button class="cursor-pointer" :as="RouterLink" variant="ghost" to="/manager">
                Manager
              </Button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <UserNav class="m-4" />
    </div>
  </header>
</template>

<style scoped></style>
