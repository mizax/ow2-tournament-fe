import { describe, expect, it, vi } from 'vitest'
import { fetchWithAuth, handleApiResponse } from '@/services/apiService'

const mockLogout = vi.fn()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    token: 'test-token',
    logout: mockLogout,
  }),
}))

describe('handleApiResponse', () => {
  it('parses JSON on success', async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })

    const result = await handleApiResponse<{ ok: boolean }>(response)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ ok: true })
  })

  it('maps error status and preserves error data code', async () => {
    const response = new Response(JSON.stringify({ code: 'custom_error' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })

    const result = await handleApiResponse(response)

    expect(result.success).toBe(false)
    expect(result.errorCode).toBe('custom_error')
    expect(result.errorData).toEqual({ code: 'custom_error' })
  })
})

describe('fetchWithAuth', () => {
  it('adds Authorization header and returns parsed data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ value: 42 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchWithAuth<{ value: number }>('/api/test')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    )
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ value: 42 })
  })

  it('logs out on 401 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('', { status: 401 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchWithAuth('/api/unauthorized')

    expect(result.success).toBe(false)
    expect(result.errorCode).toBe('unauthorized')
    expect(mockLogout).toHaveBeenCalledOnce()
  })
})
