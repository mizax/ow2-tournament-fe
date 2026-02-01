import { describe, expect, it } from 'vitest'
import { formSchema, validateBattleTagOrDiscordArray, validateBattleTags } from '@/components/tournament/registration/TournamentRegistrationFormSchema'
import { RoleValue } from '@/components/tournament/registration/types'

describe('TournamentRegistrationFormSchema', () => {
  it('validateBattleTags returns error when tag invalid', () => {
    const result = validateBattleTags(['BadTag'])
    expect(result).toBe('tournament.registration_form.battletag.errors.format')
  })

  it('validateBattleTagOrDiscordArray allows battletag or discord', () => {
    const result = validateBattleTagOrDiscordArray(['Player#1234', 'valid_discord'])
    expect(result).toBeUndefined()
  })

  it('requires secondary role when primary is not FLEX', () => {
    const result = formSchema.safeParse({
      altAccounts: [],
      twitch: 'validtwitch',
      discord: 'valid_discord',
      primaryRole: RoleValue.TANK,
      additionalInfo: '',
      rulesAccepted: true,
      guarantors: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'tournament.registration_form.roles.errors.required',
      )
    }
  })

  it('rejects duplicate primary and secondary roles', () => {
    const result = formSchema.safeParse({
      altAccounts: [],
      twitch: 'validtwitch',
      discord: 'valid_discord',
      primaryRole: RoleValue.DAMAGE,
      secondaryRole: RoleValue.DAMAGE,
      additionalInfo: '',
      rulesAccepted: true,
      guarantors: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'tournament.registration_form.roles.errors.duplicate',
      )
    }
  })

  it('passes with FLEX primary and no secondary', () => {
    const result = formSchema.safeParse({
      altAccounts: [],
      twitch: 'validtwitch',
      discord: 'valid_discord',
      primaryRole: RoleValue.FLEX,
      additionalInfo: '',
      rulesAccepted: true,
      guarantors: [],
    })

    expect(result.success).toBe(true)
  })
})
