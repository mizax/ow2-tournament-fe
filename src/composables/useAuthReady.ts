import { inject, ref, type Ref } from 'vue'

export const authReadyKey = Symbol('authReady')

export function useAuthReady(): Ref<boolean> {
  return inject<Ref<boolean>>(authReadyKey, ref(true))
}
