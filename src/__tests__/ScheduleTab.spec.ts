import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ScheduleTab from '@/components/tournament/details/ScheduleTab.vue'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('date-fns', () => ({
  format: () => 'formatted-date',
}))


const setup = () => {
  return shallowMount(ScheduleTab, {
    props: {
      schedule: [
        { day: 1, date: '2024-01-01', stage: 'Group', start_time: '10:00' },
      ],
    },
    global: {
      stubs: {
        Card: stubWithSlot('Card'),
        CardHeader: stubWithSlot('CardHeader'),
        CardTitle: stubWithSlot('CardTitle'),
        CardContent: stubWithSlot('CardContent'),
        Table: stubWithSlot('Table'),
        TableHeader: stubWithSlot('TableHeader'),
        TableHead: stubWithSlot('TableHead'),
        TableBody: stubWithSlot('TableBody'),
        TableRow: stubWithSlot('TableRow'),
        TableCell: stubWithSlot('TableCell'),
      },
    },
  })
}

describe('ScheduleTab', () => {
  it('renders schedule rows', () => {
    const wrapper = setup()

    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('Group')
    expect(wrapper.text()).toContain('formatted-date')
    expect(wrapper.text()).toContain('10:00')
  })
})
