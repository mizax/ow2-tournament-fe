import { z } from 'zod/v4'

const sefTitleSchema = z
  .string()
  .min(3)
  .regex(/^[a-z0-9-]+$/, { error: 'Only lowercase letters, digits, hyphens' })

const organizerSchema = z.object({
  role: z.string().min(1),
  name: z.string().min(1),
  contact: z.string().optional(),
})

const subscriptionSchema = z.object({
  twitch_channel: z.string().optional(),
  donation_url: z.string().optional(),
  donation_amount_rub: z.number().positive().optional(),
})

const eligibilitySchema = z.object({
  min_rank: z.string().optional(),
  min_competitive_hours: z.number().nonnegative().optional(),
  min_calibrated_seasons: z.number().nonnegative().optional(),
  wins_current_season_main_role: z.number().nonnegative().optional(),
  subscription: subscriptionSchema.optional(),
  verification_battletag: z.string().optional(),
})

const isoDateTimeSchema = z.string().and(z.iso.datetime({ offset: true }))

const checkinSchema = z.object({
  from: isoDateTimeSchema.optional(),
  to: isoDateTimeSchema.optional(),
  platform: z.string().optional(),
  platform_url: z.string().optional(),
})

const registrationConfigSchema = z.object({
  start: isoDateTimeSchema.optional(),
  deadline: isoDateTimeSchema.optional(),
  checkin: checkinSchema.optional(),
})

const scheduleItemSchema = z.object({
  day: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stage: z.string(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
})

const prizePlaceSchema = z.object({
  place: z.number().int().positive(),
  amount: z.number().positive(),
})

const prizePoolSchema = z.object({
  currency: z.string().optional(),
  places: z.array(prizePlaceSchema),
})

const resultsPlacementSchema = z.object({
  place: z.number().int().positive(),
  team_name: z.string().min(1),
  captain_battletag: z.string().optional(),
})

export const tournamentEditSchema = z.object({
  title: z.string().min(3),
  sef_title: sefTitleSchema,
  discipline: z.string(),
  format: z.string(),
  type: z.string(),
  status: z.enum(['draft', 'upcoming', 'ongoing', 'finished']).optional(),
  organizers: z.array(organizerSchema).optional(),
  rules: z
    .object({
      full_rules_url: z.string().optional(),
      version: z.string().optional(),
      last_update: z.string().optional(),
    })
    .optional(),
  eligibility: eligibilitySchema.optional(),
  registration: registrationConfigSchema.optional(),
  teams: z
    .object({
      players_per_team: z.number().positive().optional(),
      format: z.string().optional(),
    })
    .optional(),
  schedule: z.array(scheduleItemSchema).min(1),
  match_format: z
    .object({
      group_stage: z.string().optional(),
      playoff: z.string().optional(),
      final: z.string().optional(),
    })
    .optional(),
  prize_pool: prizePoolSchema,
  stream: z
    .object({
      platform: z.string().optional(),
      channel: z.string().optional(),
    })
    .optional(),
  results: z
    .object({
      placements: z.array(resultsPlacementSchema).optional(),
      mvp: z.string().optional(),
      summary: z.string().optional(),
    })
    .optional(),
  media: z
    .object({
      vod_url: z.string().optional(),
      bracket_url: z.string().optional(),
    })
    .optional(),
  markdown: z
    .object({
      description: z.string().optional(),
      notes: z.string().optional(),
      full_regulation: z.string().optional(),
    })
    .optional(),
})

export type TournamentEditSchema = z.infer<typeof tournamentEditSchema>
