import { describe, expect, it, vi } from 'vitest'

type AuthOverride = {
  isAuthenticated?: boolean
  hasRole?: (role: unknown) => boolean
}

const setupRouter = async (override: AuthOverride = {}) => {
  vi.resetModules()

  const toastError = vi.fn()

  vi.doMock('vue-sonner', () => ({
    toast: {
      error: toastError,
    },
  }))

  vi.doMock('@/stores/authStore', () => ({
    useAuthStore: () => ({
      isAuthenticated: false,
      hasRole: () => false,
      restoreSession: vi.fn().mockResolvedValue({ success: true }),
      waitForUser: vi.fn().mockResolvedValue(null),
      ...override,
    }),
  }))

  const router = (await import('@/router/index')).default
  await router.push('/')
  await router.isReady()

  return { router, toastError }
}

describe('router guard', () => {
  it('redirects unauthenticated user from protected route', async () => {
    const { router, toastError } = await setupRouter({
      isAuthenticated: false,
    })

    await router.push('/manager')
    await router.isReady()

    expect(toastError).toHaveBeenCalledWith('Not authenticated')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('redirects user without role to forbidden', async () => {
    const { router, toastError } = await setupRouter({
      isAuthenticated: true,
      hasRole: () => false,
    })

    await router.push('/manager')
    await router.isReady()

    expect(toastError).toHaveBeenCalledWith('Access denied')
    expect(router.currentRoute.value.path).toBe('/401-forbidden')
  })

  it('allows authenticated user with role', async () => {
    const { router, toastError } = await setupRouter({
      isAuthenticated: true,
      hasRole: () => true,
    })

    await router.push('/manager')
    await router.isReady()

    expect(toastError).not.toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/manager')
  })
})
