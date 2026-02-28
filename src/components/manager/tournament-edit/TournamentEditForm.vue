<script setup lang="ts">
import { ref } from 'vue'
import { useForm, type AnyFieldApi } from '@tanstack/vue-form'
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

const tabs = [
  { key: 'main', label: 'Основное' },
  { key: 'organizers', label: 'Организаторы' },
  { key: 'eligibility', label: 'Требования' },
  { key: 'registration', label: 'Регистрация' },
  { key: 'teams', label: 'Команды' },
  { key: 'schedule', label: 'Расписание' },
  { key: 'match-format', label: 'Формат матчей' },
  { key: 'prize', label: 'Призовой фонд' },
  { key: 'stream', label: 'Трансляция' },
  { key: 'results', label: 'Результаты' },
  { key: 'media', label: 'Медиа' },
  { key: 'markdown', label: 'Markdown' },
  { key: 'rules', label: 'Правила' },
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
    await props.onSubmit(value)
  },
})

const isInvalid = (field: AnyFieldApi) => field.state.meta.isTouched && !field.state.meta.isValid

const setFormValue = (path: string, value: unknown) => {
  form.setFieldValue(path as never, value as never)
}

const parseNumber = (value: string): number | undefined => {
  if (value.trim() === '') {
    return undefined
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const parseInteger = (value: string): number | undefined => {
  const parsed = parseNumber(value)
  return parsed === undefined ? undefined : Math.trunc(parsed)
}

const toLocalDateTimeInput = (value?: string): string => {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const fromLocalDateTimeInput = (value: string): string | undefined => {
  if (!value) {
    return undefined
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date.toISOString()
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
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="main" class="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Основные поля</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup class="grid gap-4 md:grid-cols-2">
              <form.Field name="title" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">Название</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    @update:model-value="field.handleChange($event as string)"
                    @blur="field.handleBlur"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="sef_title" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">SEF slug</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    @update:model-value="field.handleChange($event as string)"
                    @blur="field.handleBlur"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="discipline" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">Дисциплина</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    @update:model-value="field.handleChange($event as string)"
                    @blur="field.handleBlur"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="format" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">Формат</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    @update:model-value="field.handleChange($event as string)"
                    @blur="field.handleBlur"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="type" #default="{ field }">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.name">Тип</FieldLabel>
                  <Input
                    :id="field.name"
                    :name="field.name"
                    :model-value="field.state.value"
                    @update:model-value="field.handleChange($event as string)"
                    @blur="field.handleBlur"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
                </Field>
              </form.Field>

              <form.Field name="status" #default="{ field }">
                <Field>
                  <FieldLabel>Статус</FieldLabel>
                  <Select
                    :model-value="field.state.value"
                    @update:model-value="(value) => field.handleChange(value as 'upcoming' | 'ongoing' | 'finished' | undefined)"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">upcoming</SelectItem>
                      <SelectItem value="ongoing">ongoing</SelectItem>
                      <SelectItem value="finished">finished</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </form.Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="organizers" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Организаторы</CardTitle>
            <Button type="button" variant="outline" size="sm" @click="addOrganizer">
              <Plus class="mr-1 size-4" /> Добавить
            </Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-for="(item, index) in organizers" :key="`org-${index}`" class="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <Input
                :model-value="item.role"
                placeholder="Роль"
                @update:model-value="(value) => { item.role = value as string; syncOrganizers() }"
              />
              <Input
                :model-value="item.name"
                placeholder="Имя"
                @update:model-value="(value) => { item.name = value as string; syncOrganizers() }"
              />
              <Input
                :model-value="item.contact"
                placeholder="Контакт"
                @update:model-value="(value) => { item.contact = value as string; syncOrganizers() }"
              />
              <Button type="button" variant="ghost" size="icon" @click="removeOrganizer(index)">
                <Trash2 class="size-4" />
              </Button>
            </div>
            <p v-if="!organizers.length" class="text-sm text-muted-foreground">Список пуст</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="eligibility" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Требования</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-2">
            <Input
              :model-value="eligibility.min_rank"
              placeholder="Минимальный ранг"
              @update:model-value="(value) => { eligibility.min_rank = value as string; syncEligibility() }"
            />
            <Input
              :model-value="eligibility.verification_battletag"
              placeholder="BattleTag для верификации"
              @update:model-value="(value) => { eligibility.verification_battletag = value as string; syncEligibility() }"
            />
            <Input
              type="number"
              :model-value="eligibility.min_competitive_hours ?? ''"
              placeholder="Минимум соревновательных часов"
              @update:model-value="(value) => { eligibility.min_competitive_hours = parseNumber(String(value)); syncEligibility() }"
            />
            <Input
              type="number"
              :model-value="eligibility.min_calibrated_seasons ?? ''"
              placeholder="Минимум калиброванных сезонов"
              @update:model-value="(value) => { eligibility.min_calibrated_seasons = parseNumber(String(value)); syncEligibility() }"
            />
            <Input
              type="number"
              :model-value="eligibility.wins_current_season_main_role ?? ''"
              placeholder="Побед в текущем сезоне"
              @update:model-value="(value) => { eligibility.wins_current_season_main_role = parseNumber(String(value)); syncEligibility() }"
            />
            <Input
              :model-value="eligibility.subscription?.twitch_channel"
              placeholder="Twitch канал подписки"
              @update:model-value="(value) => {
                eligibility.subscription = { ...(eligibility.subscription ?? {}), twitch_channel: value as string }
                syncEligibility()
              }"
            />
            <Input
              :model-value="eligibility.subscription?.donation_url"
              placeholder="Ссылка на донат"
              @update:model-value="(value) => {
                eligibility.subscription = { ...(eligibility.subscription ?? {}), donation_url: value as string }
                syncEligibility()
              }"
            />
            <Input
              type="number"
              :model-value="eligibility.subscription?.donation_amount_rub ?? ''"
              placeholder="Сумма доната (RUB)"
              @update:model-value="(value) => {
                eligibility.subscription = {
                  ...(eligibility.subscription ?? {}),
                  donation_amount_rub: parseNumber(String(value)),
                }
                syncEligibility()
              }"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="registration" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Регистрация</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-2">
            <Input
              type="datetime-local"
              :model-value="toLocalDateTimeInput(registration.start)"
              placeholder="Начало регистрации"
              @update:model-value="(value) => { registration.start = fromLocalDateTimeInput(String(value)); syncRegistration() }"
            />
            <Input
              type="datetime-local"
              :model-value="toLocalDateTimeInput(registration.deadline)"
              placeholder="Дедлайн регистрации"
              @update:model-value="(value) => { registration.deadline = fromLocalDateTimeInput(String(value)); syncRegistration() }"
            />
            <Input
              :model-value="registration.checkin?.from"
              placeholder="Чекин с"
              @update:model-value="(value) => {
                registration.checkin = { ...(registration.checkin ?? {}), from: value as string }
                syncRegistration()
              }"
            />
            <Input
              :model-value="registration.checkin?.to"
              placeholder="Чекин до"
              @update:model-value="(value) => {
                registration.checkin = { ...(registration.checkin ?? {}), to: value as string }
                syncRegistration()
              }"
            />
            <Input
              :model-value="registration.checkin?.platform"
              placeholder="Платформа чекина"
              @update:model-value="(value) => {
                registration.checkin = { ...(registration.checkin ?? {}), platform: value as string }
                syncRegistration()
              }"
            />
            <Input
              :model-value="registration.checkin?.platform_url"
              placeholder="Ссылка на платформу чекина"
              @update:model-value="(value) => {
                registration.checkin = { ...(registration.checkin ?? {}), platform_url: value as string }
                syncRegistration()
              }"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="teams" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Команды</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-2">
            <Input
              type="number"
              :model-value="teams.players_per_team ?? ''"
              placeholder="Игроков в команде"
              @update:model-value="(value) => { teams.players_per_team = parseNumber(String(value)); syncTeams() }"
            />
            <Input
              :model-value="teams.format"
              placeholder="Формат команды"
              @update:model-value="(value) => { teams.format = value as string; syncTeams() }"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="schedule" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Расписание</CardTitle>
            <Button type="button" variant="outline" size="sm" @click="addScheduleItem">
              <Plus class="mr-1 size-4" /> Добавить
            </Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-for="(item, index) in schedule" :key="`schedule-${index}`" class="grid gap-3 md:grid-cols-[100px_170px_1fr_140px_auto]">
              <Input
                type="number"
                :model-value="item.day"
                placeholder="День"
                @update:model-value="(value) => { item.day = parseInteger(String(value)) ?? 1; syncSchedule() }"
              />
              <Input
                :model-value="item.date"
                placeholder="YYYY-MM-DD"
                @update:model-value="(value) => { item.date = value as string; syncSchedule() }"
              />
              <Input
                :model-value="item.stage"
                placeholder="Этап"
                @update:model-value="(value) => { item.stage = value as string; syncSchedule() }"
              />
              <Input
                :model-value="item.start_time"
                placeholder="HH:MM"
                @update:model-value="(value) => { item.start_time = value as string; syncSchedule() }"
              />
              <Button type="button" variant="ghost" size="icon" @click="removeScheduleItem(index)">
                <Trash2 class="size-4" />
              </Button>
            </div>
            <p
              v-if="scheduleAutoNotice"
              class="rounded-md border border-amber-300/50 bg-amber-100/40 px-3 py-2 text-xs text-amber-900"
            >
              Расписание обязательно. Добавлена пустая строка, заполните ее перед сохранением.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="match-format" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Формат матчей</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-3">
            <Input
              :model-value="matchFormat.group_stage"
              placeholder="Групповой этап"
              @update:model-value="(value) => { matchFormat.group_stage = value as string; syncMatchFormat() }"
            />
            <Input
              :model-value="matchFormat.playoff"
              placeholder="Плей-офф"
              @update:model-value="(value) => { matchFormat.playoff = value as string; syncMatchFormat() }"
            />
            <Input
              :model-value="matchFormat.final"
              placeholder="Финал"
              @update:model-value="(value) => { matchFormat.final = value as string; syncMatchFormat() }"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="prize" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Призовой фонд</CardTitle>
            <Button type="button" variant="outline" size="sm" @click="addPrizePlace">
              <Plus class="mr-1 size-4" /> Добавить место
            </Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <Input
              :model-value="prizeCurrency"
              placeholder="Валюта"
              @update:model-value="(value) => { prizeCurrency = value as string; syncPrizePool() }"
            />
            <div v-for="(item, index) in prizePlaces" :key="`prize-${index}`" class="grid gap-3 md:grid-cols-[120px_1fr_auto]">
              <Input
                type="number"
                :model-value="item.place"
                placeholder="Место"
                @update:model-value="(value) => { item.place = parseInteger(String(value)) ?? 1; syncPrizePool() }"
              />
              <Input
                type="number"
                step="0.01"
                :model-value="item.amount"
                placeholder="Сумма"
                @update:model-value="(value) => { item.amount = parseNumber(String(value)) ?? 0; syncPrizePool() }"
              />
              <Button type="button" variant="ghost" size="icon" @click="removePrizePlace(index)">
                <Trash2 class="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stream" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Трансляция</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-2">
            <Input
              :model-value="stream.platform"
              placeholder="Платформа"
              @update:model-value="(value) => { stream.platform = value as string; syncStream() }"
            />
            <Input
              :model-value="stream.channel"
              placeholder="Канал"
              @update:model-value="(value) => { stream.channel = value as string; syncStream() }"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="results" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Результаты</CardTitle>
            <Button type="button" variant="outline" size="sm" @click="addResultPlacement">
              <Plus class="mr-1 size-4" /> Добавить место
            </Button>
          </CardHeader>
          <CardContent class="space-y-3">
            <Textarea
              :model-value="results.summary"
              placeholder="Краткий итог турнира"
              class="min-h-[110px]"
              @update:model-value="(value) => { results.summary = value as string; syncResults() }"
            />
            <Input
              :model-value="results.mvp"
              placeholder="MVP"
              @update:model-value="(value) => { results.mvp = value as string; syncResults() }"
            />
            <div v-for="(item, index) in resultPlacements" :key="`result-${index}`" class="grid gap-3 md:grid-cols-[120px_1fr_1fr_auto]">
              <Input
                type="number"
                :model-value="item.place"
                placeholder="Место"
                @update:model-value="(value) => { item.place = parseInteger(String(value)) ?? 1; syncResults() }"
              />
              <Input
                :model-value="item.team_name"
                placeholder="Название команды"
                @update:model-value="(value) => { item.team_name = value as string; syncResults() }"
              />
              <Input
                :model-value="item.captain_battletag"
                placeholder="Captain battletag"
                @update:model-value="(value) => { item.captain_battletag = value as string; syncResults() }"
              />
              <Button type="button" variant="ghost" size="icon" @click="removeResultPlacement(index)">
                <Trash2 class="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="media" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Медиа</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-2">
            <Input
              :model-value="media.vod_url"
              placeholder="Ссылка на VOD"
              @update:model-value="(value) => { media.vod_url = value as string; syncMedia() }"
            />
            <Input
              :model-value="media.bracket_url"
              placeholder="Ссылка на сетку"
              @update:model-value="(value) => { media.bracket_url = value as string; syncMedia() }"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="markdown" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Markdown</CardTitle></CardHeader>
          <CardContent class="space-y-3">
            <Textarea
              :model-value="markdown.description"
              placeholder="Описание"
              class="min-h-[120px]"
              @update:model-value="(value) => { markdown.description = value as string; syncMarkdown() }"
            />
            <Textarea
              :model-value="markdown.notes"
              placeholder="Заметки"
              class="min-h-[120px]"
              @update:model-value="(value) => { markdown.notes = value as string; syncMarkdown() }"
            />
            <Textarea
              :model-value="markdown.full_regulation"
              placeholder="Полный регламент"
              class="min-h-[220px]"
              @update:model-value="(value) => { markdown.full_regulation = value as string; syncMarkdown() }"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rules" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Правила</CardTitle></CardHeader>
          <CardContent class="grid gap-3 md:grid-cols-3">
            <Input
              :model-value="rules.version"
              placeholder="Версия"
              @update:model-value="(value) => { rules.version = value as string; syncRules() }"
            />
            <Input
              :model-value="rules.last_update"
              placeholder="Последнее обновление (YYYY-MM-DD)"
              @update:model-value="(value) => { rules.last_update = value as string; syncRules() }"
            />
            <Input
              :model-value="rules.full_rules_url"
              placeholder="Ссылка на правила"
              @update:model-value="(value) => { rules.full_rules_url = value as string; syncRules() }"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <form.Subscribe>
      <template #default="{ isValid, isSubmitting }">
        <Button type="submit" :disabled="!isValid || isSubmitting">
          {{ isSubmitting ? 'Сохранение...' : 'Сохранить турнир' }}
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
