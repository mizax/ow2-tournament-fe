import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TheHeader from '@/components/page-elements/TheHeader.vue'
import { stubWithSlot } from './testUtils'

const routeMock = vi.hoisted(() => ({ path: '/' }))
const authStoreMock = vi.hoisted(() => ({
  hasRole: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  RouterLink: {
    name: 'RouterLink',
    props: ['to', 'custom'],
    template: '<a :data-to="to"><slot :navigate="() => {}" /></a>',
  },
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authStoreMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))


const setup = () => {
  return shallowMount(TheHeader, {
    global: {
      stubs: {
        NavigationMenu: stubWithSlot('NavigationMenu'),
        NavigationMenuList: stubWithSlot('NavigationMenuList'),
        NavigationMenuItem: stubWithSlot('NavigationMenuItem'),
        NavigationMenuLink: stubWithSlot('NavigationMenuLink'),
        UserNav: stubWithSlot('UserNav'),
      },
    },
  })
}

beforeEach(() => {
  authStoreMock.hasRole.mockReset()
  routeMock.path = '/'
})

describe('TheHeader', () => {
  it('hides manager link for non-manager users', () => {
    authStoreMock.hasRole.mockReturnValue(false)

    const wrapper = setup()

    expect(wrapper.findAllComponents({ name: 'NavigationMenuItem' })).toHaveLength(1)
  })

  it('shows manager link for manager roles', () => {
    authStoreMock.hasRole.mockReturnValue(true)

    const wrapper = setup()

    expect(wrapper.findAllComponents({ name: 'NavigationMenuItem' })).toHaveLength(2)
  })
})
