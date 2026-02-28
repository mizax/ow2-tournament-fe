<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { RouterLink } from 'vue-router'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { fetchTournamentMatches, uploadMatchLog, type TournamentMatch } from '@/services/logsApi'

const route = useRoute()
const { t, te } = useI18n()

const tournamentId = computed(() => Number(route.params.tournamentId))

const matches = ref<TournamentMatch[]>([])
const matchesLoading = ref(false)
const matchesError = ref<string | null>(null)

const selectedMatchId = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const uploadResults = ref<{ name: string; success: boolean; error?: string }[]>([])

const selectedMatch = computed(
  () => matches.value.find((m) => m.id === selectedMatchId.value) ?? null,
)

onMounted(async () => {
  matchesLoading.value = true
  matchesError.value = null
  const res = await fetchTournamentMatches(tournamentId.value)
  matchesLoading.value = false
  if (res.success && res.data) {
    matches.value = res.data
  } else {
    matchesError.value = t('manager.logs.load_error')
  }
})

function onFilesChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFiles.value = input.files ? Array.from(input.files) : []
  uploadResults.value = []
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files) {
    selectedFiles.value = Array.from(files).filter((f) => f.name.endsWith('.txt'))
    uploadResults.value = []
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
}

function selectMatch(matchId: number) {
  selectedMatchId.value = matchId
  uploadResults.value = []
}

async function uploadFiles() {
  if (!selectedMatchId.value || !selectedFiles.value.length) return

  uploading.value = true
  uploadResults.value = []

  for (const file of selectedFiles.value) {
    try {
      const content = await file.text()
      const res = await uploadMatchLog(selectedMatchId.value, file.name, content)
      if (res.success) {
        uploadResults.value.push({ name: file.name, success: true })
      } else {
        const rawKey =
          res.errorData && typeof res.errorData === 'object' && 'error' in res.errorData
            ? String((res.errorData as { error: string }).error)
            : (res.errorCode ?? 'unknown_error')
        const suffix = rawKey.split('.').pop() ?? rawKey
        const errMsg = te(`manager.logs.errors.${suffix}`)
          ? t(`manager.logs.errors.${suffix}`)
          : t('errors.unknown')
        uploadResults.value.push({ name: file.name, success: false, error: errMsg })
      }
    } catch (e) {
      uploadResults.value.push({ name: file.name, success: false, error: String(e) })
    }
  }

  uploading.value = false

  const succeeded = uploadResults.value.filter((r) => r.success).length
  const failed = uploadResults.value.filter((r) => !r.success).length
  if (failed === 0) {
    toast.success(t('manager.logs.upload_success', { count: succeeded }))
  } else if (succeeded === 0) {
    toast.error(t('manager.logs.upload_failed_all'))
  } else {
    toast.warning(t('manager.logs.upload_partial', { succeeded, failed }))
  }
}
</script>

<template>
  <div class="page-shell mx-auto max-w-4xl py-8">
    <section class="page-head">
      <div class="mb-4">
        <Button variant="ghost" size="sm" :as="RouterLink" :to="{ name: 'manager-dashboard' }">
          ← {{ t('manager.registrations.back') }}
        </Button>
      </div>
      <div>
        <p class="page-kicker">Log Parser</p>
        <h1 class="page-title mt-2">{{ t('manager.logs.title') }}</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          {{ t('manager.logs.tournament_id', { id: tournamentId }) }}
        </p>
      </div>
    </section>

    <div
      v-if="matchesLoading"
      class="flex items-center gap-2 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Spinner class="animate-spin" />
      <span>{{ t('manager.logs.loading_matches') }}</span>
    </div>

    <div
      v-else-if="matchesError"
      class="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {{ matchesError }}
    </div>

    <div v-else class="space-y-6">
      <section class="space-y-3">
        <label class="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{{
          t('manager.logs.select_match')
        }}</label>
        <div class="grid gap-2">
          <button
            v-for="match in matches"
            :key="match.id"
            type="button"
            :aria-pressed="selectedMatchId === match.id"
            class="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3 text-left text-sm transition-colors hover:border-primary/35 hover:bg-primary/8"
            :class="selectedMatchId === match.id ? 'border-primary/50 bg-primary/10' : ''"
            @click="selectMatch(match.id)"
          >
            <span class="font-medium">
              {{ match.home_team_name }} vs {{ match.away_team_name }}
            </span>
            <span class="text-xs text-muted-foreground">
              #{{ match.id }} · {{ match.home_score }}:{{ match.away_score }}
            </span>
          </button>
        </div>
      </section>

      <section v-if="selectedMatchId" class="space-y-3 border-t border-border/60 pt-4">
        <label class="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{{
          t('manager.logs.select_files')
        }}</label>
        <div
          role="button"
          tabindex="0"
          :aria-label="t('manager.logs.select_files')"
          class="cursor-pointer rounded-xl border-2 border-dashed border-border/75 bg-background/35 p-8 text-center transition-colors hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          :class="selectedFiles.length ? 'border-primary/60 bg-primary/8' : 'bg-background/40'"
          @drop="onDrop"
          @dragover="onDragOver"
          @click="fileInput?.click()"
          @keydown.enter.prevent="fileInput?.click()"
          @keydown.space.prevent="fileInput?.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".txt"
            multiple
            class="hidden"
            @change="onFilesChange"
          />
          <p v-if="!selectedFiles.length" class="text-sm text-muted-foreground">
            {{ t('manager.logs.drop_hint') }}
          </p>
          <ul v-else class="space-y-1 text-left text-sm">
            <li v-for="file in selectedFiles" :key="file.name" class="text-foreground">
              {{ file.name }}
            </li>
          </ul>
        </div>
      </section>

      <div v-if="selectedMatchId && selectedFiles.length" class="flex items-center gap-3">
        <Button :disabled="uploading" @click="uploadFiles">
          <Spinner v-if="uploading" class="mr-2 h-4 w-4 animate-spin" />
          {{ uploading ? t('manager.logs.uploading') : t('manager.logs.upload_btn') }}
        </Button>
        <span v-if="selectedMatch" class="text-sm text-muted-foreground">
          {{ selectedMatch.home_team_name }} vs {{ selectedMatch.away_team_name }}
        </span>
      </div>

      <div v-if="uploadResults.length" class="space-y-1">
        <div
          v-for="result in uploadResults"
          :key="result.name"
          class="flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
          :class="
            result.success
              ? 'border-primary/30 bg-primary/14 text-primary'
              : 'border-destructive/30 bg-destructive/14 text-destructive'
          "
        >
          <span class="shrink-0 font-medium">{{ result.name }}</span>
          <span v-if="result.error" class="text-xs opacity-80">- {{ result.error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
