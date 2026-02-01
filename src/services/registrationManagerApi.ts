import { fetchWithAuth, type ApiResponse } from '@/services/apiService'
import type {
  CreateCommentRequest,
  ManagedTournament,
  RegistrationDetailResponse,
  RegistrationListResponse,
  RegistrationRequestedAction,
  RegistrationRoleRanking,
  RegistrationRow,
  RegistrationSummary,
  RoleRankingUpdateRequest,
  UpdateRegistrationStatusRequest,
} from '@/types/registrationManager'

export interface ListRegistrationsParams {
  tournamentId: number
  status?: string[]
  sort?: string
  page?: number
  perPage?: number
  battletag?: string
}

export async function fetchManagedTournaments(): Promise<ApiResponse<ManagedTournament[]>> {
  return fetchWithAuth<ManagedTournament[]>('/api/secured/v1/manager/tournaments')
}

export async function fetchRegistrations(
  params: ListRegistrationsParams,
): Promise<ApiResponse<RegistrationListResponse>> {
  const query = new URLSearchParams()
  query.set('tournament_id', String(params.tournamentId))

  if (params.status?.length) {
    query.set('status', params.status.join(','))
  }

  if (params.sort) {
    query.set('sort', params.sort)
  }

  if (params.page) {
    query.set('page', String(params.page))
  }

  if (params.perPage) {
    query.set('per_page', String(params.perPage))
  }

  if (params.battletag) {
    query.set('battletag', params.battletag)
  }

  return fetchWithAuth<RegistrationListResponse>(
    `/api/secured/v1/manager/registrations/?${query.toString()}`,
  )
}

export async function fetchRegistrationDetails(
  registrationId: number,
): Promise<ApiResponse<RegistrationDetailResponse>> {
  return fetchWithAuth<RegistrationDetailResponse>(
    `/api/secured/v1/manager/registrations/${registrationId}`,
  )
}

export async function createRegistrationComment(
  registrationId: number,
  payload: CreateCommentRequest,
): Promise<ApiResponse<RegistrationDetailResponse['comments'][number]>> {
  return fetchWithAuth<RegistrationDetailResponse['comments'][number]>(
    `/api/secured/v1/manager/registrations/${registrationId}/comments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )
}

export async function updateRegistrationStatus(
  registrationId: number,
  payload: UpdateRegistrationStatusRequest,
): Promise<ApiResponse<RegistrationDetailResponse>> {
  return fetchWithAuth<RegistrationDetailResponse>(
    `/api/secured/v1/manager/registrations/${registrationId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )
}

export async function updateRoleRankings(
  registrationId: number,
  payload: RoleRankingUpdateRequest,
): Promise<ApiResponse<RegistrationRoleRanking[]>> {
  return fetchWithAuth<RegistrationRoleRanking[]>(
    `/api/secured/v1/manager/registrations/${registrationId}/role-rankings`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )
}

export async function resolveRequestedAction(
  registrationId: number,
  actionId: number,
): Promise<ApiResponse<RegistrationRequestedAction>> {
  return fetchWithAuth<RegistrationRequestedAction>(
    `/api/secured/v1/manager/registrations/${registrationId}/actions/${actionId}/resolve`,
    {
      method: 'PATCH',
    },
  )
}
