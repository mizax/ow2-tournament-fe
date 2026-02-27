import { describe, it, expect } from 'vitest'
import { formatNumber, formatTime, kd } from '@/lib/statsFormatting'

describe('formatNumber', () => {
  it('returns — for null', () => {
    expect(formatNumber(null)).toBe('—')
  })

  it('returns — for undefined', () => {
    expect(formatNumber(undefined)).toBe('—')
  })

  it('returns 0 for zero', () => {
    expect(formatNumber(0)).toBe((0).toLocaleString())
  })

  it('rounds to nearest integer', () => {
    expect(formatNumber(1234.4)).toBe((1234).toLocaleString())
    expect(formatNumber(1234.5)).toBe((1235).toLocaleString())
    expect(formatNumber(1234.7)).toBe((1235).toLocaleString())
  })

  it('formats large numbers', () => {
    expect(formatNumber(1000000)).toBe((1000000).toLocaleString())
  })
})

describe('formatTime', () => {
  it('returns — for null', () => {
    expect(formatTime(null)).toBe('—')
  })

  it('returns — for undefined', () => {
    expect(formatTime(undefined)).toBe('—')
  })

  it('formats zero as 0:00', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  it('pads seconds with leading zero', () => {
    expect(formatTime(65)).toBe('1:05')
  })

  it('does not pad minutes', () => {
    expect(formatTime(90)).toBe('1:30')
  })

  it('handles more than 60 minutes', () => {
    expect(formatTime(3661)).toBe('61:01')
  })

  it('truncates sub-second precision', () => {
    expect(formatTime(90.9)).toBe('1:30')
  })
})

describe('kd', () => {
  it('returns — when kills is null', () => {
    expect(kd(null, 5)).toBe('—')
  })

  it('returns — when deaths is null', () => {
    expect(kd(10, null)).toBe('—')
  })

  it('returns — when both are null', () => {
    expect(kd(null, null)).toBe('—')
  })

  it('returns ∞ when deaths is 0 and kills > 0', () => {
    expect(kd(5, 0)).toBe('∞')
  })

  it('returns 0 when both kills and deaths are 0', () => {
    expect(kd(0, 0)).toBe('0')
  })

  it('returns ratio with 2 decimal places', () => {
    expect(kd(10, 4)).toBe('2.50')
    expect(kd(1, 3)).toBe('0.33')
  })

  it('returns exact ratio when divisible', () => {
    expect(kd(6, 2)).toBe('3.00')
  })
})
