import { fetchWithAuth, type ApiResponse } from '@/services/apiService'
import type { ManagedTournamentFull, TournamentEditFormValues } from '@/types/tournament-manager'

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
