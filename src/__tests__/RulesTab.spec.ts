import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import RulesTab from '@/components/tournament/details/RulesTab.vue'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))


const MarkdownRendererStub = {
  name: 'MarkdownRenderer',
  props: ['markdown'],
  template: '<div class="markdown">{{ markdown }}</div>',
}

const setup = () => {
  return shallowMount(RulesTab, {
    props: {
      rules: {
        full_rules_url: 'https://rules.example',
        version: '1.0',
        last_update: '2024-01-01',
      },
      regulation: '# Rules',
    },
    global: {
      stubs: {
        Card: stubWithSlot('Card'),
        CardHeader: stubWithSlot('CardHeader'),
        CardTitle: stubWithSlot('CardTitle'),
        CardContent: stubWithSlot('CardContent'),
        MarkdownRenderer: MarkdownRendererStub,
      },
    },
  })
}

describe('RulesTab', () => {
  it('renders rules metadata and regulation', () => {
    const wrapper = setup()

    expect(wrapper.text()).toContain('1.0')
    expect(wrapper.text()).toContain('2024-01-01')
    expect(wrapper.find('.markdown').text()).toContain('# Rules')
  })
})
