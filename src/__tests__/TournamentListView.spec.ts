import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TournamentListView from '@/views/tournament/TournamentListView.vue'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))


describe('TournamentListView', () => {
  it('renders empty state copy', () => {
    const wrapper = shallowMount(TournamentListView, {
      global: {
        stubs: {
          Empty: stubWithSlot('Empty'),
          EmptyHeader: stubWithSlot('EmptyHeader'),
          EmptyMedia: stubWithSlot('EmptyMedia'),
          EmptyTitle: stubWithSlot('EmptyTitle'),
          EmptyDescription: stubWithSlot('EmptyDescription'),
          Trophy: { template: '<span />' },
        },
      },
    })

    expect(wrapper.text()).toContain('tournament.list.title')
    expect(wrapper.text()).toContain('tournament.list.empty_title')
    expect(wrapper.text()).toContain('tournament.list.empty_description')
  })
})
