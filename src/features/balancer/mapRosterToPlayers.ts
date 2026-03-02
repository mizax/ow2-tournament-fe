import type { Player, Players, RosterEntry } from './types'

const ROLE_MAP: Record<string, keyof { dps: unknown; tank: unknown; support: unknown }> = {
  damage: 'dps',
  tank: 'tank',
  support: 'support',
  flex: 'dps', // flex maps to dps slot (isFullFlex handles the rest)
}

function makeClass(rank: number, isPrimary: boolean, isSecondary: boolean): {
  rank: number
  priority: number
  isActive: boolean
  primary: boolean
  secondary: boolean
} {
  return {
    rank,
    priority: isPrimary ? 0 : isSecondary ? 1 : 2,
    isActive: rank > 0 || isPrimary || isSecondary,
    primary: isPrimary,
    secondary: isSecondary,
  }
}

export function mapRosterToPlayers(roster: RosterEntry[], includedIds: Record<number, boolean>): Players {
  const players: Players = {}

  for (const entry of roster) {
    if (!includedIds[entry.registration_id]) continue

    // Apply overrides if present
    const primaryRole = entry.overrides?.primary_role ?? entry.primary_role ?? null
    const secondaryRole = entry.overrides?.secondary_role ?? entry.secondary_role ?? null
    const rankings = entry.overrides?.role_rankings ?? entry.role_rankings
    const isFullFlex =
      entry.overrides?.full_flex !== undefined ? entry.overrides.full_flex : entry.is_full_flex

    const tankRank = rankings['tank'] ?? 0
    const dpsRank = rankings['damage'] ?? 0
    const supportRank = rankings['support'] ?? 0

    const primaryBalancerRole = primaryRole ? (ROLE_MAP[primaryRole.toLowerCase()] ?? null) : null
    const secondaryBalancerRole = secondaryRole
      ? (ROLE_MAP[secondaryRole.toLowerCase()] ?? null)
      : null

    const player: Player = {
      identity: {
        uuid: String(entry.registration_id),
        name: entry.battletag,
        isLocked: false,
        isSquire: false,
        isCaptain: false,
        isFullFlex,
      },
      stats: {
        classes: {
          tank: makeClass(tankRank, primaryBalancerRole === 'tank', secondaryBalancerRole === 'tank'),
          dps: makeClass(dpsRank, primaryBalancerRole === 'dps', secondaryBalancerRole === 'dps'),
          support: makeClass(
            supportRank,
            primaryBalancerRole === 'support',
            secondaryBalancerRole === 'support',
          ),
        },
      },
      createdAt: '',
    }

    players[String(entry.registration_id)] = player
  }

  // Auto-assign captains: one per team of 5, spread evenly across SR range.
  // The balancer requires at least one captain to create teams.
  const entries = Object.entries(players)
  const numTeams = Math.floor(entries.length / 5)
  if (numTeams > 0) {
    const maxSr = (p: Player) =>
      Math.max(p.stats.classes.tank.rank, p.stats.classes.dps.rank, p.stats.classes.support.rank)
    entries.sort((a, b) => maxSr(b[1]) - maxSr(a[1]))
    const step = Math.floor(entries.length / numTeams)
    for (let i = 0; i < numTeams; i++) {
      const entry = entries[i * step]
      if (entry) players[entry[0]].identity.isCaptain = true
    }
  }

  return players
}
