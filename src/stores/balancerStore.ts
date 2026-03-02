import { defineStore } from 'pinia'
import type { RosterEntry, BalancerInput, BalanceResult } from '@/features/balancer/types'
import { mapRosterToPlayers } from '@/features/balancer/mapRosterToPlayers'
import { useBalancerWorker } from '@/features/balancer/useBalancerWorker'
import {
  getRoster,
  patchCheckin,
  saveBalance,
  listBalances,
  type CheckinUpdateItem,
  type BalanceMeta,
} from '@/services/balancerApi'

const DEFAULT_ADJUST_SR = {
  isEnabled: false,
  tank: { any: [], primary: [], secondary: [] },
  support: { any: [], primary: [], secondary: [] },
  dps: { any: [], primary: [], secondary: [] },
}

interface BalancerState {
  roster: RosterEntry[]
  rosterLoading: boolean
  balancerOptions: {
    range: number
    triesCount: number
    lowRankLimiter: boolean
    disallowSecondaryRoles: boolean
    dispersionMinimizer: boolean
  }
  balanceResults: BalanceResult[]
  balanceRunning: boolean
  selectedBalanceIndex: number | null
  savedBalances: BalanceMeta[]
  savedBalancesLoading: boolean
}

export const useBalancerStore = defineStore('balancer', {
  state: (): BalancerState => ({
    roster: [],
    rosterLoading: false,
    balancerOptions: {
      range: 200,
      triesCount: 1000,
      lowRankLimiter: false,
      disallowSecondaryRoles: false,
      dispersionMinimizer: true,
    },
    balanceResults: [],
    balanceRunning: false,
    selectedBalanceIndex: null,
    savedBalances: [],
    savedBalancesLoading: false,
  }),

  getters: {
    checkedInCount: (state) => state.roster.filter((r) => r.checked_in).length,
    totalCount: (state) => state.roster.length,
    selectedBalance: (state) =>
      state.selectedBalanceIndex !== null ? state.balanceResults[state.selectedBalanceIndex] : null,
  },

  actions: {
    async fetchRoster(tournamentId: number) {
      this.rosterLoading = true
      const response = await getRoster(tournamentId)
      this.rosterLoading = false
      if (response.success && response.data) {
        this.roster = response.data.items
      }
      return response
    },

    async patchCheckin(tournamentId: number, item: CheckinUpdateItem) {
      const response = await patchCheckin(tournamentId, item.registration_id, item)
      if (response.success) {
        const idx = this.roster.findIndex((r) => r.registration_id === item.registration_id)
        if (idx !== -1) {
          this.roster[idx] = {
            ...this.roster[idx],
            checked_in: item.checked_in,
            ...(item.primary_role_override !== undefined ||
            item.secondary_role_override !== undefined ||
            item.role_rankings_override_json !== undefined ||
            item.full_flex_override !== undefined
              ? {
                  overrides: {
                    primary_role: item.primary_role_override ?? undefined,
                    secondary_role: item.secondary_role_override ?? undefined,
                    role_rankings: item.role_rankings_override_json
                      ? (() => {
                          try { return JSON.parse(item.role_rankings_override_json!) }
                          catch { return undefined }
                        })()
                      : undefined,
                    full_flex: item.full_flex_override ?? undefined,
                  },
                }
              : {}),
          }
        }
      }
      return response
    },

    async runBalance() {
      const players = mapRosterToPlayers(this.roster)
      if (Object.keys(players).length === 0) return

      this.balanceRunning = true
      this.balanceResults = []
      this.selectedBalanceIndex = null

      const { runBalance } = useBalancerWorker()

      const input: BalancerInput = {
        players,
        range: this.balancerOptions.range,
        triesCount: this.balancerOptions.triesCount,
        lowRankLimiter: this.balancerOptions.lowRankLimiter,
        disallowSecondaryRoles: this.balancerOptions.disallowSecondaryRoles,
        adjustSr: { ...DEFAULT_ADJUST_SR, isEnabled: false },
        disableType: false,
        dispersionMinimizer: this.balancerOptions.dispersionMinimizer,
      }

      try {
        const results = await runBalance(input)
        this.balanceResults = Array.isArray(results) ? results : [results as BalanceResult]
        if (this.balanceResults.length > 0) {
          this.selectedBalanceIndex = 0
        }
      } finally {
        this.balanceRunning = false
      }
    },

    async saveSelected(tournamentId: number) {
      if (this.selectedBalance === null) return

      const response = await saveBalance(tournamentId, this.selectedBalance)
      if (response.success && response.data) {
        this.savedBalances.unshift({
          id: response.data.id,
          tournament_id: response.data.tournament_id,
          created_by: response.data.created_by,
          created_at: response.data.created_at,
        })
      }
      return response
    },

    async fetchSavedBalances(tournamentId: number) {
      this.savedBalancesLoading = true
      const response = await listBalances(tournamentId)
      this.savedBalancesLoading = false
      if (response.success && response.data) {
        this.savedBalances = response.data.items
      }
      return response
    },

    selectBalance(index: number) {
      this.selectedBalanceIndex = index
    },

    reset() {
      this.roster = []
      this.balanceResults = []
      this.selectedBalanceIndex = null
    },
  },
})
