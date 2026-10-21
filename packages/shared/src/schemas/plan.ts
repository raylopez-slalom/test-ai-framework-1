import { z } from 'zod'

// ── Shared enums ──────────────────────────────────────────────────────────────

export const BudgetCategorySchema = z.enum([
  'flights',
  'accommodation',
  'activities',
  'meals',
  'transport',
  'other',
])

export const InterestSchema = z.enum([
  'food',
  'nature',
  'culture',
  'history',
  'nightlife',
  'outdoor-adventure',
  'wellness',
  'family-friendly',
])

// ── Source ────────────────────────────────────────────────────────────────────

export const SourceSchema = z.object({
  label: z.string(),
  url: z.string().url().nullable(),
  dateChecked: z.string(),
  isStale: z.boolean(),
})

// ── CostLine ──────────────────────────────────────────────────────────────────

export const CostLineSchema = z.object({
  category: BudgetCategorySchema,
  estimateLow: z.number().nonnegative(),
  estimateHigh: z.number().nonnegative(),
  currency: z.string(),
  perUnit: z.enum(['total', 'per-night', 'per-person', 'per-day']),
  note: z.string().nullable(),
  source: SourceSchema,
})

// ── TripBrief ─────────────────────────────────────────────────────────────────

export const TripBriefSchema = z.object({
  departureCity: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  durationDays: z.number().int().positive().nullable(),
  travelers: z.object({
    adults: z.number().int().nonnegative(),
    children: z.number().int().nonnegative(),
  }),
  budget: z.object({
    amount: z.number().nonnegative(),
    currency: z.string(),
    includes: z.array(BudgetCategorySchema),
    clarified: z.boolean(),
  }),
  interests: z.array(InterestSchema),
  pace: z.enum(['relaxed', 'moderate', 'active']),
  transportationConstraints: z.array(z.string()),
  accessibilityNeeds: z.string().nullable(),
  dietaryPreferences: z.string().nullable(),
})

// ── Constraint / Preference ───────────────────────────────────────────────────

export const ConstraintTypeSchema = z.enum([
  'no-rental-car',
  'fixed-duration',
  'budget-ceiling',
  'no-long-flights',
  'public-transit-only',
  'accessibility',
  'other',
])

export const ConstraintSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: ConstraintTypeSchema,
  source: z.enum(['user', 'derived']),
})

export const PreferenceSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.enum(['location', 'activity', 'accommodation', 'pace', 'other']),
})

// ── Destination ───────────────────────────────────────────────────────────────

export const DestinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.string(),
  country: z.string(),
  whyItFits: z.string(),
  tradeOffs: z.string(),
  costBreakdown: z.array(CostLineSchema),
  budgetFitsConstraint: z.boolean(),
  budgetDelta: z.number().nullable(),
  weatherNotes: z.string(),
  weatherSource: SourceSchema,
  uncertainties: z.array(z.string()),
  sources: z.array(SourceSchema),
})

// ── Itinerary ─────────────────────────────────────────────────────────────────

export const FreePeriodSchema = z.object({
  period: z.enum(['morning', 'afternoon', 'evening']),
  note: z.string().nullable(),
})

export const ActivitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  durationMinutes: z.number().int().positive(),
  estimatedCost: CostLineSchema.nullable(),
  location: z.string(),
  source: SourceSchema.nullable(),
})

export const MealSchema = z.object({
  period: z.enum(['breakfast', 'lunch', 'dinner']),
  suggestion: z.string(),
  estimatedCost: CostLineSchema.nullable(),
  alternatives: z.array(z.string()),
})

export const DaySchema = z.object({
  dayNumber: z.number().int().positive(),
  date: z.string().nullable(),
  label: z.string(),
  activities: z.array(ActivitySchema),
  meals: z.array(MealSchema),
  freePeriods: z.array(FreePeriodSchema),
  transitNotes: z.string(),
})

export const BudgetEstimateSchema = z.object({
  lines: z.array(CostLineSchema),
  total: z.number().nonnegative(),
  currency: z.string(),
  ceiling: z.number().nonnegative(),
  withinBudget: z.boolean(),
  delta: z.number(),
})

export const ItinerarySchema = z.object({
  destinationId: z.string(),
  days: z.array(DaySchema),
  budgetEstimate: BudgetEstimateSchema,
  transportAssumptions: z.array(z.string()),
  generatedAt: z.string(),
  promptVersion: z.string(),
})

// ── ChangeSnapshot ────────────────────────────────────────────────────────────

export const ItineraryDiffSchema = z.object({
  added: z.array(ActivitySchema),
  removed: z.array(ActivitySchema),
  modified: z.array(z.object({ before: ActivitySchema, after: ActivitySchema })),
  freePeriodChanges: z.array(
    z.object({
      day: z.number().int().positive(),
      added: z.array(FreePeriodSchema).nullable(),
      removed: z.array(FreePeriodSchema).nullable(),
    }),
  ),
})

export const ConstraintCheckResultSchema = z.object({
  constraint: ConstraintSchema,
  satisfied: z.boolean(),
  note: z.string().nullable(),
})

export const ChangeSnapshotSchema = z.object({
  timestamp: z.string(),
  changeRequest: z.string(),
  diff: ItineraryDiffSchema,
  budgetDelta: z.number(),
  constraintRecheck: z.array(ConstraintCheckResultSchema),
})
