import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'

const VueMarkdownStub = {
  name: 'VueMarkdown',
  props: ['markdown', 'customAttrs', 'rehypePlugins', 'remarkPlugins', 'sanitize'],
  template: '<div class="markdown">{{ markdown }}</div>',
}

describe('MarkdownRenderer', () => {
  it('passes plugins and sanitization to VueMarkdown', () => {
    const wrapper = shallowMount(MarkdownRenderer, {
      props: { markdown: '# Title' },
      global: {
        stubs: {
          VueMarkdown: VueMarkdownStub,
        },
      },
    })

    const vm = wrapper.findComponent({ name: 'VueMarkdown' })
    expect(vm.exists()).toBe(true)
    expect(vm.props('markdown')).toBe('# Title')
    expect(vm.props('sanitize')).toBe(true)
    expect(vm.props('rehypePlugins')).toHaveLength(1)
    expect(vm.props('remarkPlugins')).toHaveLength(2)
  })

  it('adds target/rel to external links only', () => {
    const wrapper = shallowMount(MarkdownRenderer, {
      props: { markdown: '# Title' },
      global: {
        stubs: {
          VueMarkdown: VueMarkdownStub,
        },
      },
    })

    const customAttrs = wrapper.findComponent({ name: 'VueMarkdown' }).props('customAttrs') as {
      a: (node: { properties: { href: string } }) => Record<string, string>
    }

    const sameOrigin = `${window.location.protocol}//${window.location.host}/page`

    expect(customAttrs.a({ properties: { href: 'https://example.com' } })).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
    expect(customAttrs.a({ properties: { href: sameOrigin } })).toEqual({})
    expect(customAttrs.a({ properties: { href: '#section' } })).toEqual({})
  })

})
