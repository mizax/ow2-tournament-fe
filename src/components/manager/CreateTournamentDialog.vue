<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTournament } from '@/services/tournamentManagerApi'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'created'): void
}>()

const { t } = useI18n()
const router = useRouter()

const title = ref('')
const sefTitle = ref('')
const sefTouched = ref(false)
const submitting = ref(false)

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const canSubmit = computed(() => {
  return title.value.trim().length > 0 && sefTitle.value.trim().length > 0 && !submitting.value
})

const CYRILLIC_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .split('')
    .map((c) => CYRILLIC_MAP[c] ?? c)
    .join('')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

watch(
  () => title.value,
  (nextTitle) => {
    if (!sefTouched.value) {
      sefTitle.value = slugify(nextTitle)
    }
  },
)

watch(
  () => isOpen.value,
  (opened) => {
    if (!opened) {
      title.value = ''
      sefTitle.value = ''
      sefTouched.value = false
      submitting.value = false
    }
  },
)

const onSefInput = (value: string | number) => {
  sefTouched.value = true
  sefTitle.value = slugify(String(value))
}

const submit = async () => {
  if (!canSubmit.value) {
    return
  }

  submitting.value = true
  const response = await createTournament(title.value.trim(), sefTitle.value.trim())
  submitting.value = false

  if (!response.success || !response.data) {
    toast.error(t('manager.dashboard.create.error'))
    return
  }

  emit('created')
  isOpen.value = false
  toast.success(t('manager.dashboard.create.success'))
  await router.push({
    name: 'manager-tournament-edit',
    params: { tournamentId: response.data.id },
  })
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ t('manager.dashboard.create.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('manager.dashboard.create.subtitle') }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="submit">
        <div class="space-y-2">
          <label class="text-sm font-medium">
            {{ t('manager.dashboard.create.fields.title') }}
          </label>
          <Input
            v-model="title"
            :placeholder="t('manager.dashboard.create.placeholders.title')"
            maxlength="120"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">
            {{ t('manager.dashboard.create.fields.sef_title') }}
          </label>
          <Input
            :model-value="sefTitle"
            :placeholder="t('manager.dashboard.create.placeholders.sef_title')"
            maxlength="120"
            @update:model-value="onSefInput"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="isOpen = false">
            {{ t('manager.dashboard.create.cancel') }}
          </Button>
          <Button type="submit" :disabled="!canSubmit">
            {{
              submitting
                ? t('manager.dashboard.create.creating')
                : t('manager.dashboard.create.submit')
            }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
