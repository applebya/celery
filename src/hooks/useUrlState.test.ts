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

    it('decodes showCurrencyConversion flag', () => {
      expect(decodeUrlToState('?cc=1')).toEqual({ showCurrencyConversion: true })
      expect(decodeUrlToState('?cc=0')).toEqual({ showCurrencyConversion: false })
    })
  })

  describe('encodeStateToUrl - showCurrencyConversion', () => {
    it('encodes showCurrencyConversion when different from default', () => {
      // Default is true, so encoding false should produce cc=0
      const stateWithFalse = { ...DEFAULT_STATE, showCurrencyConversion: false }
      expect(encodeStateToUrl(stateWithFalse)).toContain('cc=0')
    })

    it('does not encode showCurrencyConversion when matching default', () => {
      // Default is true, so encoding true should not include cc param
      const stateWithTrue = { ...DEFAULT_STATE, showCurrencyConversion: true }
      expect(encodeStateToUrl(stateWithTrue)).not.toContain('cc=')
    })
  })
})
