import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import AuthCallbackView from '@/views/AuthCallbackView.vue'
import { fetchWithoutAuth } from '@/services/apiService'
import { toast } from 'vue-sonner'

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}))

const authStoreMock = vi.hoisted(() => ({
  login: vi.fn(),
  consumeRedirectPath: vi.fn().mockReturnValue('/'),
}))

vi.mock('vue-router', () => ({
  useRouter: () => routerMock,
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authStoreMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    te: (key: string) => key === 'auth_callback.authentication_failed',
  }),
}))

vi.mock('@/services/apiService', () => ({
  fetchWithoutAuth: vi.fn(),
}))

vi.mock('vue-sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

const fetchWithoutAuthMock = vi.mocked(fetchWithoutAuth)
const toastErrorMock = vi.mocked(toast.error)

const setup = () => {
  return shallowMount(AuthCallbackView)
}

beforeEach(() => {
  routerMock.push.mockReset()
  authStoreMock.login.mockReset()
  authStoreMock.consumeRedirectPath.mockReset()
  fetchWithoutAuthMock.mockReset()
  toastErrorMock.mockReset()
})

describe('AuthCallbackView', () => {
  it('logs in and redirects on success', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: true,
      data: {
        id_token: 'token',
        user: { id: '1', battletag: 'Test#1234', roles: [] },
      },
    })

    authStoreMock.consumeRedirectPath.mockReturnValueOnce('/home')

    setup()
    await flushPromises()
    await nextTick()

    expect(authStoreMock.login).toHaveBeenCalledWith('token', {
      id: '1',
      battletag: 'Test#1234',
      roles: [],
    })
    expect(routerMock.push).toHaveBeenCalledWith('/home')
    consoleLogSpy.mockRestore()
  })

  it('shows error toast and redirects to home on error response', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: false,
      errorCode: 'bad_request',
      errorData: { error: 'bad_request' },
    })

    setup()
    await flushPromises()
    await nextTick()

    expect(toastErrorMock).toHaveBeenCalledWith('auth_callback.authentication_failed')
    expect(routerMock.push).toHaveBeenCalledWith('/')
    consoleErrorSpy.mockRestore()
  })

  it('shows error toast with description when details are present', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: false,
      errorCode: 'bad_request',
      errorData: { error: 'bad_request', details: 'Battle.net error' },
    })

    setup()
    await flushPromises()
    await nextTick()

    expect(toastErrorMock).toHaveBeenCalledWith('auth_callback.authentication_failed', {
      description: 'Battle.net error',
    })
    expect(routerMock.push).toHaveBeenCalledWith('/')
    consoleErrorSpy.mockRestore()
  })
})
