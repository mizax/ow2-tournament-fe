import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PlayerStats } from '@/types/stats'

vi.mock('@/lib/heroImage', () => ({
  heroImageUrl: (name: string) => (name === 'Tracer' ? '/heroes/tracer.png' : undefined),
}))

// Import after mock is set up
const { mergePlayerHeroes, groupPlayersByTeam } = await import('@/lib/matchStats')

function makePlayer(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    player_id: 1,
    nickname: 'Player1',
    role: 'damage',
    team_id: 10,
    team_name: 'Alpha',
    hero_name: 'Tracer',
    elims: 10,
    final_blows: 8,
    assists: 2,
    deaths: 4,
    hero_damage: 10000,
    healing: 0,
    damage_blocked: 0,
    ults_earned: 3,
    ults_used: 2,
    time_played: 600,
    solo_kills: 1,
    obj_kills: 2,
    env_kills: 0,
    env_deaths: 0,
    ...overrides,
  }
}

describe('mergePlayerHeroes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns one group per unique player', () => {
    const players = [
      makePlayer({ player_id: 1, hero_name: 'Tracer' }),
      makePlayer({ player_id: 1, hero_name: 'Widowmaker' }),
      makePlayer({ player_id: 2, nickname: 'Player2', hero_name: 'Tracer' }),
    ]
    const groups = mergePlayerHeroes(players)
    expect(groups).toHaveLength(2)
  })

  it('collects all heroes for a player', () => {
    const players = [
      makePlayer({ hero_name: 'Tracer' }),
      makePlayer({ hero_name: 'Widowmaker' }),
    ]
    const [group] = mergePlayerHeroes(players)
    expect(group.heroes.map((h) => h.name)).toEqual(['Tracer', 'Widowmaker'])
  })

  it('resolves hero image url via heroImageUrl', () => {
    const players = [
      makePlayer({ hero_name: 'Tracer' }),
      makePlayer({ hero_name: 'Widowmaker' }),
    ]
    const [group] = mergePlayerHeroes(players)
    expect(group.heroes[0].url).toBe('/heroes/tracer.png')
    expect(group.heroes[1].url).toBeUndefined()
  })

  it('sums numeric stats across heroes', () => {
    const players = [
      makePlayer({ final_blows: 5, deaths: 2, hero_damage: 8000, healing: 100, damage_blocked: 200, ults_earned: 2, ults_used: 1, time_played: 300 }),
      makePlayer({ final_blows: 3, deaths: 1, hero_damage: 4000, healing: 50,  damage_blocked: 100, ults_earned: 1, ults_used: 1, time_played: 200 }),
    ]
    const [group] = mergePlayerHeroes(players)
    expect(group.final_blows).toBe(8)
    expect(group.deaths).toBe(3)
    expect(group.hero_damage).toBe(12000)
    expect(group.healing).toBe(150)
    expect(group.damage_blocked).toBe(300)
    expect(group.ults_earned).toBe(3)
    expect(group.ults_used).toBe(2)
    expect(group.time_played).toBe(500)
  })

  it('treats null stats as 0 when summing', () => {
    const players = [
      makePlayer({ final_blows: null, hero_damage: null }),
      makePlayer({ final_blows: 5, hero_damage: 3000 }),
    ]
    const [group] = mergePlayerHeroes(players)
    expect(group.final_blows).toBe(5)
    expect(group.hero_damage).toBe(3000)
  })

  it('adds heroUrl to each row', () => {
    const players = [
      makePlayer({ hero_name: 'Tracer' }),
      makePlayer({ hero_name: 'Widowmaker' }),
    ]
    const [group] = mergePlayerHeroes(players)
    expect(group.rows[0].heroUrl).toBe('/heroes/tracer.png')
    expect(group.rows[1].heroUrl).toBeUndefined()
  })

  it('preserves original row data in rows', () => {
    const p = makePlayer({ final_blows: 7, hero_damage: 9000 })
    const [group] = mergePlayerHeroes([p])
    expect(group.rows[0].final_blows).toBe(7)
    expect(group.rows[0].hero_damage).toBe(9000)
  })
})

describe('groupPlayersByTeam', () => {
  it('groups players by team_name', () => {
    const players = [
      makePlayer({ player_id: 1, team_name: 'Alpha' }),
      makePlayer({ player_id: 2, nickname: 'P2', team_name: 'Beta' }),
      makePlayer({ player_id: 3, nickname: 'P3', team_name: 'Alpha' }),
    ]
    const result = groupPlayersByTeam(players)
    expect(Object.keys(result)).toEqual(['Alpha', 'Beta'])
    expect(result['Alpha']).toHaveLength(2)
    expect(result['Beta']).toHaveLength(1)
  })

  it('merges heroes within each team group', () => {
    const players = [
      makePlayer({ player_id: 1, team_name: 'Alpha', hero_name: 'Tracer' }),
      makePlayer({ player_id: 1, team_name: 'Alpha', hero_name: 'Widowmaker' }),
    ]
    const result = groupPlayersByTeam(players)
    expect(result['Alpha'][0].heroes).toHaveLength(2)
  })

  it('returns empty object for empty input', () => {
    expect(groupPlayersByTeam([])).toEqual({})
  })
})
