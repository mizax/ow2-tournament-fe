import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import OverviewTab from '@/components/tournament/details/OverviewTab.vue'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))


const VueMarkdownStub = {
  name: 'VueMarkdown',
  props: ['markdown'],
  template: '<div class="markdown">{{ markdown }}</div>',
}

const setup = (props: { description: string; organizers: Array<{ role: string; name: string; contact?: string }> }) => {
  return shallowMount(OverviewTab, {
    props,
    global: {
      stubs: {
        Card: stubWithSlot('Card'),
        CardHeader: stubWithSlot('CardHeader'),
        CardTitle: stubWithSlot('CardTitle'),
        CardContent: stubWithSlot('CardContent'),
        Separator: stubWithSlot('Separator'),
        VueMarkdown: VueMarkdownStub,
      },
    },
  })
}

describe('OverviewTab', () => {
  it('renders description markdown when provided', () => {
    const wrapper = setup({
      description: 'Hello **world**',
      organizers: [],
    })

    expect(wrapper.find('.markdown').text()).toContain('Hello **world**')
  })

  it('renders organizers list with contact', () => {
    const wrapper = setup({
      description: '',
      organizers: [
        { role: 'Admin', name: 'Alice', contact: 'mailto:alice@example.com' },
      ],
    })

    expect(wrapper.text()).toContain('Admin: Alice')
    expect(wrapper.text()).toContain('mailto:alice@example.com')
  })
})
