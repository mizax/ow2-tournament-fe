import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import RegistrationSmartButton from '@/components/tournament/details/RegistrationSmartButton.vue'
import { fetchWithAuth } from '@/services/apiService'

const authState = vi.hoisted(() => ({
  isAuthenticated: { value: false },
}))

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authState,
}))

vi.mock('pinia', () => ({
  storeToRefs: (store: unknown) => store,
}))

vi.mock('vue-router', () => ({
  useRouter: () => routerMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/composables/useAuthReady', () => ({
  useAuthReady: () => ({ value: true }),
}))

vi.mock('@/services/apiService', () => ({
  fetchWithAuth: vi.fn(),
}))

const fetchWithAuthMock = vi.mocked(fetchWithAuth)

const ButtonStub = {
  name: 'Button',
  template: '<button @click="$emit(\'click\', $event)"><slot /></button>',
}

const SpinnerStub = {
  name: 'Spinner',
  template: '<span />',
}

const setup = () => {
  return shallowMount(RegistrationSmartButton, {
    props: { tournamentUri: 'ow2' },
    global: {
      stubs: {
        Button: ButtonStub,
        Spinner: SpinnerStub,
      },
    },
  })
}

beforeEach(() => {
  authState.isAuthenticated.value = false
  routerMock.push.mockReset()
  fetchWithAuthMock.mockReset()
})

describe('RegistrationSmartButton', () => {
  it('shows login hint when unauthenticated', async () => {
    const wrapper = setup()

    await flushPromises()
    await nextTick()

    expect(fetchWithAuthMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('registration.button.login_to_register')
    expect(wrapper.text()).toContain('registration.button.login_hint')
  })

  it('navigates to registration when status is null', async () => {
    authState.isAuthenticated.value = true
    fetchWithAuthMock.mockResolvedValueOnce({
      success: true,
      data: { status: null, request_id: 7 },
    })

    const wrapper = setup()

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('registration.smart_button.register')

    await wrapper.findComponent({ name: 'Button' }).trigger('click')

    expect(routerMock.push).toHaveBeenCalledWith({
      name: 'tournament-registration',
      params: { tournamentSef: 'ow2' },
    })
  })

  it('navigates to registration status when status exists', async () => {
    authState.isAuthenticated.value = true
    fetchWithAuthMock.mockResolvedValueOnce({
      success: true,
      data: { status: 'PENDING', request_id: 77 },
    })

    const wrapper = setup()

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('registration.smart_button.pending')

    await wrapper.findComponent({ name: 'Button' }).trigger('click')

    expect(routerMock.push).toHaveBeenCalledWith({
      name: 'tournament-registration-status',
      params: { tournamentSef: 'ow2', registrationId: 77 },
    })
  })
})
