<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import UserNav from '@/components/UserNav.vue'

const { t } = useI18n()
</script>

<template>
  <header class="border-b w-full flex-none">
    <div class="container flex w-full justify-between align-middle mx-auto">
      <NavigationMenu class="p-4 max-w-none justify-start w-full" :viewport="false">
        <NavigationMenuList>
          <NavigationMenuItem>
            <RouterLink to="/" class="h-8" v-slot="{ navigate }" custom>
              <img
                src="@/assets/img/ow2t-logo-sm.png"
                alt="OW2T Logo"
                class="cursor-pointer"
                @click.prevent="navigate()"
              />
            </RouterLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink as-child>
              <Button class="cursor-pointer" :as="RouterLink" variant="link" to="/full-regulation">
                {{ t('nav.past_tournaments') }}
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
