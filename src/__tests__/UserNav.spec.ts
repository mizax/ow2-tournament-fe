import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import UserNav from '@/components/page-elements/UserNav.vue'
import { stubWithSlot } from './testUtils'

const authState = vi.hoisted(() => ({
  isAuthenticated: { value: false, __v_isRef: true },
  user: { value: null as null | { battletag: string }, __v_isRef: true },
  authorize: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authState,
}))

vi.mock('pinia', () => ({
  storeToRefs: (store: unknown) => store,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/composables/useAuthReady', () => ({
  useAuthReady: () => ({ value: true }),
}))


const setup = () => {
  return shallowMount(UserNav, {
    global: {
      stubs: {
        Avatar: stubWithSlot('Avatar'),
        AvatarFallback: stubWithSlot('AvatarFallback'),
        Button: { template: '<button><slot /></button>' },
        DropdownMenu: stubWithSlot('DropdownMenu'),
        DropdownMenuTrigger: stubWithSlot('DropdownMenuTrigger'),
        DropdownMenuContent: stubWithSlot('DropdownMenuContent'),
        DropdownMenuItem: stubWithSlot('DropdownMenuItem'),
      },
    },
  })
}

beforeEach(() => {
  authState.isAuthenticated.value = false
  authState.user.value = null
  authState.authorize.mockReset()
  authState.logout.mockReset()
})

describe('UserNav', () => {
  it('shows login button when unauthenticated', () => {
    const wrapper = setup()

    expect(wrapper.text()).toContain('nav.login')
  })

  it('shows user info when authenticated', () => {
    authState.isAuthenticated.value = true
    authState.user.value = { battletag: 'Test#1234' }

    const wrapper = setup()

    expect(wrapper.text()).toContain('Test#1234')
    expect(wrapper.text()).toContain('TE')
  })
})
