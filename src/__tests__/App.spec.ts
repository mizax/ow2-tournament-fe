import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

const RouterViewStub = {
  template: '<div><slot :Component="null" /></div>',
}

describe('App', () => {
  it('mounts without crashing', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: RouterViewStub,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
