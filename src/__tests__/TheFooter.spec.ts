import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TheFooter from '@/components/page-elements/TheFooter.vue'

describe('TheFooter', () => {
  it('renders footer text', () => {
    const wrapper = shallowMount(TheFooter)

    expect(wrapper.text()).toContain('Created by Mizax')
    expect(wrapper.text()).toContain('All trademarks referenced herein')
  })
})
