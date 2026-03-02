import { describe, expect, it, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import TournamentDetailsView from '@/views/tournament/TournamentDetailsView.vue'
import type { TournamentDetails } from '@/stores/tournamentStore'
import { stubWithSlot } from './testUtils'

const routeMock = vi.hoisted(() => ({ params: {} as Record<string, unknown>, query: {} as Record<string, unknown> }))
const routerMock = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  useRouter: () => routerMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

let tournamentStoreMock: {
  tournaments: Record<string, TournamentDetails>
  fetchTournament: ReturnType<typeof vi.fn>
}

vi.mock('@/stores/tournamentStore', () => ({
  useTournamentStore: () => tournamentStoreMock,
}))

const TabsStub = {
  name: 'Tabs',
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<div><slot /></div>',
}


const setup = () => {
  return shallowMount(TournamentDetailsView, {
    global: {
      stubs: {
        Tabs: TabsStub,
        TabsList: stubWithSlot('TabsList'),
        TabsTrigger: stubWithSlot('TabsTrigger'),
        TabsContent: stubWithSlot('TabsContent'),
        TournamentHero: stubWithSlot('TournamentHero'),
        OverviewTab: stubWithSlot('OverviewTab'),
        ParticipationTab: stubWithSlot('ParticipationTab'),
        PlayersTab: stubWithSlot('PlayersTab'),
        ScheduleTab: stubWithSlot('ScheduleTab'),
        RulesTab: stubWithSlot('RulesTab'),
        PrizesTab: stubWithSlot('PrizesTab'),
        StreamTab: stubWithSlot('StreamTab'),
      },
    },
  })
}

const createTournament = (): TournamentDetails => ({
  id: 'ow2',
  numeric_id: 1,
  title: 'OW2 Cup',
  discipline: 'ow2',
  format: '5v5',
  type: 'open',
  schedule: [],
  prize_pool: { currency: 'USD', places: [] },
})

beforeEach(() => {
  routeMock.params = {}
  routeMock.query = {}
  routerMock.replace.mockReset()
  tournamentStoreMock = {
    tournaments: reactive({}),
    fetchTournament: vi.fn().mockResolvedValue({ success: true }),
  }
})

describe('TournamentDetailsView', () => {
  it('shows error when tournamentSef missing', async () => {
    const wrapper = setup()

    await nextTick()

    expect(wrapper.text()).toContain('tournament.error.loading')
  })

  it('fetches tournament when not cached', async () => {
    routeMock.params = { tournamentSef: 'ow2' }
    tournamentStoreMock.fetchTournament = vi.fn().mockImplementation(async () => {
      tournamentStoreMock.tournaments['ow2'] = createTournament()
      return { success: true }
    })

    const wrapper = setup()

    await flushPromises()
    await nextTick()

    expect(tournamentStoreMock.fetchTournament).toHaveBeenCalledWith('ow2')
    expect(wrapper.text()).toContain('tournament.tabs.overview')
  })

  it('updates tab query via router.replace', async () => {
    routeMock.params = { tournamentSef: 'ow2' }
    routeMock.query = { tab: 'invalid', foo: '1' }
    tournamentStoreMock.tournaments['ow2'] = createTournament()

    const wrapper = setup()

    await nextTick()

    const tabs = wrapper.findComponent(TabsStub)
    tabs.vm.$emit('update:modelValue', 'rules')

    expect(routerMock.replace).toHaveBeenCalledWith({
      query: { foo: '1', tab: 'rules' },
    })
  })
})
