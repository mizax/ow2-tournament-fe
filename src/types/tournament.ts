export interface TournamentPodiumPlace {
  place: number
  team_name: string
}

export interface Tournament {
  title: string
  uri: string
  discipline: string
  format: string
  dates: string[]
  status?: 'upcoming' | 'ongoing' | 'finished'
  prize_pool?: string
  registration_count?: number
  podium?: TournamentPodiumPlace[]
}
