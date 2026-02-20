import type { RoleValue } from '@/components/tournament/registration/types'

export type RegistrationStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'ACCEPTED'
  | 'ACTION_REQUIRED'
  | 'DECLINED'
  | 'DELETED'

export type ActionStatus = 'PENDING' | 'RESOLVED'

export interface ManagedTournament {
  id: number
  title: string
  sef?: string
  start_at?: string
  registration_count?: number
}

export interface RegistrationSummary {
  id: number
  battletag: string
  status: RegistrationStatus
  primary_role?: RoleValue | null
  secondary_role?: RoleValue | null
  created_at: string
  updated_at: string
}

export interface RegistrationListResponse {
  items: RegistrationSummary[]
  total: number
  page: number
  per_page: number
}

export interface RegistrationRow {
  id: number
  tournament_id: number
  user_id: number
  user_battletag_id: number
  status: RegistrationStatus
  alt_accounts?: string[] | null
  twitch: string
  discord: string
  primary_role?: RoleValue | null
  secondary_role?: RoleValue | null
  guarantors?: string[] | null
  additional_info: string
  rules_accepted: boolean
  ip_address: string
  geo_ip?: {
    city: string
    region: string
    country: string
    country_code: string
    timezone: string
    org: string
    flag_url: string
  } | null
  user_agent: string
  decline_reason?: string | null
  created_at: string
  updated_at: string
  version: number
}

export interface RegistrationComment {
  id: number
  registration_id: number
  manager_user_id: number
  manager_battletag?: string | null
  comment: string
  created_at: string
}

export interface RegistrationRequestedAction {
  id: number
  registration_id: number
  manager_user_id: number
  description: string
  status: ActionStatus
  created_at: string
  updated_at: string
}

export interface RegistrationRoleRanking {
  id: number
  registration_id: number
  role: RoleValue
  ranking: number
  created_at: string
}

export interface RegistrationDetailResponse {
  registration: RegistrationRow
  battletag: string
  comments: RegistrationComment[]
  requested_actions: RegistrationRequestedAction[]
  role_rankings: RegistrationRoleRanking[]
}

export interface CreateCommentRequest {
  comment: string
}

export interface UpdateRegistrationStatusRequest {
  status: RegistrationStatus
  decline_reason?: string | null
  requested_action_description?: string | null
}

export interface RoleRankingAssignment {
  role: RoleValue
  ranking: number
}

export interface RoleRankingUpdateRequest {
  role_assignments: RoleRankingAssignment[]
}
