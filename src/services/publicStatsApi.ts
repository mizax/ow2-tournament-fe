import { fetchWithoutAuth } from './apiService'

export const fetchTournamentMatches = (sef: string) =>
  fetchWithoutAuth(`/api/public/v1/tournaments/${sef}/matches`)

export const fetchMatchDetail = (id: number) =>
  fetchWithoutAuth(`/api/public/v1/matches/${id}`)

export const fetchMatchStats = (id: number) =>
  fetchWithoutAuth(`/api/public/v1/matches/${id}/stats`)

export const fetchPlayer = (id: number) =>
  fetchWithoutAuth(`/api/public/v1/players/${id}`)

export const fetchPlayerMatches = (id: number) =>
  fetchWithoutAuth(`/api/public/v1/players/${id}/matches`)
