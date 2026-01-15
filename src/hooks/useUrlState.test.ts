import { describe, it, expect } from 'vitest'
import { encodeStateToUrl, decodeUrlToState } from './useUrlState'
import { DEFAULT_STATE } from '@/types'

describe('useUrlState', () => {
  describe('encodeStateToUrl', () => {
    it('returns empty string for default state', () => {
      expect(encodeStateToUrl(DEFAULT_STATE)).toBe('')
    })

    it('encodes non-default hourly rate', () => {
      const state = { ...DEFAULT_STATE, hourlyRate: 150 }
      expect(encodeStateToUrl(state)).toBe('?r=150')
    })

    it('encodes multiple changed values', () => {
      const state = { ...DEFAULT_STATE, hourlyRate: 150, currency: 'USD' as const }
      const result = encodeStateToUrl(state)
      expect(result).toContain('r=150')
      expect(result).toContain('c=USD')
    })
  })

  describe('decodeUrlToState', () => {
    it('returns empty object for empty search', () => {
      expect(decodeUrlToState('')).toEqual({})
    })

    it('decodes hourly rate', () => {
      expect(decodeUrlToState('?r=150')).toEqual({ hourlyRate: 150 })
    })

    it('decodes currency', () => {
      expect(decodeUrlToState('?c=USD')).toEqual({ currency: 'USD' })
    })

    it('ignores invalid currency', () => {
      expect(decodeUrlToState('?c=INVALID')).toEqual({})
    })

    it('decodes selfEmployed flag', () => {
      expect(decodeUrlToState('?se=1')).toEqual({ isSelfEmployed: true })
      expect(decodeUrlToState('?se=0')).toEqual({ isSelfEmployed: false })
    })

    it('decodes calculation mode', () => {
      expect(decodeUrlToState('?m=sth')).toEqual({ calculationMode: 'salaryToHourly' })
      expect(decodeUrlToState('?m=hts')).toEqual({ calculationMode: 'hourlyToSalary' })
    })

    it('decodes trader margin', () => {
      expect(decodeUrlToState('?mg=15')).toEqual({ traderMargin: 15 })
    })

    it('ignores NaN values for numeric fields', () => {
      expect(decodeUrlToState('?r=abc')).toEqual({})
      expect(decodeUrlToState('?s=invalid')).toEqual({})
      expect(decodeUrlToState('?mg=notanumber')).toEqual({})
    })
  })
})
