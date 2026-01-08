import { useState, useEffect, useCallback } from 'react'
import type { ExchangeRate } from '@/types'

const CACHE_KEY = 'celery-exchange-rate'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface CachedRate {
  rate: ExchangeRate
  fetchedAt: number
}

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRate = useCallback(async (force = false) => {
    // Check cache first
    if (!force) {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { rate, fetchedAt }: CachedRate = JSON.parse(cached)
          if (Date.now() - fetchedAt < CACHE_TTL) {
            setExchangeRate(rate)
            return rate
          }
        }
      } catch (e) {
        console.warn('Error reading cached exchange rate:', e)
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Using exchangerate.host API (free, no key required)
      const response = await fetch(
        'https://api.exchangerate.host/latest?base=CAD&symbols=USD'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate')
      }

      const data = await response.json()

      const rate: ExchangeRate = {
        rate: data.rates?.USD ?? 0.73, // fallback rate
        timestamp: Date.now(),
        from: 'CAD',
        to: 'USD',
      }

      // Cache the result
      const cacheData: CachedRate = { rate, fetchedAt: Date.now() }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))

      setExchangeRate(rate)
      return rate
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      setError(errorMessage)

      // Use fallback rate if fetch fails
      const fallbackRate: ExchangeRate = {
        rate: 0.73, // Approximate CAD to USD
        timestamp: Date.now(),
        from: 'CAD',
        to: 'USD',
      }
      setExchangeRate(fallbackRate)
      return fallbackRate
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRate()
  }, [fetchRate])

  const convertCurrency = useCallback(
    (amount: number, from: 'CAD' | 'USD', to: 'CAD' | 'USD'): number => {
      if (from === to || !exchangeRate) return amount

      if (from === 'CAD' && to === 'USD') {
        return amount * exchangeRate.rate
      } else {
        return amount / exchangeRate.rate
      }
    },
    [exchangeRate]
  )

  const getAgeString = useCallback((): string => {
    if (!exchangeRate) return 'Loading...'

    const ageMs = Date.now() - exchangeRate.timestamp
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60))
    const ageDays = Math.floor(ageHours / 24)

    if (ageDays > 0) return `${ageDays}d ago`
    if (ageHours > 0) return `${ageHours}h ago`
    return 'Just now'
  }, [exchangeRate])

  return {
    exchangeRate,
    loading,
    error,
    fetchRate,
    convertCurrency,
    getAgeString,
  }
}
