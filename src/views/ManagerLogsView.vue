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

const selectedMatch = computed(() =>
  matches.value.find((m) => m.id === selectedMatchId.value) ?? null,
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
            : res.errorCode ?? 'unknown_error'
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
  <div class="container mx-auto py-10 max-w-3xl">
    <div class="flex items-center gap-4 mb-8">
      <Button variant="ghost" size="sm" :as="RouterLink" :to="{ name: 'manager-dashboard' }">
        ← {{ t('manager.registrations.back') }}
      </Button>
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('manager.logs.title') }}</h1>
        <p class="text-sm text-muted-foreground">
          {{ t('manager.logs.tournament_id', { id: tournamentId }) }}
        </p>
      </div>
    </div>

    <div v-if="matchesLoading" class="flex items-center gap-2 text-muted-foreground mb-6">
      <Spinner class="animate-spin" />
      <span>{{ t('manager.logs.loading_matches') }}</span>
    </div>

    <div v-else-if="matchesError" class="text-sm text-destructive mb-6">{{ matchesError }}</div>

    <div v-else class="space-y-6">
      <!-- Match selector -->
      <div class="space-y-2">
        <label class="text-sm font-medium">{{ t('manager.logs.select_match') }}</label>
        <div class="grid gap-2">
          <button
            v-for="match in matches"
            :key="match.id"
            class="flex items-center justify-between rounded-md border px-4 py-3 text-sm text-left transition-colors hover:bg-accent"
            :class="selectedMatchId === match.id ? 'border-primary bg-accent' : 'border-border'"
            @click="selectedMatchId = match.id; uploadResults = []"
          >
            <span class="font-medium">
              {{ match.home_team_name }} vs {{ match.away_team_name }}
            </span>
            <span class="text-muted-foreground text-xs">
              #{{ match.id }} · {{ match.home_score }}:{{ match.away_score }}
            </span>
          </button>
        </div>
      </div>

      <!-- File drop zone -->
      <div v-if="selectedMatchId" class="space-y-2">
        <label class="text-sm font-medium">{{ t('manager.logs.select_files') }}</label>
        <div
          class="rounded-md border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary transition-colors"
          :class="selectedFiles.length ? 'border-primary' : ''"
          @drop="onDrop"
          @dragover="onDragOver"
          @click="fileInput?.click()"
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
          <ul v-else class="text-sm text-left space-y-1">
            <li v-for="file in selectedFiles" :key="file.name" class="text-foreground">
              {{ file.name }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Upload button -->
      <div v-if="selectedMatchId && selectedFiles.length" class="flex gap-3 items-center">
        <Button :disabled="uploading" @click="uploadFiles">
          <Spinner v-if="uploading" class="animate-spin mr-2 h-4 w-4" />
          {{ uploading ? t('manager.logs.uploading') : t('manager.logs.upload_btn') }}
        </Button>
        <span v-if="selectedMatch" class="text-sm text-muted-foreground">
          {{ selectedMatch.home_team_name }} vs {{ selectedMatch.away_team_name }}
        </span>
      </div>

      <!-- Results -->
      <div v-if="uploadResults.length" class="space-y-1">
        <div
          v-for="result in uploadResults"
          :key="result.name"
          class="flex items-start gap-2 text-sm rounded-md px-3 py-2"
          :class="result.success ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'"
        >
          <span class="font-mono font-medium shrink-0">{{ result.name }}</span>
          <span v-if="result.error" class="text-xs opacity-80">— {{ result.error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
