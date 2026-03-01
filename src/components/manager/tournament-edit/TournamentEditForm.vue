<script setup lang="ts">
import { ref } from 'vue'
import { useForm, type AnyFieldApi } from '@tanstack/vue-form'
import { useI18n } from 'vue-i18n'
import { Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import DatePickerField from '@/components/shared/DatePickerField.vue'
import DateTimePickerField from '@/components/shared/DateTimePickerField.vue'
import MarkdownEditorField from '@/components/shared/MarkdownEditorField.vue'
import NumberFieldInput from '@/components/shared/NumberFieldInput.vue'
import type {
  TournamentEditFormValues,
  TournamentEligibility,
  TournamentMatchFormat,
  TournamentMedia,
  TournamentMarkdown,
  TournamentOrganizer,
  TournamentPrizePlace,
  TournamentRegistrationConfig,
  TournamentResultPlace,
  TournamentResults,
  TournamentRules,
  TournamentScheduleItem,
  TournamentStream,
  TournamentTeams,
} from '@/types/tournament-manager'
import { tournamentEditSchema } from './TournamentEditFormSchema'

const props = defineProps<{
  initialValues: TournamentEditFormValues
  onSubmit: (values: TournamentEditFormValues) => Promise<void>
}>()

const { t } = useI18n()

const tabs = [
  { key: 'main', labelKey: 'manager.tournament_edit.tabs.main' },
  { key: 'organizers', labelKey: 'manager.tournament_edit.tabs.organizers' },
  { key: 'eligibility', labelKey: 'manager.tournament_edit.tabs.eligibility' },
  { key: 'registration', labelKey: 'manager.tournament_edit.tabs.registration' },
  { key: 'teams', labelKey: 'manager.tournament_edit.tabs.teams' },
  { key: 'schedule', labelKey: 'manager.tournament_edit.tabs.schedule' },
  { key: 'match-format', labelKey: 'manager.tournament_edit.tabs.match_format' },
  { key: 'prize', labelKey: 'manager.tournament_edit.tabs.prize' },
  { key: 'stream', labelKey: 'manager.tournament_edit.tabs.stream' },
  { key: 'results', labelKey: 'manager.tournament_edit.tabs.results' },
  { key: 'media', labelKey: 'manager.tournament_edit.tabs.media' },
  { key: 'rules', labelKey: 'manager.tournament_edit.tabs.rules' },
] as const

function normalizeInitialValues(initial: TournamentEditFormValues): TournamentEditFormValues {
  return {
    title: initial.title ?? '',
    sef_title: initial.sef_title ?? '',
    discipline: initial.discipline ?? '',
    format: initial.format ?? '',
    type: initial.type ?? '',
    status: initial.status,
    organizers: initial.organizers ?? [],
    rules: initial.rules ?? {},
    eligibility: initial.eligibility ?? {},
    registration: initial.registration ?? {},
    teams: initial.teams ?? {},
    schedule:
      initial.schedule?.length > 0
        ? initial.schedule
        : [{ day: 1, date: '', stage: '', start_time: '00:00' }],
    match_format: initial.match_format ?? {},
    prize_pool: {
      currency: initial.prize_pool?.currency ?? '',
      places: initial.prize_pool?.places ?? [],
    },
    stream: initial.stream ?? {},
    results: initial.results ?? {},
    media: initial.media ?? {},
    markdown: initial.markdown ?? {},
  }
}

const defaults = normalizeInitialValues(props.initialValues)

const organizers = ref<TournamentOrganizer[]>([...(defaults.organizers ?? [])])
const schedule = ref<TournamentScheduleItem[]>([...defaults.schedule])
const prizePlaces = ref<TournamentPrizePlace[]>([...(defaults.prize_pool.places ?? [])])
const resultPlacements = ref<TournamentResultPlace[]>([...(defaults.results?.placements ?? [])])
const scheduleAutoNotice = ref(false)

const eligibility = ref<TournamentEligibility>({ ...(defaults.eligibility ?? {}) })
const registration = ref<TournamentRegistrationConfig>({ ...(defaults.registration ?? {}) })
const teams = ref<TournamentTeams>({ ...(defaults.teams ?? {}) })
const matchFormat = ref<TournamentMatchFormat>({ ...(defaults.match_format ?? {}) })
const stream = ref<TournamentStream>({ ...(defaults.stream ?? {}) })
const results = ref<TournamentResults>({
  mvp: defaults.results?.mvp,
  summary: defaults.results?.summary,
})
const media = ref<TournamentMedia>({ ...(defaults.media ?? {}) })
const markdown = ref<TournamentMarkdown>({ ...(defaults.markdown ?? {}) })
const rules = ref<TournamentRules>({ ...(defaults.rules ?? {}) })
const prizeCurrency = ref(defaults.prize_pool.currency ?? '')

const form = useForm({
  defaultValues: defaults,
  validators: {
    onChange: tournamentEditSchema,
    onSubmit: tournamentEditSchema,
  },
  onSubmit: async ({ value }) => {
    await props.onSubmit({
      ...value,
      schedule: value.schedule.filter((item) => item.date !== ''),
    })
  },
})

const isInvalid = (field: AnyFieldApi) => field.state.meta.isTouched && !field.state.meta.isValid

const setFormValue = (path: string, value: unknown) => {
  form.setFieldValue(path as never, value as never)
}

const parseTime = (value: string | undefined): string => {
  if (!value) {
    return ''
  }
  return value.slice(0, 5)
}

const syncOrganizers = () => {
  setFormValue('organizers', organizers.value.length ? organizers.value : undefined)
}

const addOrganizer = () => {
  organizers.value.push({ role: '', name: '', contact: '' })
  syncOrganizers()
}

const removeOrganizer = (index: number) => {
  organizers.value.splice(index, 1)
  syncOrganizers()
}

const syncSchedule = () => {
  if (schedule.value.length === 0) {
    schedule.value.push({ day: 1, date: '', stage: '', start_time: '00:00' })
    scheduleAutoNotice.value = true
  } else {
    scheduleAutoNotice.value = false
  }
  setFormValue('schedule', schedule.value)
}

const addScheduleItem = () => {
  schedule.value.push({ day: schedule.value.length + 1, date: '', stage: '', start_time: '00:00' })
  syncSchedule()
}

const removeScheduleItem = (index: number) => {
  schedule.value.splice(index, 1)
  syncSchedule()
}

const syncPrizePool = () => {
  setFormValue('prize_pool', {
    currency: prizeCurrency.value,
    places: prizePlaces.value.length ? prizePlaces.value : undefined,
  })
}

const addPrizePlace = () => {
  prizePlaces.value.push({ place: prizePlaces.value.length + 1, amount: 0 })
  syncPrizePool()
}

const removePrizePlace = (index: number) => {
  prizePlaces.value.splice(index, 1)
  syncPrizePool()
}

const syncResults = () => {
  setFormValue('results', {
    ...results.value,
    placements: resultPlacements.value.length ? resultPlacements.value : undefined,
  })
}

const addResultPlacement = () => {
  resultPlacements.value.push({ place: resultPlacements.value.length + 1, team_name: '' })
  syncResults()
}

const removeResultPlacement = (index: number) => {
  resultPlacements.value.splice(index, 1)
  syncResults()
}

const syncEligibility = () => setFormValue('eligibility', eligibility.value)
const syncRegistration = () => setFormValue('registration', registration.value)
const syncTeams = () => setFormValue('teams', teams.value)
const syncMatchFormat = () => setFormValue('match_format', matchFormat.value)
const syncStream = () => setFormValue('stream', stream.value)
const syncMedia = () => setFormValue('media', media.value)
const syncMarkdown = () => setFormValue('markdown', markdown.value)
const syncRules = () => setFormValue('rules', rules.value)

syncOrganizers()
syncSchedule()
syncPrizePool()
syncResults()
syncEligibility()
syncRegistration()
syncTeams()
syncMatchFormat()
syncStream()
syncMedia()
syncMarkdown()
syncRules()
</script>

<template>
  <form class="space-y-4" @submit.prevent="form.handleSubmit">
    <Tabs default-value="main" class="w-full">
      <TabsList class="tabs-scroll flex w-full flex-nowrap items-center justify-start gap-1 overflow-x-auto">
        <TabsTrigger v-for="tab in tabs" :key="tab.key" :value="tab.key">
          {{ t(tab.labelKey) }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="main" class="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{{ t('manager.tournament_edit.sections.main') }}</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup class="grid gap-4 md:grid-cols-2">
              <form.Field name="title" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">{{ t('manager.tournament_edit.fields.title') }}</FieldLabel>
                  <Input :id="field.name" :name="field.name" :model-value="field.state.value" @update:model-value="field.handleChange($event as string)" @blur="field.handleBlur" />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="sef_title" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">{{ t('manager.tournament_edit.fields.sef_title') }}</FieldLabel>
                  <Input :id="field.name" :name="field.name" :model-value="field.state.value" @update:model-value="field.handleChange($event as string)" @blur="field.handleBlur" />
                  <p class="text-xs text-muted-foreground">{{ t('manager.tournament_edit.hints.sef_title') }}</p>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="discipline" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">{{ t('manager.tournament_edit.fields.discipline') }}</FieldLabel>
                  <Input :id="field.name" :name="field.name" :model-value="field.state.value" @update:model-value="field.handleChange($event as string)" @blur="field.handleBlur" />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="format" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">{{ t('manager.tournament_edit.fields.format') }}</FieldLabel>
                  <Input :id="field.name" :name="field.name" :model-value="field.state.value" @update:model-value="field.handleChange($event as string)" @blur="field.handleBlur" />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="type" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">{{ t('manager.tournament_edit.fields.type') }}</FieldLabel>
                  <Input :id="field.name" :name="field.name" :model-value="field.state.value" @update:model-value="field.handleChange($event as string)" @blur="field.handleBlur" />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="status" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel>{{ t('manager.tournament_edit.fields.status') }}</FieldLabel>
                  <Select :model-value="field.state.value" @update:model-value="(value) => field.handleChange(value as 'draft' | 'upcoming' | 'ongoing' | 'finished' | undefined)">
                    <SelectTrigger><SelectValue :placeholder="t('manager.tournament_edit.placeholders.select_status')" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{{ t('tournament.status.draft') }}</SelectItem>
                      <SelectItem value="upcoming">{{ t('tournament.status.upcoming') }}</SelectItem>
                      <SelectItem value="ongoing">{{ t('tournament.status.ongoing') }}</SelectItem>
                      <SelectItem value="finished">{{ t('tournament.status.finished') }}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>
            </FieldGroup>
            <Separator class="my-4" />
            <div class="space-y-3">
              <div class="space-y-1">
                <FieldLabel>{{ t('manager.tournament_edit.fields.description') }}</FieldLabel>
                <MarkdownEditorField
                  :model-value="markdown.description"
                  class="min-h-[140px]"
                  @update:model-value="(value) => { markdown.description = value as string; syncMarkdown() }"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="organizers" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>{{ t('manager.tournament_edit.sections.organizers') }}</CardTitle>
            <Button type="button" variant="outline" size="sm" @click="addOrganizer"><Plus class="mr-1 size-4" /> {{ t('manager.tournament_edit.actions.add') }}</Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="grid gap-3 grid-cols-[1fr_1fr_1fr_auto] text-xs text-muted-foreground">
              <span>{{ t('manager.tournament_edit.columns.role') }}</span><span>{{ t('manager.tournament_edit.columns.name') }}</span><span>{{ t('manager.tournament_edit.columns.contact') }}</span><span></span>
            </div>
            <div v-for="(item, index) in organizers" :key="`org-${index}`" class="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <Input :model-value="item.role" :placeholder="t('manager.tournament_edit.columns.role')" :aria-label="t('manager.tournament_edit.columns.role')" @update:model-value="(value) => { item.role = value as string; syncOrganizers() }" />
              <Input :model-value="item.name" :placeholder="t('manager.tournament_edit.columns.name')" :aria-label="t('manager.tournament_edit.columns.name')" @update:model-value="(value) => { item.name = value as string; syncOrganizers() }" />
              <Input :model-value="item.contact" :placeholder="t('manager.tournament_edit.columns.contact')" :aria-label="t('manager.tournament_edit.columns.contact')" @update:model-value="(value) => { item.contact = value as string; syncOrganizers() }" />
              <Button type="button" variant="ghost" size="icon" @click="removeOrganizer(index)"><Trash2 class="size-4" /></Button>
            </div>
            <p v-if="!organizers.length" class="text-sm text-muted-foreground">{{ t('manager.tournament_edit.empty') }}</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="eligibility" class="mt-4">
        <Card>
          <CardHeader><CardTitle>{{ t('manager.tournament_edit.sections.eligibility') }}</CardTitle></CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-3 md:grid-cols-2">
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.min_rank') }}</FieldLabel><Input :model-value="eligibility.min_rank" :placeholder="t('manager.tournament_edit.placeholders.min_rank')" @update:model-value="(value) => { eligibility.min_rank = value as string; syncEligibility() }" /></div>
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.verification_battletag') }}</FieldLabel><Input :model-value="eligibility.verification_battletag" :placeholder="t('manager.tournament_edit.placeholders.verification_battletag')" @update:model-value="(value) => { eligibility.verification_battletag = value as string; syncEligibility() }" /></div>
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.min_competitive_hours') }}</FieldLabel><NumberFieldInput :model-value="eligibility.min_competitive_hours" :min="0" @update:model-value="(value) => { eligibility.min_competitive_hours = value; syncEligibility() }" /></div>
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.min_calibrated_seasons') }}</FieldLabel><NumberFieldInput :model-value="eligibility.min_calibrated_seasons" :min="0" @update:model-value="(value) => { eligibility.min_calibrated_seasons = value; syncEligibility() }" /></div>
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.wins_current_season') }}</FieldLabel><NumberFieldInput :model-value="eligibility.wins_current_season_main_role" :min="0" @update:model-value="(value) => { eligibility.wins_current_season_main_role = value; syncEligibility() }" /></div>
            </div>

            <Separator />
            <div class="space-y-2">
              <p class="text-sm font-medium">{{ t('manager.tournament_edit.sections.subscription_requirements') }}</p>
              <div class="grid gap-3 md:grid-cols-2">
                <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.twitch_channel') }}</FieldLabel><Input :model-value="eligibility.subscription?.twitch_channel" :placeholder="t('manager.tournament_edit.placeholders.twitch_channel')" @update:model-value="(value) => { eligibility.subscription = { ...(eligibility.subscription ?? {}), twitch_channel: value as string }; syncEligibility() }" /></div>
                <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.donation_amount') }}</FieldLabel><NumberFieldInput :model-value="eligibility.subscription?.donation_amount_rub" :min="0" :step="100" @update:model-value="(value) => { eligibility.subscription = { ...(eligibility.subscription ?? {}), donation_amount_rub: value }; syncEligibility() }" /></div>
                <div class="space-y-1 md:col-span-2"><FieldLabel>{{ t('manager.tournament_edit.fields.donation_url') }}</FieldLabel><Input :model-value="eligibility.subscription?.donation_url" :placeholder="t('manager.tournament_edit.placeholders.url')" @update:model-value="(value) => { eligibility.subscription = { ...(eligibility.subscription ?? {}), donation_url: value as string }; syncEligibility() }" /></div>
              </div>
            </div>
            <Separator />
            <div class="space-y-1">
              <FieldLabel>{{ t('manager.tournament_edit.fields.eligibility_notes') }}</FieldLabel>
              <MarkdownEditorField
                :model-value="markdown.notes"
                class="min-h-[120px]"
                @update:model-value="(value) => { markdown.notes = value as string; syncMarkdown() }"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="registration" class="mt-4">
        <Card>
          <CardHeader><CardTitle>{{ t('manager.tournament_edit.sections.registration') }}</CardTitle></CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-3 md:grid-cols-2">
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.registration_start') }}</FieldLabel><DateTimePickerField :model-value="registration.start" @update:model-value="(value) => { registration.start = value; syncRegistration() }" /></div>
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.registration_deadline') }}</FieldLabel><DateTimePickerField :model-value="registration.deadline" @update:model-value="(value) => { registration.deadline = value; syncRegistration() }" /></div>
            </div>
            <Separator />
            <div class="space-y-2">
              <p class="text-sm font-medium">{{ t('manager.tournament_edit.sections.checkin') }}</p>
              <div class="grid gap-3 md:grid-cols-2">
                <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.from') }}</FieldLabel><Input type="time" :model-value="parseTime(registration.checkin?.from)" @update:model-value="(value) => { registration.checkin = { ...(registration.checkin ?? {}), from: String(value) }; syncRegistration() }" /></div>
                <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.to') }}</FieldLabel><Input type="time" :model-value="parseTime(registration.checkin?.to)" @update:model-value="(value) => { registration.checkin = { ...(registration.checkin ?? {}), to: String(value) }; syncRegistration() }" /></div>
                <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.platform') }}</FieldLabel><Input :model-value="registration.checkin?.platform" @update:model-value="(value) => { registration.checkin = { ...(registration.checkin ?? {}), platform: String(value) }; syncRegistration() }" /></div>
                <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.platform_url') }}</FieldLabel><Input :model-value="registration.checkin?.platform_url" @update:model-value="(value) => { registration.checkin = { ...(registration.checkin ?? {}), platform_url: String(value) }; syncRegistration() }" /></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="teams" class="mt-4">
        <Card>
          <CardHeader><CardTitle>{{ t('manager.tournament_edit.sections.teams') }}</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-2">
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.players_per_team') }}</FieldLabel><NumberFieldInput :model-value="teams.players_per_team" :min="1" @update:model-value="(value) => { teams.players_per_team = value; syncTeams() }" /></div>
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.team_format') }}</FieldLabel><Input :model-value="teams.format" @update:model-value="(value) => { teams.format = value as string; syncTeams() }" /></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="schedule" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>{{ t('manager.tournament_edit.sections.schedule') }}</CardTitle>
            <Button type="button" variant="outline" size="sm" @click="addScheduleItem"><Plus class="mr-1 size-4" /> {{ t('manager.tournament_edit.actions.add') }}</Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="grid gap-3 grid-cols-[120px_1fr_1fr_180px_auto] text-xs text-muted-foreground">
              <span>{{ t('manager.tournament_edit.columns.day') }}</span><span>{{ t('manager.tournament_edit.columns.date') }}</span><span>{{ t('manager.tournament_edit.columns.stage') }}</span><span>{{ t('manager.tournament_edit.columns.start') }}</span><span></span>
            </div>
            <div v-for="(item, index) in schedule" :key="`schedule-${index}`" class="grid gap-3 md:grid-cols-[120px_1fr_1fr_180px_auto]">
              <NumberFieldInput :model-value="item.day" :min="1" @update:model-value="(value) => { item.day = value ?? 1; syncSchedule() }" />
              <DatePickerField :model-value="item.date" @update:model-value="(value) => { item.date = value ?? ''; syncSchedule() }" />
              <Input :model-value="item.stage" :placeholder="t('manager.tournament_edit.columns.stage')" @update:model-value="(value) => { item.stage = value as string; syncSchedule() }" />
              <Input type="time" :model-value="parseTime(item.start_time)" @update:model-value="(value) => { item.start_time = String(value); syncSchedule() }" />
              <Button type="button" variant="ghost" size="icon" @click="removeScheduleItem(index)"><Trash2 class="size-4" /></Button>
            </div>
            <p v-if="scheduleAutoNotice" class="rounded-md border border-amber-300/50 bg-amber-100/40 px-3 py-2 text-xs text-amber-900">
              {{ t('manager.tournament_edit.hints.schedule_required') }}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="match-format" class="mt-4">
        <Card>
          <CardHeader><CardTitle>{{ t('manager.tournament_edit.sections.match_format') }}</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-3">
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.group_stage') }}</FieldLabel><Input :model-value="matchFormat.group_stage" @update:model-value="(value) => { matchFormat.group_stage = value as string; syncMatchFormat() }" /></div>
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.playoff') }}</FieldLabel><Input :model-value="matchFormat.playoff" @update:model-value="(value) => { matchFormat.playoff = value as string; syncMatchFormat() }" /></div>
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.final') }}</FieldLabel><Input :model-value="matchFormat.final" @update:model-value="(value) => { matchFormat.final = value as string; syncMatchFormat() }" /></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="prize" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>{{ t('manager.tournament_edit.sections.prize') }}</CardTitle>
            <Button type="button" variant="outline" size="sm" @click="addPrizePlace"><Plus class="mr-1 size-4" /> {{ t('manager.tournament_edit.actions.add_place') }}</Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.currency') }}</FieldLabel><Input :model-value="prizeCurrency" placeholder="RUB" @update:model-value="(value) => { prizeCurrency = value as string; syncPrizePool() }" /></div>
            <div class="grid gap-3 grid-cols-[140px_1fr_auto] text-xs text-muted-foreground"><span>{{ t('manager.tournament_edit.columns.place') }}</span><span>{{ t('manager.tournament_edit.columns.amount') }}</span><span></span></div>
            <div v-for="(item, index) in prizePlaces" :key="`prize-${index}`" class="grid gap-3 md:grid-cols-[140px_1fr_auto]">
              <NumberFieldInput :model-value="item.place" :min="1" @update:model-value="(value) => { item.place = value ?? 1; syncPrizePool() }" />
              <NumberFieldInput :model-value="item.amount" :min="0" :step="500" @update:model-value="(value) => { item.amount = value ?? 0; syncPrizePool() }" />
              <Button type="button" variant="ghost" size="icon" @click="removePrizePlace(index)"><Trash2 class="size-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stream" class="mt-4">
        <Card>
          <CardHeader><CardTitle>{{ t('manager.tournament_edit.sections.stream') }}</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-2">
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.platform') }}</FieldLabel><Input :model-value="stream.platform" @update:model-value="(value) => { stream.platform = value as string; syncStream() }" /></div>
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.channel') }}</FieldLabel><Input :model-value="stream.channel" @update:model-value="(value) => { stream.channel = value as string; syncStream() }" /></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="results" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>{{ t('manager.tournament_edit.sections.results') }}</CardTitle>
            <Button type="button" variant="outline" size="sm" @click="addResultPlacement"><Plus class="mr-1 size-4" /> {{ t('manager.tournament_edit.actions.add_place') }}</Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.tournament_summary') }}</FieldLabel><Textarea :model-value="results.summary" class="min-h-[110px]" @update:model-value="(value) => { results.summary = value as string; syncResults() }" /></div>
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.mvp') }}</FieldLabel><Input :model-value="results.mvp" @update:model-value="(value) => { results.mvp = value as string; syncResults() }" /></div>
            <div class="grid gap-3 grid-cols-[140px_1fr_1fr_auto] text-xs text-muted-foreground"><span>{{ t('manager.tournament_edit.columns.place') }}</span><span>{{ t('manager.tournament_edit.columns.team') }}</span><span>{{ t('manager.tournament_edit.columns.captain_battletag') }}</span><span></span></div>
            <div v-for="(item, index) in resultPlacements" :key="`result-${index}`" class="grid gap-3 md:grid-cols-[140px_1fr_1fr_auto]">
              <NumberFieldInput :model-value="item.place" :min="1" @update:model-value="(value) => { item.place = value ?? 1; syncResults() }" />
              <Input :model-value="item.team_name" @update:model-value="(value) => { item.team_name = value as string; syncResults() }" />
              <Input :model-value="item.captain_battletag" @update:model-value="(value) => { item.captain_battletag = value as string; syncResults() }" />
              <Button type="button" variant="ghost" size="icon" @click="removeResultPlacement(index)"><Trash2 class="size-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="media" class="mt-4">
        <Card>
          <CardHeader><CardTitle>{{ t('manager.tournament_edit.sections.media') }}</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-2">
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.vod_url') }}</FieldLabel><Input :model-value="media.vod_url" @update:model-value="(value) => { media.vod_url = value as string; syncMedia() }" /></div>
            <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.bracket_url') }}</FieldLabel><Input :model-value="media.bracket_url" @update:model-value="(value) => { media.bracket_url = value as string; syncMedia() }" /></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rules" class="mt-4">
        <Card>
          <CardHeader><CardTitle>{{ t('manager.tournament_edit.sections.rules') }}</CardTitle></CardHeader>
          <CardContent class="space-y-3">
            <div class="grid gap-3 md:grid-cols-3">
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.version') }}</FieldLabel><Input :model-value="rules.version" @update:model-value="(value) => { rules.version = value as string; syncRules() }" /></div>
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.last_update') }}</FieldLabel><DatePickerField :model-value="rules.last_update" @update:model-value="(value) => { rules.last_update = value; syncRules() }" /></div>
              <div class="space-y-1"><FieldLabel>{{ t('manager.tournament_edit.fields.full_rules_url') }}</FieldLabel><Input :model-value="rules.full_rules_url" @update:model-value="(value) => { rules.full_rules_url = value as string; syncRules() }" /></div>
            </div>
            <Separator />
            <div class="space-y-1">
              <FieldLabel>{{ t('manager.tournament_edit.fields.full_regulation') }}</FieldLabel>
              <p class="text-xs text-muted-foreground">
                {{ t('manager.tournament_edit.hints.full_regulation_toc') }}
              </p>
              <MarkdownEditorField
                :model-value="markdown.full_regulation"
                class="min-h-[400px] font-mono text-sm"
                @update:model-value="(value) => { markdown.full_regulation = value as string; syncMarkdown() }"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <form.Subscribe>
      <template #default="{ isValid, isSubmitting }">
        <Button type="submit" :disabled="!isValid || isSubmitting">
          {{ isSubmitting ? t('manager.tournament_edit.actions.saving') : t('manager.tournament_edit.actions.save') }}
        </Button>
      </template>
    </form.Subscribe>
  </form>
</template>

<style scoped>
.tabs-scroll::-webkit-scrollbar {
  height: 6px;
}

.tabs-scroll::-webkit-scrollbar-thumb {
  background: color-mix(in oklab, hsl(var(--primary)) 35%, transparent);
  border-radius: 9999px;
}
</style>
