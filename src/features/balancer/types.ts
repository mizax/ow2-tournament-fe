export type ClassType = {
  rank: number
  priority: number
  isActive: boolean
  primary: boolean
  secondary: boolean
}

export type Classes = {
  dps: ClassType
  tank: ClassType
  support: ClassType
}

export type Player = {
  identity: {
    uuid: string
    name: string
    isLocked: boolean
    isSquire: boolean
    isCaptain: boolean
    isFullFlex: boolean
  }
  stats: {
    classes: Classes
  }
}

export type Players = Record<string, Player>

export type BalancerAdjustSr = {
  isEnabled: boolean
  tank: unknown
  support: unknown
  dps: unknown
}

export type BalancerInput = {
  players: Players
  range: number
  lowRankLimiter: boolean
  disallowSecondaryRoles: boolean
  adjustSr: BalancerAdjustSr
  disableType: boolean
  dispersionMinimizer: boolean
  triesCount: number
}

export type TeamMember = {
  rank: number
  uuid: string
  name: string
  primary: boolean
  secondary: boolean
  role: 'dps' | 'support' | 'tank'
}

export type Team = {
  uuid: string
  name: string
  avgSr: number
  totalSr: number
  members: TeamMember[]
}

export type Leftover = {
  uuid: string
  name: string
}

export type BalanceResult = {
  anchors: number
  dispersion: number
  leftovers: Leftover[]
  teams: Team[]
}

// Roster from BE API
export type RosterEntry = {
  registration_id: number
  battletag: string
  primary_role: string | null
  secondary_role: string | null
  is_full_flex: boolean
  role_rankings: Record<string, number>
  checked_in: boolean
  checked_in_at: string | null
  overrides: {
    primary_role?: string
    secondary_role?: string
    role_rankings?: Record<string, number>
    full_flex?: boolean
  } | null
}
