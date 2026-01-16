import { describe, it, expect } from 'vitest'
import { getCountry, getRegion, getHolidayCount, countries } from './holidays-2026'

describe('getCountry', () => {
  it('returns Canada for CA code', () => {
    const canada = getCountry('CA')
    expect(canada).toBeDefined()
    expect(canada?.name).toBe('Canada')
    expect(canada?.flag).toBe('🇨🇦')
    expect(canada?.currency).toBe('CAD')
  })

  it('returns US for US code', () => {
    const us = getCountry('US')
    expect(us).toBeDefined()
    expect(us?.name).toBe('United States')
    expect(us?.flag).toBe('🇺🇸')
    expect(us?.currency).toBe('USD')
  })

  it('returns undefined for unknown country', () => {
    expect(getCountry('XX')).toBeUndefined()
  })
})

describe('getRegion', () => {
  it('returns Ontario for CA/ON', () => {
    const ontario = getRegion('CA', 'ON')
    expect(ontario).toBeDefined()
    expect(ontario?.name).toBe('Ontario')
    expect(ontario?.holidays).toBe(9)
  })

  it('returns California for US/CA', () => {
    const california = getRegion('US', 'CA')
    expect(california).toBeDefined()
    expect(california?.name).toBe('California')
    expect(california?.holidays).toBe(12)
  })

  it('returns undefined for unknown region', () => {
    expect(getRegion('CA', 'XX')).toBeUndefined()
  })
})

describe('getHolidayCount', () => {
  // Canadian provinces
  it('returns 9 for Ontario', () => {
    expect(getHolidayCount('CA', 'ON')).toBe(9)
  })

  it('returns 11 for British Columbia', () => {
    expect(getHolidayCount('CA', 'BC')).toBe(11)
  })

  it('returns 6 for Newfoundland (fewest in Canada)', () => {
    expect(getHolidayCount('CA', 'NL')).toBe(6)
  })

  it('returns 8 for Quebec', () => {
    expect(getHolidayCount('CA', 'QC')).toBe(8)
  })

  it('returns 10 for Saskatchewan', () => {
    expect(getHolidayCount('CA', 'SK')).toBe(10)
  })

  it('returns 11 for Yukon', () => {
    expect(getHolidayCount('CA', 'YT')).toBe(11)
  })

  // US states
  it('returns 12 for California', () => {
    expect(getHolidayCount('US', 'CA')).toBe(12)
  })

  it('returns 14 for Texas (most in US)', () => {
    expect(getHolidayCount('US', 'TX')).toBe(14)
  })

  it('returns 13 for New York', () => {
    expect(getHolidayCount('US', 'NY')).toBe(13)
  })

  it('returns 11 for states with federal only', () => {
    expect(getHolidayCount('US', 'WA')).toBe(11)
  })

  // Edge cases
  it('returns 0 for unknown region', () => {
    expect(getHolidayCount('CA', 'XX')).toBe(0)
  })

  it('returns 0 for unknown country', () => {
    expect(getHolidayCount('XX', 'ON')).toBe(0)
  })
})

describe('countries data integrity', () => {
  it('has 3 countries', () => {
    expect(countries).toHaveLength(3)
  })

  it('Canada has 13 provinces/territories', () => {
    const canada = getCountry('CA')
    expect(canada?.regions).toHaveLength(13)
  })

  it('Mexico has 32 states', () => {
    const mexico = getCountry('MX')
    expect(mexico?.regions).toHaveLength(32)
  })

  it('US has 51 regions (50 states + DC)', () => {
    const us = getCountry('US')
    expect(us?.regions).toHaveLength(51)
  })

  it('all Canadian regions have 6-11 holidays', () => {
    const canada = getCountry('CA')
    canada?.regions.forEach((region) => {
      expect(region.holidays).toBeGreaterThanOrEqual(6)
      expect(region.holidays).toBeLessThanOrEqual(11)
    })
  })

  it('all US regions have 11-14 holidays', () => {
    const us = getCountry('US')
    us?.regions.forEach((region) => {
      expect(region.holidays).toBeGreaterThanOrEqual(11)
      expect(region.holidays).toBeLessThanOrEqual(14)
    })
  })
})
