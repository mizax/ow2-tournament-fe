import { fetchWithAuth, type ApiResponse } from '@/services/apiService'

export interface TournamentMatch {
  id: number
  home_team_id: number
  home_team_name: string
  away_team_id: number
  away_team_name: string
  home_score: number
  away_score: number
}

export async function fetchTournamentMatches(
  tournamentId: number,
): Promise<ApiResponse<TournamentMatch[]>> {
  return fetchWithAuth<TournamentMatch[]>(
    `/api/secured/v1/manager/tournaments/${tournamentId}/matches`,
  )
}

export async function uploadMatchLog(
  matchId: number,
  logName: string,
  content: string,
): Promise<ApiResponse<void>> {
  return fetchWithAuth<void>(
    `/api/secured/v1/logs/load/${matchId}/${encodeURIComponent(logName)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: content,
    },
  )
}
