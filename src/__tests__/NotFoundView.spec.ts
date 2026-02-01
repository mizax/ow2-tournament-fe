import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import NotFoundView from '@/views/NotFoundView.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('NotFoundView', () => {
  it('renders not found message', () => {
    const wrapper = shallowMount(NotFoundView)

    expect(wrapper.text()).toContain('errors.not_found')
  })
})
