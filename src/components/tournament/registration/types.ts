export enum RoleValue {
  TANK = "TANK",
  DAMAGE = "DAMAGE",
  SUPPORT = "SUPPORT",
  FLEX = "FLEX",
}

export const roleValues = Object.values(RoleValue)

export interface RoleOption {
  value: RoleValue
  labelKey: string
}

export interface RegistrationFormValues {
  altAccounts?: string[]
  twitch: string
  discord: string
  primaryRole?: RoleValue
  secondaryRole?: RoleValue
  guarantors?: string[]
  additionalInfo: string
  rulesAccepted: boolean
}

export type RegistrationArrayFieldName = {
  [K in keyof RegistrationFormValues]-?: RegistrationFormValues[K] extends string[] | undefined
    ? K
    : never
}[keyof RegistrationFormValues]

export type RegistrationRoleFieldName = 'primaryRole' | 'secondaryRole'

export type RegistrationFormApi = import('@tanstack/vue-form').FormApi<
  RegistrationFormValues,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
> &
  import('@tanstack/vue-form').VueFormApi<
    RegistrationFormValues,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
