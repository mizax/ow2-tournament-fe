import { heroImageUrl } from '@/lib/heroImage'
import type { PlayerStats, PlayerGroup, PlayerGroupRow, HeroEntry } from '@/types/stats'

export function mergePlayerHeroes(players: PlayerStats[]): PlayerGroup[] {
  const map = new Map<number, PlayerGroup>()
  for (const p of players) {
    if (!map.has(p.player_id)) {
      map.set(p.player_id, {
        player_id: p.player_id,
        nickname: p.nickname,
        role: p.role,
        team_id: p.team_id,
        team_name: p.team_name,
        heroes: [],
        elims: 0, final_blows: 0, assists: 0, deaths: 0,
        hero_damage: 0, healing: 0, damage_blocked: 0,
        ults_earned: 0, ults_used: 0, time_played: 0,
        solo_kills: 0, obj_kills: 0, env_kills: 0, env_deaths: 0,
        rows: [],
      })
    }
    const g = map.get(p.player_id)!
    g.heroes.push({ name: p.hero_name, url: heroImageUrl(p.hero_name) } satisfies HeroEntry)
    g.elims += p.elims ?? 0
    g.final_blows += p.final_blows ?? 0
    g.assists += p.assists ?? 0
    g.deaths += p.deaths ?? 0
    g.hero_damage += p.hero_damage ?? 0
    g.healing += p.healing ?? 0
    g.damage_blocked += p.damage_blocked ?? 0
    g.ults_earned += p.ults_earned ?? 0
    g.ults_used += p.ults_used ?? 0
    g.time_played += p.time_played ?? 0
    g.solo_kills += p.solo_kills ?? 0
    g.obj_kills += p.obj_kills ?? 0
    g.env_kills += p.env_kills ?? 0
    g.env_deaths += p.env_deaths ?? 0
    g.rows.push({ ...p, heroUrl: heroImageUrl(p.hero_name) } satisfies PlayerGroupRow)
  }
  return Array.from(map.values())
}

export function groupPlayersByTeam(players: PlayerStats[]): Record<string, PlayerGroup[]> {
  const byTeam: Record<string, PlayerStats[]> = {}
  for (const p of players) {
    if (!byTeam[p.team_name]) byTeam[p.team_name] = []
    ;(byTeam[p.team_name] as PlayerStats[]).push(p)
  }
  const result: Record<string, PlayerGroup[]> = {}
  for (const [team, teamPlayers] of Object.entries(byTeam)) {
    result[team] = mergePlayerHeroes(teamPlayers)
  }
  return result
}
