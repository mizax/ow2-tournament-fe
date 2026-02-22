import { defineStore } from 'pinia'
import { fetchWithoutAuth, type ApiResponse } from '@/services/apiService'

export interface TournamentDetails {
  id: string
  title: string
  discipline: string
  format: string
  status?: 'upcoming' | 'ongoing' | 'finished'
  type: string
  organizers?: Array<{ role: string; name: string; contact?: string }>
  rules?: {
    full_rules_url?: string
    version?: string
    last_update?: string
  }
  eligibility?: {
    min_rank?: string
    min_competitive_hours?: number
    min_calibrated_seasons?: number
    wins_current_season_main_role?: number
    subscription?: {
      twitch_channel?: string
      donation_amount_rub?: number
      donation_url?: string
    }
    verification_battletag?: string
  }
  registration?: {
    start?: string
    deadline?: string
    checkin?: {
      from?: string
      to?: string
      platform?: string
      platform_url?: string
    }
  }
  schedule: Array<{
    day: number
    date: string
    stage: string
    start_time: string
  }>
  prize_pool: {
    currency: string
    places: Array<{ place: number; amount: number }>
  }
  stream?: {
    platform?: string
    channel?: string
  }
  results?: {
    placements?: Array<{ place: number; team_name: string; captain_battletag?: string }>
    mvp?: string
    summary?: string
  }
  media?: {
    vod_url?: string
    bracket_url?: string
  }
  markdown?: {
    description?: string
    notes?: string
    full_regulation?: string
  }
}

interface TournamentState {
  tournaments: Record<string, TournamentDetails>
  fetchingBySef: Record<string, Promise<ApiResponse<TournamentDetails>> | null>
}

export const useTournamentStore = defineStore('tournaments', {
  state: (): TournamentState => ({
    tournaments: {},
    fetchingBySef: {},
  }),
  actions: {
    async fetchTournament(sef: string): Promise<ApiResponse<TournamentDetails>> {
      if (!sef) {
        return { success: false, errorCode: 'missing_sef' }
      }

      const cached = this.tournaments[sef]
      if (cached) {
        return { success: true, data: cached }
      }

      const inFlight = this.fetchingBySef[sef]
      if (inFlight) {
        return inFlight
      }

      const request = fetchWithoutAuth<TournamentDetails>(`/api/public/v1/tournaments/${sef}`)
      this.fetchingBySef[sef] = request

      const response = await request
      if (response.success && response.data) {
        this.tournaments[sef] = response.data
      }

      this.fetchingBySef[sef] = null
      return response
    },
  },
})
