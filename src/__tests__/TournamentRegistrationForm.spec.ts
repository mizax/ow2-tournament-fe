import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import TournamentRegistrationForm from '@/components/tournament/registration/TournamentRegistrationForm.vue'
import { RoleValue } from '@/components/tournament/registration/types'
import { stubWithSlot } from './testUtils'

vi.mock('@tanstack/vue-form', async () => {
  const vue = await import('vue')
  const { computed, defineComponent, reactive } = vue

  return {
    useForm: (options: { defaultValues: Record<string, unknown>; onSubmit?: (args: { value: Record<string, unknown>; formApi: { setFieldValue: (name: string, value: unknown) => void } }) => Promise<void> | void }) => {
      const values = reactive({ ...options.defaultValues })
      const setFieldValue = (name: string, value: unknown) => {
        values[name as keyof typeof values] = value as never
      }

      const Field = defineComponent({
        name: 'FormField',
        props: ['name'],
        setup(props, { slots }) {
          const field = {
            name: props.name,
            state: {
              get value() {
                return values[props.name as keyof typeof values]
              },
              meta: {
                isTouched: true,
                isValid: true,
                errors: [],
              },
            },
            handleChange: (value: unknown) => {
              values[props.name as keyof typeof values] = value as never
            },
            handleBlur: () => {},
          }

          return () => slots.default?.({ field })
        },
      })

      const Subscribe = defineComponent({
        name: 'FormSubscribe',
        setup(_, { slots }) {
          return () =>
            slots.default?.({
              canSubmit: true,
              isPristine: false,
              isSubmitting: false,
            })
        },
      })

      return {
        Field,
        Subscribe,
        useStore: (selector: (state: { values: Record<string, unknown> }) => unknown) =>
          computed(() => selector({ values })),
        handleSubmit: async () => {
          await options.onSubmit?.({ value: { ...values }, formApi: { setFieldValue } })
        },
        setFieldValue,
      }
    },
  }
})

const authStoreMock = vi.hoisted(() => ({
  user: { battletag: 'Test#1234' },
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => authStoreMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const TextInputStub = {
  name: 'TextInputStub',
  props: ['modelValue'],
  template:
    '<input v-bind="$attrs" :data-name="$attrs.name" :value="modelValue ?? \'\'" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

const TextareaStub = {
  name: 'TextareaStub',
  props: ['modelValue'],
  template:
    '<textarea v-bind="$attrs" :data-name="$attrs.name" :value="modelValue ?? \'\'" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
}

const CheckboxStub = {
  name: 'Checkbox',
  props: ['modelValue'],
  template:
    '<input type="checkbox" v-bind="$attrs" :checked="modelValue === true" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
}

const ButtonStub = {
  name: 'Button',
  props: ['disabled', 'type'],
  template: '<button :disabled="disabled" :type="type || \'button\'"><slot /></button>',
}

const RoleSelectFieldStub = {
  name: 'RoleSelectField',
  props: ['form', 'name'],
  template: '<button type="button" :data-role="name" @click="setRole">set</button>',
  methods: {
    setRole() {
      const role = this.name === 'primaryRole' ? RoleValue.FLEX : RoleValue.DAMAGE
      this.form.setFieldValue(this.name, role)
    },
  },
}

const TagsInputFieldStub = {
  name: 'TagsInputField',
  template: '<div />',
}

const setup = (onSubmit?: (payload: unknown) => void) => {
  return mount(TournamentRegistrationForm, {
    props: { onSubmit },
    global: {
      stubs: {
        FieldGroup: stubWithSlot('FieldGroup'),
        Field: stubWithSlot('Field'),
        FieldLabel: stubWithSlot('FieldLabel'),
        FieldError: stubWithSlot('FieldError'),
        FieldDescription: stubWithSlot('FieldDescription'),
        InputGroup: stubWithSlot('InputGroup'),
        InputGroupText: stubWithSlot('InputGroupText'),
        InputGroupInput: TextInputStub,
        Input: TextInputStub,
        Textarea: TextareaStub,
        Checkbox: CheckboxStub,
        Button: ButtonStub,
        RoleSelectField: RoleSelectFieldStub,
        TagsInputField: TagsInputFieldStub,
      },
    },
  })
}

beforeEach(() => {
  authStoreMock.user = { battletag: 'Test#1234' }
})

describe('TournamentRegistrationForm', () => {
  it('renders battletag from auth store', () => {
    const wrapper = setup()

    expect(wrapper.text()).toContain('Test#1234')
  })

  it('submits valid form data', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const onSubmit = vi.fn()
    const wrapper = setup(onSubmit)

    await wrapper.find('input[data-name="twitch"]').setValue('validtwitch')
    await wrapper.find('input[data-name="discord"]').setValue('valid_discord')
    await wrapper.find('textarea[data-name="additionalInfo"]').setValue('')

    await wrapper.find('[data-role="primaryRole"]').trigger('click')

    await wrapper.find('input[type="checkbox"]').setValue(true)

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    await nextTick()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      altAccounts: [],
      twitch: 'validtwitch',
      discord: 'valid_discord',
      primaryRole: RoleValue.FLEX,
      secondaryRole: undefined,
      guarantors: [],
      additionalInfo: '',
      rulesAccepted: true,
    })
    consoleLogSpy.mockRestore()
  })
})
