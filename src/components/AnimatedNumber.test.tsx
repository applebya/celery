import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnimatedNumber } from './AnimatedNumber'

describe('AnimatedNumber', () => {
  it('displays formatted initial value', () => {
    render(
      <AnimatedNumber
        value={1000}
        formatter={(n) => `$${n.toFixed(0)}`}
      />
    )
    expect(screen.getByText('$1000')).toBeInTheDocument()
  })
})
