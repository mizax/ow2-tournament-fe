import { z } from 'zod/v4'
import { RoleValue } from '@/components/tournament/registration/types.ts'

const battleTagRegex =
  /(^([A-zÀ-ú][A-zÀ-ú0-9]{2,11})|(^([а-яёА-ЯЁÀ-ú][а-яёА-ЯЁ0-9À-ú]{2,11})))(#[0-9]{4,})$/
const discordRegex = /^[a-z0-9_\\.]{2,32}$/

const twitchSchema = z
  .stringFormat('', /^[A-Za-z0-9_]+$/, {
    error: 'tournament.registration_form.twitch.errors.allowed',
  })
  .min(4, { message: 'tournament.registration_form.twitch.errors.min' })
  .max(25, { message: 'tournament.registration_form.twitch.errors.max' })
  .refine((value) => !value.startsWith('_'), {
    message: 'tournament.registration_form.twitch.errors.starts_with_underscore',
  })
  .nonoptional()

const discordSchema = z
  .string()
  .regex(discordRegex, { error: 'tournament.registration_form.discord.errors.format' })
  .nonoptional()

const roleSchema = z
  .enum(RoleValue)
  .nonoptional({ error: 'tournament.registration_form.roles.errors.required' })

const battleTagSchema = z
  .string()
  .regex(discordRegex, { error: 'tournament.registration_form.battletag.errors.format' })

const additionalInfoSchema = z
  .string()
  .max(300, { message: 'tournament.registration_form.additional_info.errors.max' })

export const validateBattleTags = (value: string[]) => {
  const hasInvalidTag = value.some((tag) => !battleTagRegex.test(tag))

  if (hasInvalidTag) {
    return 'tournament.registration_form.battletag.errors.format'
  }
}

export const formSchema = z.object({
  altAccounts: z.array(battleTagSchema, {}).default([]),
  twitch: twitchSchema,
  discord: discordSchema,
  primaryRole: roleSchema,
  secondaryRole: roleSchema.optional(),
  guarantors: z.array(battleTagSchema).default([]),
  additionalInfo: additionalInfoSchema,
  rulesAccepted: z.literal(true, {
    error: 'tournament.registration_form.rules.errors.required',
  }),
}).superRefine((values, ctx) => {
  if (values.primaryRole !== RoleValue.FLEX && !values.secondaryRole) {
    ctx.addIssue({
      code: 'custom',
      message: 'tournament.registration_form.roles.errors.required',
      path: ['secondaryRole'],
    })
  }

  if (
    values.primaryRole &&
    values.secondaryRole &&
    values.primaryRole === values.secondaryRole
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'tournament.registration_form.roles.errors.duplicate',
      path: ['secondaryRole'],
    })
  }
})
