import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import PrizesTab from '@/components/tournament/details/PrizesTab.vue'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))


const setup = () => {
  return shallowMount(PrizesTab, {
    props: {
      prizePool: {
        currency: 'USD',
        places: [
          { place: 1, amount: 100 },
          { place: 2, amount: 50 },
        ],
      },
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

describe('PrizesTab', () => {
  it('renders prize places and currency', () => {
    const wrapper = setup()

    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('100 USD')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('50 USD')
  })
})
