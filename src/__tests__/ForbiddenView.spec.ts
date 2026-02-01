import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ForbiddenView from '@/views/ForbiddenView.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('ForbiddenView', () => {
  it('renders forbidden message', () => {
    const wrapper = shallowMount(ForbiddenView)

    expect(wrapper.text()).toContain('errors.forbidden')
  })
})
