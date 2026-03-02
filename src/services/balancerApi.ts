import { fetchWithAuth, type ApiResponse } from '@/services/apiService'
import type { RosterEntry } from '@/features/balancer/types'

export interface CheckinUpdateItem {
  registration_id: number
  checked_in: boolean
  primary_role_override?: string | null
  secondary_role_override?: string | null
  role_rankings_override_json?: string | null
  full_flex_override?: boolean | null
}

export interface BalanceMeta {
  id: number
  tournament_id: number
  created_by: number
  created_at: string
}

export interface BalanceRow extends BalanceMeta {
  payload_json: string
}

export async function getRoster(
  tournamentId: number,
): Promise<ApiResponse<{ items: RosterEntry[] }>> {
  return fetchWithAuth(`/api/secured/v1/manager/tournaments/${tournamentId}/roster`)
}

export async function patchCheckins(
  tournamentId: number,
  items: CheckinUpdateItem[],
): Promise<ApiResponse<void>> {
  return fetchWithAuth(`/api/secured/v1/manager/tournaments/${tournamentId}/checkins`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })
}

export async function patchCheckin(
  tournamentId: number,
  regId: number,
  item: CheckinUpdateItem,
): Promise<ApiResponse<unknown>> {
  return fetchWithAuth(`/api/secured/v1/manager/tournaments/${tournamentId}/checkins/${regId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
}

export async function saveBalance(
  tournamentId: number,
  payload: unknown,
): Promise<ApiResponse<BalanceRow>> {
  return fetchWithAuth(`/api/secured/v1/manager/tournaments/${tournamentId}/balances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload }),
  })
}

export async function listBalances(
  tournamentId: number,
): Promise<ApiResponse<{ items: BalanceMeta[] }>> {
  return fetchWithAuth(`/api/secured/v1/manager/tournaments/${tournamentId}/balances`)
}

export async function selfCheckin(tournamentId: number): Promise<ApiResponse<unknown>> {
  return fetchWithAuth(`/api/secured/v1/tournaments/${tournamentId}/checkin`, {
    method: 'POST',
  })
}

export async function getSelfCheckin(tournamentId: number): Promise<ApiResponse<unknown>> {
  return fetchWithAuth(`/api/secured/v1/tournaments/${tournamentId}/checkin`)
}
