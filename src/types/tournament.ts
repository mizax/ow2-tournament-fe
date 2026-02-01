export interface Tournament {
  title: string
  uri: string
  discipline: string
  format: string
  dates: string[]
  prize_pool?: string
  registration_count?: number
}
