import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { markRaw } from 'vue'
import RoleSelectField from '@/components/tournament/registration/RoleSelectField.vue'
import { RoleValue } from '@/components/tournament/registration/types'
import { stubWithSlot } from './testUtils'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const fieldState = {
  name: 'primaryRole',
  state: {
    value: undefined,
    meta: { isTouched: false, isValid: true, errors: [] },
  },
  handleChange: vi.fn(),
  handleBlur: vi.fn(),
}

const SelectStub = {
  name: 'Select',
  props: ['modelValue', 'name'],
  template: '<div><slot /></div>',
}

const SelectItemStub = {
  name: 'SelectItem',
  props: ['value', 'disabled'],
  template: '<div :data-value="value" :data-disabled="disabled"><slot /></div>',
}

const FormFieldStub = markRaw({
  name: 'FormField',
  props: ['name'],
  template: '<div><slot :field="fieldState" /></div>',
  data() {
    return { fieldState }
  },
})

const setup = (disabledValues: RoleValue[] = []) => {
  return mount(RoleSelectField, {
    props: {
      form: { Field: FormFieldStub } as never,
      name: 'primaryRole',
      labelKey: 'label',
      placeholderKey: 'placeholder',
      options: [
        { value: RoleValue.TANK, labelKey: 'tank' },
        { value: RoleValue.DAMAGE, labelKey: 'damage' },
      ],
      disabledValues,
      isInvalid: () => false,
    },
    global: {
      stubs: {
        Field: stubWithSlot('Field'),
        FieldLabel: stubWithSlot('FieldLabel'),
        FieldError: stubWithSlot('FieldError'),
        Select: SelectStub,
        SelectTrigger: stubWithSlot('SelectTrigger'),
        SelectContent: stubWithSlot('SelectContent'),
        SelectValue: stubWithSlot('SelectValue'),
        SelectItem: SelectItemStub,
      },
    },
  })
}

describe('RoleSelectField', () => {
  it('renders options and respects disabled values', () => {
    const wrapper = setup([RoleValue.DAMAGE])

    const items = wrapper.findAll('[data-value]')
    expect(items).toHaveLength(2)
    const damageItem = items.find((item) => item.attributes('data-value') === RoleValue.DAMAGE)
    expect(damageItem?.attributes('data-disabled')).toBe('true')
  })
})
