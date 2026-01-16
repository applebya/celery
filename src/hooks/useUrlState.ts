import { useEffect, useCallback } from 'react'
import type { CalculatorState, Currency } from '@/types'
import { DEFAULT_STATE } from '@/types'

const URL_PARAMS = {
  rate: 'r',
  salary: 's',
  currency: 'c',
  country: 'co',
  region: 'rg',
  mode: 'm',
  margin: 'mg',
  selfEmployed: 'se',
  showConversion: 'cc',
} as const

export function encodeStateToUrl(state: CalculatorState): string {
  const params = new URLSearchParams()

  // Only encode non-default values
  if (state.hourlyRate !== DEFAULT_STATE.hourlyRate) {
    params.set(URL_PARAMS.rate, state.hourlyRate.toString())
  }
  if (state.targetSalary !== DEFAULT_STATE.targetSalary) {
    params.set(URL_PARAMS.salary, state.targetSalary.toString())
  }
  if (state.currency !== DEFAULT_STATE.currency) {
    params.set(URL_PARAMS.currency, state.currency)
  }
  if (state.country !== DEFAULT_STATE.country) {
    params.set(URL_PARAMS.country, state.country)
  }
  if (state.region !== DEFAULT_STATE.region) {
    params.set(URL_PARAMS.region, state.region)
  }
  if (state.calculationMode !== DEFAULT_STATE.calculationMode) {
    params.set(URL_PARAMS.mode, state.calculationMode === 'salaryToHourly' ? 'sth' : 'hts')
  }
  if (state.traderMargin !== DEFAULT_STATE.traderMargin) {
    params.set(URL_PARAMS.margin, state.traderMargin.toString())
  }
  if (state.isSelfEmployed !== DEFAULT_STATE.isSelfEmployed) {
    params.set(URL_PARAMS.selfEmployed, state.isSelfEmployed ? '1' : '0')
  }
  if (state.showCurrencyConversion !== DEFAULT_STATE.showCurrencyConversion) {
    params.set(URL_PARAMS.showConversion, state.showCurrencyConversion ? '1' : '0')
  }

  const paramString = params.toString()
  return paramString ? `?${paramString}` : ''
}

export function decodeUrlToState(search: string): Partial<CalculatorState> {
  const params = new URLSearchParams(search)
  const state: Partial<CalculatorState> = {}

  const rate = params.get(URL_PARAMS.rate)
  if (rate) {
    const parsed = parseFloat(rate)
    if (!isNaN(parsed)) state.hourlyRate = parsed
  }

  const salary = params.get(URL_PARAMS.salary)
  if (salary) {
    const parsed = parseFloat(salary)
    if (!isNaN(parsed)) state.targetSalary = parsed
  }

  const currency = params.get(URL_PARAMS.currency) as Currency
  if (currency && ['CAD', 'USD', 'EUR', 'GBP'].includes(currency)) {
    state.currency = currency
  }

  const country = params.get(URL_PARAMS.country) as 'CA' | 'US'
  if (country && ['CA', 'US'].includes(country)) {
    state.country = country
  }

  const region = params.get(URL_PARAMS.region)
  if (region) state.region = region

  const mode = params.get(URL_PARAMS.mode)
  if (mode === 'sth') state.calculationMode = 'salaryToHourly'
  if (mode === 'hts') state.calculationMode = 'hourlyToSalary'

  const margin = params.get(URL_PARAMS.margin)
  if (margin) {
    const parsed = parseFloat(margin)
    if (!isNaN(parsed)) state.traderMargin = parsed
  }

  const selfEmployed = params.get(URL_PARAMS.selfEmployed)
  if (selfEmployed !== null) state.isSelfEmployed = selfEmployed === '1'

  const showConversion = params.get(URL_PARAMS.showConversion)
  if (showConversion !== null) state.showCurrencyConversion = showConversion === '1'

  return state
}

export function useUrlState(
  state: CalculatorState,
  onChange: (state: CalculatorState) => void
) {
  // On mount, check URL for state
  useEffect(() => {
    const urlState = decodeUrlToState(window.location.search)
    if (Object.keys(urlState).length > 0) {
      onChange({ ...state, ...urlState })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Only runs on mount to restore URL state
  }, [])

  const getShareUrl = useCallback(() => {
    const base = window.location.origin + window.location.pathname
    return base + encodeStateToUrl(state)
  }, [state])

  return { getShareUrl }
}
