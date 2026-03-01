export interface TournamentOrganizer {
  role: string
  name: string
  contact?: string
}

export interface TournamentSubscription {
  twitch_channel?: string
  donation_url?: string
  donation_amount_rub?: number
}

export interface TournamentEligibility {
  min_rank?: string
  min_competitive_hours?: number
  min_calibrated_seasons?: number
  wins_current_season_main_role?: number
  subscription?: TournamentSubscription
  verification_battletag?: string
}

export interface TournamentCheckin {
  from?: string
  to?: string
  platform?: string
  platform_url?: string
}

export interface TournamentRegistrationConfig {
  start?: string
  deadline?: string
  checkin?: TournamentCheckin
}

export interface TournamentTeams {
  players_per_team?: number
  format?: string
}

export interface TournamentScheduleItem {
  day: number
  date: string
  stage: string
  start_time: string
}

export interface TournamentMatchFormat {
  group_stage?: string
  playoff?: string
  final?: string
}

export interface TournamentPrizePlace {
  place: number
  amount: number
}

export interface TournamentPrizePool {
  currency?: string
  places?: TournamentPrizePlace[]
}

export interface TournamentStream {
  platform?: string
  channel?: string
}

export interface TournamentResultPlace {
  place: number
  team_name: string
  captain_battletag?: string
}

export interface TournamentResults {
  placements?: TournamentResultPlace[]
  mvp?: string
  summary?: string
}

export interface TournamentMedia {
  vod_url?: string
  bracket_url?: string
}

export interface TournamentMarkdown {
  description?: string
  notes?: string
  full_regulation?: string
}

export interface TournamentRules {
  full_rules_url?: string
  version?: string
  last_update?: string
}

export interface ManagedTournamentFull {
  id: number
  title: string
  sef_title: string
  discipline: string
  format: string
  type: string
  organizers?: TournamentOrganizer[]
  rules?: TournamentRules
  eligibility?: TournamentEligibility
  registration?: TournamentRegistrationConfig
  teams?: TournamentTeams
  schedule: TournamentScheduleItem[]
  match_format?: TournamentMatchFormat
  prize_pool: TournamentPrizePool
  stream?: TournamentStream
  status?: 'draft' | 'upcoming' | 'ongoing' | 'finished'
  results?: TournamentResults
  media?: TournamentMedia
  markdown?: TournamentMarkdown
}

export type TournamentEditFormValues = Omit<ManagedTournamentFull, 'id'>
