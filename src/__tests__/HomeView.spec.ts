import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import HomeView from '@/views/HomeView.vue'
import { fetchWithoutAuth } from '@/services/apiService'
import type { Tournament } from '@/types/tournament'
import { stubWithSlot } from './testUtils'
import { Empty } from '@/components/ui/empty'

vi.mock('@/services/apiService', () => ({
  fetchWithoutAuth: vi.fn(),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const fetchWithoutAuthMock = vi.mocked(fetchWithoutAuth)


const setup = () => {
  return shallowMount(HomeView, {
    global: {
      stubs: {
        TournamentCard: stubWithSlot('TournamentCard'),
      },
    },
  })
}

const tournaments: Tournament[] = [
  {
    title: 'OW2 Cup',
    uri: 'ow2',
    discipline: 'ow2',
    format: '5v5',
    dates: ['2024-01-01', '2024-01-02'],
    prize_pool: '1000',
    registration_count: 10,
  },
]

beforeEach(() => {
  fetchWithoutAuthMock.mockReset()
})

describe('HomeView', () => {
  it('shows empty state when no tournaments', async () => {
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: true,
      data: [],
    })

    const wrapper = setup()
    await flushPromises()
    await nextTick()

    expect(wrapper.findComponent(Empty).exists()).toBe(true)
  })

  it('renders tournament cards when data present', async () => {
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: true,
      data: tournaments,
    })

    const wrapper = setup()
    await flushPromises()
    await nextTick()

    expect(wrapper.findAllComponents({ name: 'TournamentCard' })).toHaveLength(1)
  })
})
