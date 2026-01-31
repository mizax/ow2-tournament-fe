<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { RouterLink } from 'vue-router'
import UserNav from '@/components/page-elements/UserNav.vue'
import { useAuthStore } from '@/stores/authStore'
import UserRole from '@/types/UserRole'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const { t } = useI18n()
const route = useRoute()
const managerRoles = [UserRole.ADMIN, UserRole.TOURNAMENT_MANAGER]
const showManagerLink = computed(() => managerRoles.some((role) => authStore.hasRole(role)))
const isManagerActive = computed(() => route.path.startsWith('/manager'))
</script>

<template>
  <header class="border-b w-full flex-none">
    <div class="container flex w-full items-center justify-between mx-auto">
      <NavigationMenu class="p-4 max-w-none justify-start w-full" :viewport="false">
        <NavigationMenuList class="flex items-center gap-6">
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
              <RouterLink to="/manager" v-slot="{ navigate }" custom>
                <button
                  class="cursor-pointer border-b-2 border-transparent pb-1 text-sm font-semibold uppercase tracking-wide transition hover:border-white/30 hover:text-foreground"
                  :class="isManagerActive ? 'border-white/50 text-foreground' : 'text-muted-foreground'"
                  @click.prevent="navigate()"
                >
                  {{ t('nav.manager') }}
                </button>
              </RouterLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <UserNav class="m-4" />
    </div>
  </header>
</template>

<style scoped></style>
