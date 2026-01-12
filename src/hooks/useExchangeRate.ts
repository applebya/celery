import { useState, useEffect, useCallback } from 'react'
import type { Currency, ExchangeRates, HistoricalRate } from '@/types'

const CACHE_KEY = 'celery-exchange-rates'
const HISTORY_CACHE_KEY = 'celery-exchange-history'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface CachedRates {
  rates: ExchangeRates
  fetchedAt: number
}

interface CachedHistory {
  data: Record<string, HistoricalRate[]> // keyed by "FROM-TO"
  fetchedAt: number
}

// Fallback rates (approximate, relative to USD)
const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  CAD: 1.36,
  EUR: 0.92,
  GBP: 0.79,
}

export function useExchangeRate() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null)
  const [historicalData, setHistoricalData] = useState<Record<string, HistoricalRate[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRates = useCallback(async (force = false) => {
    // Check cache first
    if (!force) {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { rates, fetchedAt }: CachedRates = JSON.parse(cached)
          if (Date.now() - fetchedAt < CACHE_TTL) {
            setExchangeRates(rates)
            return rates
          }
        }
      } catch (e) {
        console.warn('Error reading cached exchange rates:', e)
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Using frankfurter.app API (free, no key required, ECB data)
      const response = await fetch(
        'https://api.frankfurter.app/latest?from=USD&to=CAD,EUR,GBP'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }

      const data = await response.json()

      const rates: ExchangeRates = {
        rates: {
          USD: 1,
          CAD: data.rates?.CAD ?? FALLBACK_RATES.CAD,
          EUR: data.rates?.EUR ?? FALLBACK_RATES.EUR,
          GBP: data.rates?.GBP ?? FALLBACK_RATES.GBP,
        },
        timestamp: Date.now(),
      }

      // Cache the result
      const cacheData: CachedRates = { rates, fetchedAt: Date.now() }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))

      setExchangeRates(rates)
      return rates
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      setError(errorMessage)

      // Use fallback rates if fetch fails
      const fallbackRates: ExchangeRates = {
        rates: FALLBACK_RATES,
        timestamp: Date.now(),
      }
      setExchangeRates(fallbackRates)
      return fallbackRates
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistorical = useCallback(async (from: Currency, to: Currency, days: number = 365): Promise<HistoricalRate[]> => {
    const key = `${from}-${to}-${days}`

    // Check cache first
    try {
      const cached = localStorage.getItem(HISTORY_CACHE_KEY)
      if (cached) {
        const { data, fetchedAt }: CachedHistory = JSON.parse(cached)
        if (Date.now() - fetchedAt < CACHE_TTL && data[key]) {
          setHistoricalData(prev => ({ ...prev, [key]: data[key] }))
          return data[key]
        }
      }
    } catch (e) {
      console.warn('Error reading cached historical data:', e)
    }

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const formatDate = (d: Date) => d.toISOString().split('T')[0]

      const response = await fetch(
        `https://api.frankfurter.app/${formatDate(startDate)}..${formatDate(endDate)}?from=${from}&to=${to}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch historical rates')
      }

      const data = await response.json()

      const history: HistoricalRate[] = Object.entries(data.rates || {}).map(([date, rates]) => ({
        date,
        rate: (rates as Record<string, number>)[to] ?? 1,
      })).sort((a, b) => a.date.localeCompare(b.date))

      // Update cache
      const existingCache = localStorage.getItem(HISTORY_CACHE_KEY)
      const existingData = existingCache ? JSON.parse(existingCache).data : {}
      const newCache: CachedHistory = {
        data: { ...existingData, [key]: history },
        fetchedAt: Date.now(),
      }
      localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(newCache))

      setHistoricalData(prev => ({ ...prev, [key]: history }))
      return history
    } catch (e) {
      console.warn('Error fetching historical rates:', e)
      return []
    }
  }, [])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  const convertCurrency = useCallback(
    (amount: number, from: Currency, to: Currency): number => {
      if (from === to || !exchangeRates) return amount

      // Convert through USD as base
      const fromRate = exchangeRates.rates[from]
      const toRate = exchangeRates.rates[to]

      // amount in FROM -> amount in USD -> amount in TO
      const amountInUsd = amount / fromRate
      return amountInUsd * toRate
    },
    [exchangeRates]
  )

  // Convert with trader margin applied (margin is percentage, e.g., 2 for 2%)
  // Margin reduces the amount received (simulates bank/platform fees)
  const convertWithMargin = useCallback(
    (amount: number, from: Currency, to: Currency, marginPercent: number): number => {
      const converted = convertCurrency(amount, from, to)
      if (from === to) return converted
      // Apply margin: you receive less when converting
      const marginMultiplier = 1 - (marginPercent / 100)
      return converted * marginMultiplier
    },
    [convertCurrency]
  )

  const getRate = useCallback(
    (from: Currency, to: Currency): number => {
      if (!exchangeRates) return 1
      const fromRate = exchangeRates.rates[from]
      const toRate = exchangeRates.rates[to]
      return toRate / fromRate
    },
    [exchangeRates]
  )

  const getAgeString = useCallback((): string => {
    if (!exchangeRates) return 'Loading...'

    const ageMs = Date.now() - exchangeRates.timestamp
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60))
    const ageDays = Math.floor(ageHours / 24)

    if (ageDays > 0) return `${ageDays}d ago`
    if (ageHours > 0) return `${ageHours}h ago`
    return 'Just now'
  }, [exchangeRates])

  return {
    exchangeRates,
    historicalData,
    loading,
    error,
    fetchRates,
    fetchHistorical,
    convertCurrency,
    convertWithMargin,
    getRate,
    getAgeString,
  }
}
