import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import StreamTab from '@/components/tournament/details/StreamTab.vue'
import { stubWithSlot } from './testUtils'

const fetchWithoutAuthMock = vi.fn()

vi.mock('@/services/apiService', () => ({
  fetchWithoutAuth: (...args: unknown[]) => fetchWithoutAuthMock(...args),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))


const ButtonStub = {
  name: 'Button',
  props: ['as', 'href'],
  template: '<a :href="href"><slot /></a>',
}

const setup = (stream?: { platform?: string; channel?: string }) => {
  fetchWithoutAuthMock.mockResolvedValue({
    success: true,
    data: [],
  })

  return shallowMount(StreamTab, {
    props: {
      stream,
      tournamentSef: 'test-tournament',
    },
    global: {
      stubs: {
        Card: stubWithSlot('Card'),
        CardHeader: stubWithSlot('CardHeader'),
        CardTitle: stubWithSlot('CardTitle'),
        CardContent: stubWithSlot('CardContent'),
        Button: ButtonStub,
        Tv: { template: '<span />' },
      },
    },
  })
}

describe('StreamTab', () => {
  it('renders twitch button when channel present', () => {
    const wrapper = setup({ channel: 'ow2' })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://twitch.tv/ow2')
  })

  it('renders empty state when no channel', () => {
    const wrapper = setup()

    expect(wrapper.find('a').exists()).toBe(false)
  })
})
