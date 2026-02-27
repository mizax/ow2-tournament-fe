export interface MapScore {
  map_order: number
  map_name: string | null
  mode_name: string | null
  home_score: number
  away_score: number
}

export interface MatchSummary {
  id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  maps: MapScore[]
}

export interface PlayerStats {
  player_id: number
  nickname: string
  role: string | null
  team_id: number
  team_name: string
  hero_name: string
  elims: number | null
  final_blows: number | null
  assists: number | null
  deaths: number | null
  hero_damage: number | null
  healing: number | null
  damage_blocked: number | null
  ults_earned: number | null
  ults_used: number | null
  time_played: number | null
  // Tooltip details
  solo_kills: number | null
  obj_kills: number | null
  env_kills: number | null
  env_deaths: number | null
}

export interface HeroEntry {
  name: string
  url: string | undefined
}

export interface PlayerGroupRow extends PlayerStats {
  heroUrl: string | undefined
}

export interface PlayerGroup {
  player_id: number
  nickname: string
  role: string | null
  team_id: number
  team_name: string
  heroes: HeroEntry[]
  elims: number
  final_blows: number
  assists: number
  deaths: number
  hero_damage: number
  healing: number
  damage_blocked: number
  ults_earned: number
  ults_used: number
  time_played: number
  solo_kills: number
  obj_kills: number
  env_kills: number
  env_deaths: number
  rows: PlayerGroupRow[]
}

export interface RoundStats {
  round: number | null
  players: PlayerStats[]
}

export interface MapStats {
  map_order: number
  map_name: string | null
  mode_name: string | null
  rounds: RoundStats[]
}

export interface MatchStatsResponse {
  match_id: number
  home_team: string
  home_team_id: number
  away_team: string
  away_team_id: number
  maps: MapStats[]
}

export interface PlayerProfile {
  id: number
  nickname: string
  role: string | null
  registration_id: number | null
  battletag: string | null
  team_name: string
  tournament_title: string
  tournament_sef: string
  division_name: string | null
}

export interface ProcessedTeam {
  teamName: string
  groups: PlayerGroup[]
  maxDamage: number
}

export interface ProcessedRound {
  round: number | null
  byTeam: ProcessedTeam[]
}

export interface ProcessedMap {
  map_order: number
  map_name: string | null
  mode_name: string | null
  rounds: ProcessedRound[]
}

export interface PlayerMatchSummary {
  match_id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  tournament_title: string
  maps_played: number
  kills: number | null
  deaths: number | null
  damage: number | null
  healing: number | null
  time_played: number | null
}
