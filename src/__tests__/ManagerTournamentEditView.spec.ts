import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ManagerTournamentEditView from '@/views/ManagerTournamentEditView.vue'
import { fetchManagedTournament, updateManagedTournament } from '@/services/tournamentManagerApi'

const toastError = vi.hoisted(() => vi.fn())
const toastSuccess = vi.hoisted(() => vi.fn())

let routeMock: { params: Record<string, unknown> }
let routerMock: { push: ReturnType<typeof vi.fn> }

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  useRouter: () => routerMock,
}))

vi.mock('vue-sonner', () => ({
  toast: {
    error: toastError,
    success: toastSuccess,
  },
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => `t:${key}`,
  }),
}))

vi.mock('@/services/tournamentManagerApi', () => ({
  fetchManagedTournament: vi.fn(),
  updateManagedTournament: vi.fn(),
}))

vi.mock('@/components/manager/tournament-edit/TournamentEditForm.vue', () => ({
  default: {
    name: 'TournamentEditForm',
    props: ['onSubmit'],
    template:
      '<div data-testid="edit-form"><button type="button" data-testid="submit-edit" @click="onSubmit({ title: \'Тест\', sef_title: \'test\', discipline: \'OW2\', format: \'Online\', type: \'Online\', schedule: [{ day: 1, date: \'2026-02-21\', stage: \'Group\', start_time: \'16:00\' }], prize_pool: {} })">submit</button></div>',
  },
}))

const fetchManagedTournamentMock = vi.mocked(fetchManagedTournament)
const updateManagedTournamentMock = vi.mocked(updateManagedTournament)

const mockTournament = {
  id: 42,
  title: 'Mock Cup',
  sef_title: 'mock-cup',
  discipline: 'OW2',
  format: 'Online',
  type: 'Online',
  schedule: [{ day: 1, date: '2026-02-21', stage: 'Group', start_time: '16:00' }],
  prize_pool: {},
}

const setup = () =>
  mount(ManagerTournamentEditView, {
    global: {
      stubs: {
        Spinner: { template: '<div />' },
      },
    },
  })

beforeEach(() => {
  routeMock = { params: { tournamentId: '42' } }
  routerMock = { push: vi.fn() }
  fetchManagedTournamentMock.mockReset()
  updateManagedTournamentMock.mockReset()
  toastError.mockReset()
  toastSuccess.mockReset()
})

describe('ManagerTournamentEditView', () => {
  it('shows spinner while loading', () => {
    fetchManagedTournamentMock.mockImplementation(() => new Promise(() => {}))

    const wrapper = setup()

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="edit-form"]').exists()).toBe(false)
  })

  it('shows form after successful load', async () => {
    fetchManagedTournamentMock.mockResolvedValueOnce({ success: true, data: mockTournament })

    const wrapper = setup()
    await flushPromises()

    expect(wrapper.find('[data-testid="edit-form"]').exists()).toBe(true)
  })

  it('shows error state with retry button on load failure', async () => {
    fetchManagedTournamentMock.mockResolvedValueOnce({ success: false })

    const wrapper = setup()
    await flushPromises()

    expect(wrapper.find('[data-testid="edit-form"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('t:manager.tournament_edit.view.load_failed_title')
    expect(wrapper.text()).toContain('t:manager.tournament_edit.view.retry')
  })

  it('retry button re-fetches the tournament', async () => {
    fetchManagedTournamentMock
      .mockResolvedValueOnce({ success: false })
      .mockResolvedValueOnce({ success: true, data: mockTournament })

    const wrapper = setup()
    await flushPromises()

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(fetchManagedTournamentMock).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[data-testid="edit-form"]').exists()).toBe(true)
  })

  it('shows sef_title_taken toast on submit conflict', async () => {
    fetchManagedTournamentMock.mockResolvedValueOnce({ success: true, data: mockTournament })
    updateManagedTournamentMock.mockResolvedValueOnce({
      success: false,
      errorData: { error: 'sef_title_taken' },
    })

    const wrapper = setup()
    await flushPromises()

    await wrapper.find('[data-testid="submit-edit"]').trigger('click')
    await flushPromises()

    expect(toastError).toHaveBeenCalledWith('t:manager.tournament_edit.view.toasts.sef_title_taken')
  })

  it('stays on edit page on success', async () => {
    fetchManagedTournamentMock.mockResolvedValueOnce({ success: true, data: mockTournament })
    updateManagedTournamentMock.mockResolvedValueOnce({ success: true, data: mockTournament })

    const wrapper = setup()
    await flushPromises()

    await wrapper.find('[data-testid="submit-edit"]').trigger('click')
    await flushPromises()

    expect(toastSuccess).toHaveBeenCalledWith('t:manager.tournament_edit.view.toasts.updated')
    expect(routerMock.push).not.toHaveBeenCalled()
  })
})
