import { defineStore } from 'pinia'
import type {
  ManagedTournament,
  RegistrationDetailResponse,
  RegistrationSummary,
  RoleRankingAssignment,
  UpdateRegistrationStatusRequest,
} from '@/types/registrationManager'
import {
  createRegistrationComment,
  fetchManagedTournaments,
  fetchRegistrationDetails,
  fetchRegistrations,
  resolveRequestedAction,
  updateRegistrationStatus as updateRegistrationStatusApi,
  updateRoleRankings as updateRoleRankingsApi,
} from '@/services/registrationManagerApi'
import type { ApiResponse } from '@/services/apiService'

interface RegistrationManagerState {
  managedTournaments: ManagedTournament[]
  managedTournamentsLoading: boolean
  registrationsByTournament: Record<number, RegistrationSummary[]>
  registrationsLoadingByTournament: Record<number, boolean>
  registrationDetails: Record<number, RegistrationDetailResponse>
  registrationDetailsLoading: Record<number, boolean>
}

export const useRegistrationManagerStore = defineStore('registrationManager', {
  state: (): RegistrationManagerState => ({
    managedTournaments: [],
    managedTournamentsLoading: false,
    registrationsByTournament: {},
    registrationsLoadingByTournament: {},
    registrationDetails: {},
    registrationDetailsLoading: {},
  }),
  actions: {
    async loadManagedTournaments(): Promise<ApiResponse<ManagedTournament[]>> {
      this.managedTournamentsLoading = true
      const response = await fetchManagedTournaments()
      this.managedTournamentsLoading = false

      if (response.success && response.data) {
        this.managedTournaments = response.data
      }

      return response
    },
    async loadRegistrations(
      tournamentId: number,
    ): Promise<ApiResponse<RegistrationSummary[]>> {
      this.registrationsLoadingByTournament[tournamentId] = true
      const response = await fetchRegistrations({ tournamentId })
      this.registrationsLoadingByTournament[tournamentId] = false

      if (response.success && response.data) {
        this.registrationsByTournament[tournamentId] = response.data
      }

      return response
    },
    async loadRegistrationDetails(
      registrationId: number,
    ): Promise<ApiResponse<RegistrationDetailResponse>> {
      this.registrationDetailsLoading[registrationId] = true
      const response = await fetchRegistrationDetails(registrationId)
      this.registrationDetailsLoading[registrationId] = false

      if (response.success && response.data) {
        this.registrationDetails[registrationId] = response.data
      }

      return response
    },
    async updateRegistrationStatus(
      registrationId: number,
      payload: UpdateRegistrationStatusRequest,
    ) {
      const response = await updateRegistrationStatusApi(registrationId, payload)

      if (response.success && response.data) {
        const updated = response.data
        const details = this.registrationDetails[registrationId]
        if (details) {
          this.registrationDetails[registrationId] = {
            ...details,
            registration: updated,
          }
        }

        this.updateRegistrationSummary(updated.id, updated.status, updated.updated_at)
      }

      return response
    },
    async addRegistrationComment(registrationId: number, comment: string) {
      const response = await createRegistrationComment(registrationId, { comment })

      if (response.success && response.data) {
        const details = this.registrationDetails[registrationId]
        if (details) {
          this.registrationDetails[registrationId] = {
            ...details,
            comments: [...details.comments, response.data],
          }
        }
      }

      return response
    },
    async resolveRequestedAction(registrationId: number, actionId: number) {
      const response = await resolveRequestedAction(registrationId, actionId)

      if (response.success && response.data) {
        const details = this.registrationDetails[registrationId]
        if (details) {
          const updatedActions = details.requested_actions.map((action) =>
            action.id === response.data?.id ? response.data : action,
          )
          this.registrationDetails[registrationId] = {
            ...details,
            requested_actions: updatedActions,
          }
        }
      }

      return response
    },
    async updateRoleRankings(
      registrationId: number,
      assignments: RoleRankingAssignment[],
    ) {
      const response = await updateRoleRankingsApi(registrationId, {
        role_assignments: assignments,
      })

      if (response.success && response.data) {
        const details = this.registrationDetails[registrationId]
        if (details) {
          this.registrationDetails[registrationId] = {
            ...details,
            role_rankings: response.data,
          }
        }
      }

      return response
    },
    updateRegistrationSummary(registrationId: number, status: string, updatedAt?: string) {
      Object.entries(this.registrationsByTournament).forEach(([key, registrations]) => {
        const tournamentId = Number(key)
        if (!Number.isNaN(tournamentId)) {
          const index = registrations.findIndex((item) => item.id === registrationId)
          if (index !== -1) {
            const current = registrations[index]
            if (current) {
              registrations.splice(index, 1, {
                ...current,
                status: status as RegistrationSummary['status'],
                updated_at: updatedAt ?? current.updated_at,
              })
            }
          }
        }
      })
    },
  },
})
