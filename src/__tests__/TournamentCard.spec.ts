import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TournamentCard from '@/components/tournament/TournamentCard.vue'
import type { Tournament } from '@/types/tournament'
import { stubWithSlot } from './testUtils'

const formatMock = vi.hoisted(() => vi.fn(() => '01.01.2024'))

vi.mock('date-fns', () => ({
  format: formatMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))


const setup = (tournament: Tournament) => {
  return shallowMount(TournamentCard, {
    props: { tournament },
    global: {
      stubs: {
        Card: stubWithSlot('Card'),
        CardHeader: stubWithSlot('CardHeader'),
        CardTitle: stubWithSlot('CardTitle'),
        CardContent: stubWithSlot('CardContent'),
        Button: stubWithSlot('Button'),
        RouterLink: { template: '<a />' },
      },
    },
  })
}

describe('TournamentCard', () => {
  it('renders title and registration count chip when count > 0', () => {
    const wrapper = setup({
      title: 'OW2 Cup',
      uri: 'ow2',
      discipline: 'ow2',
      format: '5v5',
      dates: ['2024-01-01', '2024-01-02'],
      registration_count: 12,
      prize_pool: '1000',
    })

    expect(wrapper.text()).toContain('OW2 Cup')
    expect(wrapper.text()).toContain('tournament_card.registrations')
  })

  it('hides registration chip when count is zero', () => {
    const wrapper = setup({
      title: 'OW2 Cup',
      uri: 'ow2',
      discipline: 'ow2',
      format: '5v5',
      dates: ['2024-01-01', '2024-01-02'],
      registration_count: 0,
      prize_pool: '1000',
    })

    expect(wrapper.text()).not.toContain('tournament_card.registrations')
  })
})
