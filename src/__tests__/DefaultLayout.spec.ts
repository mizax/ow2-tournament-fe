import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import { stubWithSlot } from './testUtils'


describe('DefaultLayout', () => {
  it('renders header, footer, and slot content', () => {
    const wrapper = shallowMount(DefaultLayout, {
      slots: {
        default: '<div class="content">Hello</div>',
      },
      global: {
        stubs: {
          TheHeader: stubWithSlot('TheHeader'),
          TheFooter: stubWithSlot('TheFooter'),
        },
      },
    })

    expect(wrapper.findComponent({ name: 'TheHeader' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'TheFooter' }).exists()).toBe(true)
    expect(wrapper.find('.content').exists()).toBe(true)
  })
})
