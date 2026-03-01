import { fetchWithAuth, type ApiResponse } from '@/services/apiService'

export interface AdminUser {
  id: number
  battletag?: string | null
  is_admin: boolean
  is_banned: boolean
  authorities: string[]
}

export async function fetchAdminUsers(
  search?: string,
  limit: number = 50,
  offset: number = 0,
): Promise<ApiResponse<AdminUser[]>> {
  const query = new URLSearchParams()
  if (search?.trim()) {
    query.set('search', search.trim())
  }
  query.set('limit', String(limit))
  query.set('offset', String(offset))

  return fetchWithAuth<AdminUser[]>(`/api/secured/v1/admin/users?${query.toString()}`)
}

export async function grantAuthority(
  userId: number,
  authority: string,
): Promise<ApiResponse<{ user_id: number; authority: string }>> {
  return fetchWithAuth<{ user_id: number; authority: string }>(
    `/api/secured/v1/admin/users/${userId}/authorities`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authority }),
    },
  )
}

export async function revokeAuthority(
  userId: number,
  authority: string,
): Promise<ApiResponse<{ user_id: number; authority: string }>> {
  return fetchWithAuth<{ user_id: number; authority: string }>(
    `/api/secured/v1/admin/users/${userId}/authorities/${encodeURIComponent(authority)}`,
    {
      method: 'DELETE',
    },
  )
}
