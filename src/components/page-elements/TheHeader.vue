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
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthReady } from '@/composables/useAuthReady'

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
const authReady = useAuthReady()
const { t } = useI18n()
const route = useRoute()
const managerRoles = [UserRole.ADMIN, UserRole.TOURNAMENT_MANAGER]
const showManagerLink = computed(() => managerRoles.some((role) => authStore.hasRole(role)))
const isManagerActive = computed(() => route.path.startsWith('/manager'))
</script>

<template>
  <header class="border-b w-full flex-none">
    <div class="container flex w-full items-center justify-between mx-auto px-4 py-3 sm:px-0 sm:py-0">
      <div class="flex items-center gap-4">
        <RouterLink to="/" class="h-8 flex items-center" v-slot="{ navigate }" custom>
          <img
            src="../../assets/img/ow2t-logo-sm.png"
            alt="OW2T Logo"
            class="h-8 w-auto object-contain cursor-pointer"
            @click.prevent="navigate()"
          />
        </RouterLink>

        <NavigationMenu class="hidden sm:flex p-4 max-w-none justify-start w-full" :viewport="false">
          <NavigationMenuList class="flex items-center gap-6">
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
      </div>

      <div class="hidden sm:block">
        <UserNav class="m-4" />
      </div>

      <div v-if="authReady" class="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="icon" aria-label="Menu">
              <Menu class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem v-if="user?.battletag" class="text-xs text-muted-foreground">
              {{ user.battletag }}
            </DropdownMenuItem>
            <DropdownMenuItem v-if="showManagerLink" as-child>
              <RouterLink to="/manager">
                {{ t('nav.manager') }}
              </RouterLink>
            </DropdownMenuItem>
            <DropdownMenuItem v-if="isAuthenticated" @click="authStore.logout()">
              {{ t('nav.logout') }}
            </DropdownMenuItem>
            <DropdownMenuItem v-else @click="authStore.authorize()">
              {{ t('nav.login') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>

<style scoped></style>
