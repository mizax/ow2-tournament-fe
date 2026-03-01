import { fetchWithAuth, type ApiResponse } from '@/services/apiService'
import type {
  ManagedTournamentFull,
  TournamentEditFormValues,
  TournamentManager,
  UserSearchResult,
} from '@/types/tournament-manager'

export interface CreateTournamentResponse {
  id: number
  title: string
  sef_title: string
  status: string
}

export async function fetchManagedTournament(
  tournamentId: string,
): Promise<ApiResponse<ManagedTournamentFull>> {
  return fetchWithAuth<ManagedTournamentFull>(`/api/secured/v1/manager/tournaments/${tournamentId}`)
}

export async function updateManagedTournament(
  tournamentId: string,
  data: TournamentEditFormValues,
): Promise<ApiResponse<ManagedTournamentFull>> {
  return fetchWithAuth<ManagedTournamentFull>(`/api/secured/v1/manager/tournaments/${tournamentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function createTournament(
  title: string,
  sef_title: string,
): Promise<ApiResponse<CreateTournamentResponse>> {
  return fetchWithAuth<CreateTournamentResponse>('/api/secured/v1/manager/tournaments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, sef_title }),
  })
}

export async function listTournamentManagers(
  tournamentId: number,
): Promise<ApiResponse<TournamentManager[]>> {
  return fetchWithAuth<TournamentManager[]>(
    `/api/secured/v1/manager/tournaments/${tournamentId}/managers`,
  )
}

export async function addTournamentManager(
  tournamentId: number,
  userId: number,
  canManageManagers: boolean,
): Promise<ApiResponse<void>> {
  return fetchWithAuth<void>(`/api/secured/v1/manager/tournaments/${tournamentId}/managers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, can_manage_managers: canManageManagers }),
  })
}

export async function removeTournamentManager(
  tournamentId: number,
  targetUserId: number,
): Promise<ApiResponse<void>> {
  return fetchWithAuth<void>(
    `/api/secured/v1/manager/tournaments/${tournamentId}/managers/${targetUserId}`,
    { method: 'DELETE' },
  )
}

export async function searchUsersForManager(search: string): Promise<ApiResponse<UserSearchResult[]>> {
  const params = new URLSearchParams({ search, limit: '10' })
  return fetchWithAuth<UserSearchResult[]>(`/api/secured/v1/manager/users?${params}`)
}
