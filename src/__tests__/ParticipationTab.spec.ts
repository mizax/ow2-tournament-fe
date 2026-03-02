import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ParticipationTab from '@/components/tournament/details/ParticipationTab.vue'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('date-fns', () => ({
  format: () => 'formatted-date',
}))


const setup = (props: Record<string, unknown>) => {
  return shallowMount(ParticipationTab, {
    props,
    global: {
      stubs: {
        Card: stubWithSlot('Card'),
        CardHeader: stubWithSlot('CardHeader'),
        CardTitle: stubWithSlot('CardTitle'),
        CardContent: stubWithSlot('CardContent'),
        Table: stubWithSlot('Table'),
        TableBody: stubWithSlot('TableBody'),
        TableRow: stubWithSlot('TableRow'),
        TableCell: stubWithSlot('TableCell'),
        Alert: stubWithSlot('Alert'),
        AlertTitle: stubWithSlot('AlertTitle'),
        AlertDescription: stubWithSlot('AlertDescription'),
        Badge: stubWithSlot('Badge'),
        Copyable: stubWithSlot('Copyable'),
      },
    },
  })
}

describe('ParticipationTab', () => {
  it('renders eligibility fields and subscription', () => {
    const wrapper = setup({
      eligibility: {
        min_rank: 'Gold',
        min_competitive_hours: 50,
        verification_battletag: 'Player#1234',
        subscription: {
          twitch_channel: 'streamer',
          donation_amount_rub: 100,
          donation_url: 'https://donate.example',
        },
      },
    })

    expect(wrapper.text()).toContain('Gold')
    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('Player#1234')
    expect(wrapper.text()).toContain('streamer')
    expect(wrapper.text()).toContain('100 RUB')
  })

  it('renders registration fields and checkin', () => {
    const wrapper = setup({
      registration: {
        start: '2024-01-01T00:00:00Z',
        deadline: '2024-01-02T00:00:00Z',
        checkin: {
          from: '2024-01-01T10:00:00+03:00',
          to: '2024-01-01T11:00:00+03:00',
          platform: 'Discord',
          platform_url: 'https://discord.com',
        },
      },
    })

    expect(wrapper.text()).toContain('formatted-date')
    expect(wrapper.text()).toContain('Discord')
  })
})
