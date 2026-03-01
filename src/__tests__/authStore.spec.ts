import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { fetchWithAuth, fetchWithoutAuth } from '@/services/apiService'
import type { ApiResponse } from '@/services/apiService'
import type { User } from '@/types/User'

vi.mock('@/services/apiService', () => ({
  fetchWithAuth: vi.fn(),
  fetchWithoutAuth: vi.fn(),
}))

const fetchWithAuthMock = vi.mocked(fetchWithAuth)
const fetchWithoutAuthMock = vi.mocked(fetchWithoutAuth)

const originalLocation = window.location

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      pathname: '/',
      search: '',
      hash: '',
    },
    writable: true,
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
  })
})

describe('authStore', () => {
  it('restoreSession returns null when no token', async () => {
    const store = useAuthStore()
    store.token = null

    const result = await store.restoreSession()

    expect(result).toBeNull()
  })

  it('restoreSession returns success when user already loaded', async () => {
    const store = useAuthStore()
    store.token = 'token'
    store.user = { id: '1', battletag: 'Test#1234', roles: [], authorities: [] } as User

    const result = await store.restoreSession()

    expect(result).toEqual({ success: true })
  })

  it('restoreSession returns in-flight promise when fetchingUser exists', async () => {
    const store = useAuthStore()
    const deferred: Promise<ApiResponse<User>> = Promise.resolve({ success: true })
    store.token = 'token'
    store.fetchingUser = deferred

    const result = await store.restoreSession()

    expect(result).toEqual({ success: true })
  })

  it('authorize stores redirect state and updates location', async () => {
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: true,
      data: { auth_url: 'https://example.com/auth?state=abc' },
    })

    const store = useAuthStore()
    const result = await store.authorize({ path: '/target' })

    expect(result).toBeNull()
    expect(store.redirectStateMap['abc']?.path).toBe('/target')
    expect(window.location.href).toBe('https://example.com/auth?state=abc')
  })

  it('authorize returns missing_auth_url when response has no url', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchWithoutAuthMock.mockResolvedValueOnce({
      success: true,
      data: {},
    })

    const store = useAuthStore()
    const result = await store.authorize({ path: '/target' })

    expect(result).toBe('missing_auth_url')
    consoleSpy.mockRestore()
  })

  it('consumeRedirectPath returns stored path and removes entry', () => {
    const store = useAuthStore()
    store.redirectStateMap = {
      abc: { path: '/stored', createdAt: Date.now() },
    }

    const result = store.consumeRedirectPath('abc')

    expect(result).toBe('/stored')
    expect(store.redirectStateMap['abc']).toBeUndefined()
  })

  it('fetchUser logs out on non-unauthorized failure', async () => {
    const store = useAuthStore()
    store.token = 'token'
    const logoutSpy = vi.spyOn(store, 'logout')

    fetchWithAuthMock.mockResolvedValueOnce({
      success: false,
      errorCode: 'server_error',
    })

    const result = await store.fetchUser()

    expect(result.success).toBe(false)
    expect(logoutSpy).toHaveBeenCalledOnce()
  })
})
