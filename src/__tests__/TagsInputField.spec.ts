import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { markRaw } from 'vue'
import TagsInputField from '@/components/tournament/registration/TagsInputField.vue'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const fieldState = {
  name: 'altAccounts',
  state: {
    value: [],
    meta: { isTouched: false, isValid: true, errors: [] },
  },
  handleChange: vi.fn(),
  handleBlur: vi.fn(),
}

const TagsInputStub = {
  name: 'TagsInput',
  props: ['modelValue'],
  template: '<div class="tags-input"><slot /></div>',
}

const FormFieldStub = markRaw({
  name: 'FormField',
  props: ['name', 'validators'],
  template: '<div><slot :field="fieldState" /></div>',
  data() {
    return { fieldState }
  },
})

const setup = (
  validateTags?: (value: string[]) => string | undefined,
  isInvalid = () => false,
) => {
  return mount(TagsInputField, {
    props: {
      form: { Field: FormFieldStub } as never,
      name: 'altAccounts',
      labelKey: 'label',
      placeholderKey: 'placeholder',
      tooltipKey: 'tooltip',
      tooltipLabelKey: 'tooltip_label',
      isInvalid,
      validateTags,
    },
    global: {
      components: {
        TagsInput: TagsInputStub,
        TagsInputItem: stubWithSlot('TagsInputItem'),
        TagsInputItemText: stubWithSlot('TagsInputItemText'),
        TagsInputItemDelete: stubWithSlot('TagsInputItemDelete'),
        TagsInputInput: stubWithSlot('TagsInputInput'),
      },
      stubs: {
        Field: stubWithSlot('Field'),
        FieldLabel: stubWithSlot('FieldLabel'),
        FieldError: { name: 'FieldError', template: '<div class="field-error"></div>' },
        Tooltip: stubWithSlot('Tooltip'),
        TooltipTrigger: stubWithSlot('TooltipTrigger'),
        TooltipContent: stubWithSlot('TooltipContent'),
        Button: stubWithSlot('Button'),
        Info: { template: '<span />' },
      },
    },
  })
}

describe('TagsInputField', () => {
  beforeEach(() => {
    fieldState.state.value = []
    fieldState.handleChange.mockReset()
    fieldState.handleBlur.mockReset()
  })

  it('passes validators when validateTags provided', () => {
    const validateTags = vi.fn()
    const wrapper = setup(validateTags)

    const formField = wrapper.findComponent({ name: 'FormField' })
    expect(formField.props('validators')).toBeDefined()
  })

  it('omits validators when validateTags is not provided', () => {
    const wrapper = setup()

    const formField = wrapper.findComponent({ name: 'FormField' })
    expect(formField.props('validators')).toBeUndefined()
  })

  it('normalizes non-array value for TagsInput', () => {
    fieldState.state.value = undefined as unknown as string[]

    const wrapper = setup()
    const tagsInput = wrapper.findComponent(TagsInputStub)

    expect(tagsInput.props('modelValue')).toEqual([])
  })

  it('passes update:model-value to field.handleChange', async () => {
    const wrapper = setup()
    const tagsInput = wrapper.findComponent(TagsInputStub)

    await tagsInput.vm.$emit('update:modelValue', ['a', 'b'])

    expect(fieldState.handleChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('shows FieldError when invalid', () => {
    const wrapper = setup(undefined, () => true)

    expect(wrapper.find('.field-error').exists()).toBe(true)
  })
})
