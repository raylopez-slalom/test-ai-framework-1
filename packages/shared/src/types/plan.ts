// ── Shared enums ──────────────────────────────────────────────────────────────

export type BudgetCategory =
  | 'flights'
  | 'accommodation'
  | 'activities'
  | 'meals'
  | 'transport'
  | 'other'

export type Interest =
  | 'food'
  | 'nature'
  | 'culture'
  | 'history'
  | 'nightlife'
  | 'outdoor-adventure'
  | 'wellness'
  | 'family-friendly'

// ── Source ────────────────────────────────────────────────────────────────────

export interface Source {
  label: string
  url: string | null
  dateChecked: string   // ISO 8601 date
  isStale: boolean      // true if dateChecked > 90 days ago
}

// ── CostLine ──────────────────────────────────────────────────────────────────

export interface CostLine {
  category: BudgetCategory
  estimateLow: number
  estimateHigh: number
  currency: string
  perUnit: 'total' | 'per-night' | 'per-person' | 'per-day'
  note: string | null
  source: Source
}

// ── TripBrief ─────────────────────────────────────────────────────────────────

export interface TripBrief {
  departureCity: string
  startDate: string | null      // ISO 8601 date, null if using durationDays
  endDate: string | null        // ISO 8601 date, null if using durationDays
  durationDays: number | null   // null if using startDate/endDate
  travelers: {
    adults: number
    children: number
  }
  budget: {
    amount: number
    currency: string            // ISO 4217 (e.g. "USD")
    includes: BudgetCategory[]
    clarified: boolean          // true once the user has confirmed inclusions
  }
  interests: Interest[]
  pace: 'relaxed' | 'moderate' | 'active'
  transportationConstraints: string[]
  accessibilityNeeds: string | null
  dietaryPreferences: string | null
}

// ── Constraint / Preference ───────────────────────────────────────────────────

export type ConstraintType =
  | 'no-rental-car'
  | 'fixed-duration'
  | 'budget-ceiling'
  | 'no-long-flights'
  | 'public-transit-only'
  | 'accessibility'
  | 'other'

export interface Constraint {
  id: string
  text: string
  type: ConstraintType
  source: 'user' | 'derived'
}

export interface Preference {
  id: string
  text: string
  category: 'location' | 'activity' | 'accommodation' | 'pace' | 'other'
}

// ── Destination ───────────────────────────────────────────────────────────────

export interface Destination {
  id: string
  name: string
  region: string
  country: string
  whyItFits: string
  tradeOffs: string
  costBreakdown: CostLine[]
  budgetFitsConstraint: boolean
  budgetDelta: number | null    // positive = over budget, negative = under
  weatherNotes: string
  weatherSource: Source
  uncertainties: string[]
  sources: Source[]
}

// ── Itinerary ─────────────────────────────────────────────────────────────────

export interface FreePeriod {
  period: 'morning' | 'afternoon' | 'evening'
  note: string | null
}

export interface Activity {
  id: string
  name: string
  description: string
  durationMinutes: number
  estimatedCost: CostLine | null
  location: string
  source: Source | null
}

export interface Meal {
  period: 'breakfast' | 'lunch' | 'dinner'
  suggestion: string
  estimatedCost: CostLine | null
  alternatives: string[]
}

export interface Day {
  dayNumber: number
  date: string | null           // ISO 8601 date, null if no fixed dates
  label: string
  activities: Activity[]
  meals: Meal[]
  freePeriods: FreePeriod[]
  transitNotes: string
}

export interface BudgetEstimate {
  lines: CostLine[]
  total: number
  currency: string
  ceiling: number               // from TripBrief.budget.amount
  withinBudget: boolean
  delta: number                 // total - ceiling (negative = under budget)
}

export interface Itinerary {
  destinationId: string
  days: Day[]
  budgetEstimate: BudgetEstimate
  transportAssumptions: string[]
  generatedAt: string           // ISO 8601 datetime
  promptVersion: string
}

// ── ChangeSnapshot ────────────────────────────────────────────────────────────

export interface ItineraryDiff {
  added: Activity[]
  removed: Activity[]
  modified: { before: Activity; after: Activity }[]
  freePeriodChanges: {
    day: number
    added: FreePeriod[] | null
    removed: FreePeriod[] | null
  }[]
}

export interface ConstraintCheckResult {
  constraint: Constraint
  satisfied: boolean
  note: string | null
}

export interface ChangeSnapshot {
  timestamp: string
  changeRequest: string
  diff: ItineraryDiff
  budgetDelta: number           // positive = cost increased
  constraintRecheck: ConstraintCheckResult[]
}
