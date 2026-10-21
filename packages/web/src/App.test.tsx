import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Travel AI Advisor heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /travel ai advisor/i })).toBeInTheDocument()
  })
})
