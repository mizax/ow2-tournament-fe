import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import PlayersTab from '@/components/tournament/details/PlayersTab.vue'
import { fetchWithoutAuth } from '@/services/apiService'
import { RoleValue } from '@/components/tournament/registration/types'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, vars?: Record<string, unknown>) => {
      if (key === 'tournament.players.count' && vars) {
        return `${vars.shown}/${vars.total}`
      }
      return key
    },
  }),
}))

vi.mock('@/services/apiService', () => ({
  fetchWithoutAuth: vi.fn(),
}))

const fetchWithoutAuthMock = vi.mocked(fetchWithoutAuth)

const InputStub = {
  name: 'Input',
  props: ['modelValue'],
  template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}


const setup = () => {
  return shallowMount(PlayersTab, {
    props: { tournamentSef: 'ow2' },
    global: {
      stubs: {
        Card: stubWithSlot('Card'),
        CardHeader: stubWithSlot('CardHeader'),
        CardTitle: stubWithSlot('CardTitle'),
        CardContent: stubWithSlot('CardContent'),
        Label: stubWithSlot('Label'),
        Spinner: stubWithSlot('Spinner'),
        Input: InputStub,
      },
    },
  })
}

beforeEach(() => {
  fetchWithoutAuthMock.mockReset()
})

describe('PlayersTab', () => {
  it('loads registrations and displays count', async () => {
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: true,
      data: [
        { battletag: 'Alpha#1', primary_role: RoleValue.TANK },
        { battletag: 'Bravo#2', primary_role: RoleValue.DAMAGE },
      ],
    })

    const wrapper = setup()
    await flushPromises()
    await nextTick()

    expect(fetchWithoutAuthMock).toHaveBeenCalledWith(
      '/api/public/v1/tournaments/ow2/registrations',
    )
    expect(wrapper.text()).toContain('2/2')
    expect(wrapper.text()).toContain('Alpha#1')
    expect(wrapper.text()).toContain('Bravo#2')
  })

  it('filters registrations by search query', async () => {
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: true,
      data: [
        { battletag: 'Alpha#1', primary_role: RoleValue.TANK },
        { battletag: 'Bravo#2', primary_role: RoleValue.DAMAGE },
      ],
    })

    const wrapper = setup()
    await flushPromises()
    await nextTick()

    await wrapper.find('input').setValue('bravo')
    await nextTick()

    expect(wrapper.text()).toContain('1/2')
    expect(wrapper.text()).toContain('Bravo#2')
    expect(wrapper.text()).not.toContain('Alpha#1')
  })

  it('shows error when api fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: false,
      errorCode: 'server_error',
    })

    const wrapper = setup()
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('tournament.players.load_error')
    consoleErrorSpy.mockRestore()
  })

  it('shows empty search state when no results match', async () => {
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: true,
      data: [{ battletag: 'Alpha#1', primary_role: RoleValue.TANK }],
    })

    const wrapper = setup()
    await flushPromises()
    await nextTick()

    await wrapper.find('input').setValue('zzz')
    await nextTick()

    expect(wrapper.text()).toContain('tournament.players.empty_search')
  })
})
