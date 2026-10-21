import type { Interest, Source } from './plan.js'

export interface CostRange {
  low: number
  high: number
  currency: string
  source: Source
}

export interface FlightEstimate {
  fromCity: string
  fromIata: string
  roundTripRangeLow: number
  roundTripRangeHigh: number
  currency: string
  source: Source
  notes: string | null
}

export interface AccommodationEstimate {
  type: 'budget-hotel' | 'mid-range-hotel' | 'boutique-hotel' | 'vacation-rental'
  perNightRangeLow: number
  perNightRangeHigh: number
  currency: string
  source: Source
}

export interface SeasonalNote {
  months: number[]              // 1–12
  summary: string
  source: Source
}

export interface CatalogDestination {
  id: string
  name: string
  region: string
  country: string
  tags: Interest[]
  goodFor: string[]
  notIdealFor: string[]
  flightFromHubs: FlightEstimate[]
  typicalAccommodation: AccommodationEstimate[]
  activityCostRange: CostRange
  mealCostRange: CostRange
  localTransportCostRange: CostRange
  seasonalNotes: SeasonalNote[]
  lastReviewed: string          // ISO 8601 date
  reviewedBy: string
}
