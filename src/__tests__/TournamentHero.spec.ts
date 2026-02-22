import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TournamentHero from '@/components/tournament/details/TournamentHero.vue'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const setup = (registrationStart?: string) => {
  return shallowMount(TournamentHero, {
    props: {
      tournament: {
        id: 'ow2',
        title: 'OW2 Cup',
        discipline: 'ow2',
        format: '5v5',
        schedule: [{ date: '2024-01-01' }, { date: '2024-01-02' }],
        prize_pool: { currency: 'USD', places: [{ amount: 100 }, { amount: 50 }] },
        registration: registrationStart ? { start: registrationStart } : undefined,
      },
    },
    global: {
      stubs: {
        Card: stubWithSlot('Card'),
        CardHeader: stubWithSlot('CardHeader'),
        CardTitle: stubWithSlot('CardTitle'),
        CardContent: stubWithSlot('CardContent'),
        RegistrationSmartButton: { name: 'RegistrationSmartButton', template: '<button />' },
      },
    },
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TournamentHero', () => {
  it('shows registration opens message when start is in future', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))

    const wrapper = setup('2024-01-02T00:00:00Z')

    expect(wrapper.text()).toContain('tournament.hero.registration_opens_in')
    expect(wrapper.findComponent({ name: 'RegistrationSmartButton' }).exists()).toBe(false)
  })

  it('shows registration button when start is in past', () => {
    vi.setSystemTime(new Date('2024-01-02T00:00:00Z'))

    const wrapper = setup('2024-01-01T00:00:00Z')

    expect(wrapper.findComponent({ name: 'RegistrationSmartButton' }).exists()).toBe(true)
  })

  it('shows registration button when start is not provided', () => {
    vi.setSystemTime(new Date('2023-12-31T00:00:00Z'))

    const wrapper = setup()

    expect(wrapper.findComponent({ name: 'RegistrationSmartButton' }).exists()).toBe(true)
  })
})
