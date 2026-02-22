import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import StreamTab from '@/components/tournament/details/StreamTab.vue'
import { stubWithSlot } from './testUtils'

const fetchWithoutAuthMock = vi.fn()

vi.mock('@/services/apiService', () => ({
  fetchWithoutAuth: (...args: unknown[]) => fetchWithoutAuthMock(...args),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const ButtonStub = {
  name: 'Button',
  props: ['as', 'href', 'target', 'rel'],
  template: '<a :href="href" :target="target" :rel="rel"><slot /></a>',
}

const setup = (
  props: { stream?: { platform?: string; channel?: string }; tournamentSef?: string } = {},
) => {
  return shallowMount(StreamTab, {
    props: {
      stream: props.stream,
      tournamentSef: props.tournamentSef ?? 'test-tournament',
    },
    global: {
      stubs: {
        Card: stubWithSlot('Card'),
        CardHeader: stubWithSlot('CardHeader'),
        CardTitle: stubWithSlot('CardTitle'),
        CardContent: stubWithSlot('CardContent'),
        Button: ButtonStub,
        Tv: { template: '<span />' },
      },
    },
  })
}

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

beforeEach(() => {
  fetchWithoutAuthMock.mockReset()
  fetchWithoutAuthMock.mockResolvedValue({
    success: true,
    data: [],
  })
})

describe('StreamTab', () => {
  it('renders twitch button when channel present', async () => {
    const wrapper = setup({ stream: { channel: '  ow2  ' } })

    await flushPromises()

    const link = wrapper.find('a[href="https://twitch.tv/ow2"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://twitch.tv/ow2')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  it('does not render twitch button when channel is whitespace only', async () => {
    const wrapper = setup({ stream: { channel: '   ' } })

    await flushPromises()

    expect(wrapper.find('a[href^="https://twitch.tv/"]').exists()).toBe(false)
  })

  it('renders loading state while live streams are loading', async () => {
    const pending = deferred<{ success: boolean; data: [] }>()
    fetchWithoutAuthMock.mockReturnValue(pending.promise)

    const wrapper = setup()
    await Promise.resolve()

    expect(wrapper.text()).toContain('tournament.stream.live_loading')
  })

  it('renders load error when api request fails', async () => {
    fetchWithoutAuthMock.mockResolvedValue({
      success: false,
      errorCode: 'network_error',
    })

    const wrapper = setup()
    await flushPromises()

    expect(wrapper.text()).toContain('tournament.stream.live_load_error')
  })

  it('renders live participant cards from api response', async () => {
    fetchWithoutAuthMock.mockResolvedValue({
      success: true,
      data: [
        {
          user_login: 'player_1',
          user_name: 'Player One',
          title: 'Top 500 grind',
          viewer_count: 1234,
          started_at: '2026-02-22T10:00:00Z',
          game_name: 'Overwatch 2',
          thumbnail_url: 'https://example.com/{width}x{height}.jpg',
        },
      ],
    })

    const wrapper = setup()
    await flushPromises()

    const liveLink = wrapper.find('a[href="https://twitch.tv/player_1"]')
    expect(liveLink.exists()).toBe(true)
    expect(liveLink.attributes('rel')).toBe('noopener noreferrer')
    expect(wrapper.find('img').attributes('src')).toContain('640x360')
    expect(wrapper.text()).toContain('Player One')
  })

  it('ignores stale response when tournament changes quickly', async () => {
    const first = deferred<{ success: boolean; data: Array<Record<string, unknown>> }>()
    const second = deferred<{ success: boolean; data: Array<Record<string, unknown>> }>()

    fetchWithoutAuthMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    const wrapper = setup({ tournamentSef: 'first' })

    await wrapper.setProps({ tournamentSef: 'second' })
    second.resolve({
      success: true,
      data: [
        {
          user_login: 'second_streamer',
          user_name: 'Second Streamer',
          title: 'Second',
          viewer_count: 10,
          started_at: '2026-02-22T10:00:00Z',
          game_name: 'Overwatch 2',
          thumbnail_url: 'https://example.com/{width}x{height}.jpg',
        },
      ],
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Second Streamer')

    first.resolve({
      success: true,
      data: [
        {
          user_login: 'first_streamer',
          user_name: 'First Streamer',
          title: 'First',
          viewer_count: 10,
          started_at: '2026-02-22T10:00:00Z',
          game_name: 'Overwatch 2',
          thumbnail_url: 'https://example.com/{width}x{height}.jpg',
        },
      ],
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Second Streamer')
    expect(wrapper.text()).not.toContain('First Streamer')
  })
})
