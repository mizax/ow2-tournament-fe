<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm, type AnyFieldApi } from '@tanstack/vue-form'
import { useAuthStore } from '@/stores/authStore'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import RoleSelectField from './RoleSelectField.vue'
import TagsInputField from './TagsInputField.vue'
import { RoleValue, type RegistrationFormValues, type RoleOption } from './types'
import {
  formSchema,
  validateBattleTagOrDiscordArray,
  validateBattleTags,
} from './TournamentRegistrationFormSchema'

const { t } = useI18n()
const authStore = useAuthStore()

const defaultValues: RegistrationFormValues = {
  altAccounts: [],
  twitch: '',
  discord: '',
  primaryRole: undefined,
  secondaryRole: undefined,
  guarantors: [],
  additionalInfo: '',
  rulesAccepted: false,
}

const props = defineProps<{
  onSubmit?: (payload: RegistrationFormValues) => Promise<void> | void
}>()

const form = useForm({
  defaultValues,
  validators: {
    onChange: formSchema,
    onSubmit: formSchema,
  },
  onSubmit: async ({ value, formApi }) => {
    console.log(formApi)
    await props.onSubmit?.(value)
  },
})

const battleTag = computed(
  () => authStore.user?.battletag ?? t('tournament.registration_form.battletag.empty'),
)

const isInvalid = (field: AnyFieldApi) => field.state.meta.isTouched && !field.state.meta.isValid

const roleOptions: RoleOption[] = [
  { value: RoleValue.TANK, labelKey: 'tournament.registration_form.roles.options.tank' },
  { value: RoleValue.DAMAGE, labelKey: 'tournament.registration_form.roles.options.damage' },
  { value: RoleValue.SUPPORT, labelKey: 'tournament.registration_form.roles.options.support' },
  { value: RoleValue.FLEX, labelKey: 'tournament.registration_form.roles.options.flex' },
]

const primaryRole = form.useStore((state) => state.values.primaryRole)
const secondaryRole = form.useStore((state) => state.values.secondaryRole)
const altRoleMandatory = computed(() => primaryRole.value !== RoleValue.FLEX)
const primaryRoleDisabledValues = computed(() => (secondaryRole.value ? [secondaryRole.value] : []))
const secondaryRoleDisabledValues = computed(() => (primaryRole.value ? [primaryRole.value] : []))

defineExpose({
  submit: form.handleSubmit,
})
</script>

<template>
  <form class="space-y-6 w-full" @submit.prevent="form.handleSubmit">
    <FieldGroup>
      <Field>
        <FieldLabel class="form-field-required">{{
          t('tournament.registration_form.battletag.label')
        }}</FieldLabel>
        <div
          class="rounded-md border border-input bg-input/30 px-3 py-1.75 text-sm text-foreground"
        >
          {{ battleTag }}
        </div>
      </Field>

      <TagsInputField
        :form="form"
        name="altAccounts"
        label-key="tournament.registration_form.alt_accounts.label"
        placeholder-key="tournament.registration_form.alt_accounts.placeholder"
        tooltip-key="tournament.registration_form.alt_accounts.tooltip"
        tooltip-label-key="tournament.registration_form.tooltip_label"
        :is-invalid="isInvalid"
        :validate-tags="validateBattleTags"
      />

      <form.Field name="twitch" #default="{ field }">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.name" class="form-field-required">{{
            t('tournament.registration_form.twitch.label')
          }}</FieldLabel>
          <InputGroup>
            <InputGroupText data-align="inline-start" class="ml-2">
              {{ t('tournament.registration_form.twitch.prefix') }}
            </InputGroupText>
            <InputGroupInput
              :id="field.name"
              :name="field.name"
              :model-value="field.state.value"
              @update:model-value="field.handleChange"
              @blur="field.handleBlur"
              :aria-invalid="isInvalid(field)"
              :placeholder="t('tournament.registration_form.twitch.placeholder')"
              autocomplete="off"
            />
          </InputGroup>
          <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
        </Field>
      </form.Field>

      <form.Field name="discord" #default="{ field }">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.name" class="form-field-required">{{
            t('tournament.registration_form.discord.label')
          }}</FieldLabel>
          <Input
            :id="field.name"
            :name="field.name"
            :model-value="field.state.value"
            @update:model-value="field.handleChange($event as string)"
            @blur="field.handleBlur"
            :aria-invalid="isInvalid(field)"
            :placeholder="t('tournament.registration_form.discord.placeholder')"
            autocomplete="off"
          />
          <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
        </Field>
      </form.Field>

      <RoleSelectField
        :form="form"
        name="primaryRole"
        label-key="tournament.registration_form.roles.primary"
        placeholder-key="tournament.registration_form.roles.placeholder"
        :options="roleOptions"
        :required="true"
        :disabled-values="primaryRoleDisabledValues"
        :is-invalid="isInvalid"
      />

      <RoleSelectField
        :form="form"
        name="secondaryRole"
        label-key="tournament.registration_form.roles.secondary"
        placeholder-key="tournament.registration_form.roles.placeholder"
        :options="roleOptions"
        :required="altRoleMandatory"
        :disabled-values="secondaryRoleDisabledValues"
        :is-invalid="isInvalid"
      />

      <TagsInputField
        :form="form"
        name="guarantors"
        label-key="tournament.registration_form.guarantors.label"
        placeholder-key="tournament.registration_form.guarantors.placeholder"
        tooltip-key="tournament.registration_form.guarantors.tooltip"
        tooltip-label-key="tournament.registration_form.tooltip_label"
        :is-invalid="isInvalid"
        :validate-tags="validateBattleTagOrDiscordArray"
      />

      <form.Field name="additionalInfo" #default="{ field }">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.name">{{
            t('tournament.registration_form.additional_info.label')
          }}</FieldLabel>
          <Textarea
            :id="field.name"
            :name="field.name"
            :model-value="field.state.value"
            @update:model-value="field.handleChange($event as string)"
            @blur="field.handleBlur"
            :aria-invalid="isInvalid(field)"
            :placeholder="t('tournament.registration_form.additional_info.placeholder')"
            :maxlength="300"
            class="min-h-[120px]"
          />
          <FieldDescription>
            {{
              t('tournament.registration_form.additional_info.count', {
                current: field.state.value.length,
                max: 300,
              })
            }}
          </FieldDescription>
          <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
        </Field>
      </form.Field>

      <form.Field name="rulesAccepted" #default="{ field }">
        <Field :data-invalid="isInvalid(field)" orientation="horizontal" class="items-start">
          <Checkbox
            :id="field.name"
            :name="field.name"
            :model-value="field.state.value"
            class="bg-input/50 cursor-pointer"
            @update:model-value="(value) => field.handleChange(value === true)"
            :aria-invalid="isInvalid(field)"
          />
          <div class="space-y-1">
            <FieldLabel :for="field.name" class="font-normal">
              {{ t('tournament.registration_form.rules.label') }}
            </FieldLabel>
            <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
          </div>
        </Field>
      </form.Field>
      <form.Subscribe>
        <template v-slot="{ canSubmit, isPristine, isSubmitting }">
          <Button class="cursor-pointer" type="submit" :disabled="!canSubmit || isPristine">
            {{ isSubmitting ? '...' : t('tournament.registration_form.submit') }}
          </Button>
        </template>
      </form.Subscribe>
    </FieldGroup>
  </form>
</template>
