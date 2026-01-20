<script setup lang="ts">
import { NavigationMenu } from '@/components/ui/navigation-menu'
</script>

<template>
  <NavigationMenu class="p-4 max-w-none justify-start w-full" :viewport="true">
    <NavigationMenuList class="flex gap-2">
      <NavigationMenuItem>
        <NavigationMenuLink as-child>
          <RouterLink to="/">Home</RouterLink>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem class="self-end">
        <NavigationMenuLink as-child>
          <RouterLink to="/full-regulation">Regulation</RouterLink>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>

<style scoped></style>
