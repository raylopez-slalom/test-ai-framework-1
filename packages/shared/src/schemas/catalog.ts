import { z } from 'zod'
import { InterestSchema, SourceSchema } from './plan.js'

export const CostRangeSchema = z.object({
  low: z.number().nonnegative(),
  high: z.number().nonnegative(),
  currency: z.string(),
  source: SourceSchema,
})

export const FlightEstimateSchema = z.object({
  fromCity: z.string(),
  fromIata: z.string().length(3),
  roundTripRangeLow: z.number().nonnegative(),
  roundTripRangeHigh: z.number().nonnegative(),
  currency: z.string(),
  source: SourceSchema,
  notes: z.string().nullable(),
})

export const AccommodationEstimateSchema = z.object({
  type: z.enum(['budget-hotel', 'mid-range-hotel', 'boutique-hotel', 'vacation-rental']),
  perNightRangeLow: z.number().nonnegative(),
  perNightRangeHigh: z.number().nonnegative(),
  currency: z.string(),
  source: SourceSchema,
})

export const SeasonalNoteSchema = z.object({
  months: z.array(z.number().int().min(1).max(12)),
  summary: z.string(),
  source: SourceSchema,
})

export const CatalogDestinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.string(),
  country: z.string(),
  tags: z.array(InterestSchema),
  goodFor: z.array(z.string()),
  notIdealFor: z.array(z.string()),
  flightFromHubs: z.array(FlightEstimateSchema),
  typicalAccommodation: z.array(AccommodationEstimateSchema),
  activityCostRange: CostRangeSchema,
  mealCostRange: CostRangeSchema,
  localTransportCostRange: CostRangeSchema,
  seasonalNotes: z.array(SeasonalNoteSchema),
  lastReviewed: z.string(),
  reviewedBy: z.string(),
})
