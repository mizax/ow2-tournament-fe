import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import AuthCallbackView from '@/views/AuthCallbackView.vue'
import { handleApiResponse } from '@/services/apiService'

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
  }),
}))

vi.mock('@/services/apiService', () => ({
  handleApiResponse: vi.fn(),
}))

const handleApiResponseMock = vi.mocked(handleApiResponse)

const setup = () => {
  return shallowMount(AuthCallbackView)
}

beforeEach(() => {
  routerMock.push.mockReset()
  authStoreMock.login.mockReset()
  authStoreMock.consumeRedirectPath.mockReset()
  handleApiResponseMock.mockReset()
})

describe('AuthCallbackView', () => {
  it('logs in and redirects on success', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id_token: 'token',
        user: { id: '1', battletag: 'Test#1234', roles: [] },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

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

  it('redirects to home with error on error response', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    })
    vi.stubGlobal('fetch', fetchMock)

    handleApiResponseMock.mockResolvedValueOnce({
      success: false,
      errorCode: 'bad_request',
    })

    setup()
    await flushPromises()
    await nextTick()

    expect(routerMock.push).toHaveBeenCalledWith({
      path: '/',
      query: { error: 'bad_request' },
    })
    consoleErrorSpy.mockRestore()
  })
})
