/**
 * Multi-Agent Travel Planning System
 * Type definitions and schemas for all agents and tools
 */

// ============================================
// CORE TYPES
// ============================================

export type AgentType = 
  | 'inspiration'
  | 'planning'
  | 'booking'
  | 'pre_trip'
  | 'in_trip'
  | 'post_trip';

export interface AgentMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  agent?: AgentType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentSession {
  id: string;
  userId: string;
  currentAgent: AgentType;
  messages: AgentMessage[];
  memory: SessionMemory;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MEMORY TYPES
// ============================================

export interface SessionMemory {
  // User preferences
  preferences: UserPreferences;
  
  // Current trip planning state
  currentTrip?: TripPlan;
  
  // Temporary agent tool responses
  tempData: Record<string, any>;
  
  // Historical trips
  pastTrips: TripPlan[];
}

export interface UserPreferences {
  nationality?: string;
  budget?: 'budget' | 'moderate' | 'luxury';
  travelStyle?: string[];
  dietaryRestrictions?: string[];
  interests?: string[];
  preferredAirlines?: string[];
  preferredHotels?: string[];
  seatPreference?: 'window' | 'aisle' | 'middle';
  roomPreference?: 'single' | 'double' | 'suite';
}

// ============================================
// TRIP PLANNING TYPES
// ============================================

export interface TripPlan {
  id: string;
  destination: Destination;
  origin: string;
  startDate: Date;
  endDate: Date;
  duration: number; // days
  travelers: number;
  
  // Booking details
  flights?: FlightBooking;
  hotel?: HotelBooking;
  
  // Itinerary
  itinerary?: Itinerary;
  
  // Status
  status: 'planning' | 'booked' | 'in_progress' | 'completed';
  
  // Payment
  totalCost?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

export interface Destination {
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  description?: string;
}

// ============================================
// FLIGHT TYPES
// ============================================

export interface FlightBooking {
  outbound: Flight;
  return: Flight;
  totalCost: number;
  bookingReference?: string;
}

export interface Flight {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // minutes
  price: number;
  availableSeats: Seat[];
  selectedSeat?: Seat;
}

export interface Seat {
  number: string;
  type: 'window' | 'aisle' | 'middle';
  class: 'economy' | 'business' | 'first';
  available: boolean;
  price: number;
}

// ============================================
// HOTEL TYPES
// ============================================

export interface HotelBooking {
  hotel: Hotel;
  room: Room;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  totalCost: number;
  bookingReference?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  availableRooms: Room[];
}

export interface Room {
  id: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  beds: number;
  maxOccupancy: number;
  amenities: string[];
  pricePerNight: number;
  available: boolean;
}

// ============================================
// ITINERARY TYPES
// ============================================

export interface Itinerary {
  days: DayPlan[];
  totalCost: number;
  generatedAt: Date;
}

export interface DayPlan {
  day: number;
  date: Date;
  activities: Activity[];
  meals: Meal[];
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: 'sightseeing' | 'dining' | 'entertainment' | 'shopping' | 'relaxation' | 'adventure';
  location: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  cost: number;
  description: string;
  bookingRequired: boolean;
  bookingUrl?: string;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  restaurant: string;
  cuisine: string;
  estimatedCost: number;
  location: string;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface Payment {
  method: 'apple_pay' | 'google_pay' | 'credit_card';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  transactionId?: string;
  timestamp: Date;
}

// ============================================
// PRE-TRIP INFO TYPES
// ============================================

export interface PreTripInfo {
  destination: string;
  origin: string;
  nationality: string;
  
  // Requirements
  visaRequired: boolean;
  visaInfo?: string;
  vaccinations?: string[];
  travelAdvisory?: string;
  
  // Practical info
  currency: string;
  exchangeRate?: number;
  weather?: WeatherInfo;
  localCustoms?: string[];
  emergencyNumbers?: Record<string, string>;
  
  // Packing suggestions
  packingList?: string[];
}

export interface WeatherInfo {
  temperature: {
    high: number;
    low: number;
  };
  conditions: string;
  precipitation: number;
  humidity: number;
}

// ============================================
// IN-TRIP TYPES
// ============================================

export interface InTripAssistance {
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  nextActivity?: Activity;
  transitInfo?: TransitInfo;
  bookingChanges?: BookingChange[];
  emergencyInfo?: EmergencyInfo;
}

export interface TransitInfo {
  from: string;
  to: string;
  modes: TransitMode[];
  estimatedTime: number;
  estimatedCost: number;
}

export interface TransitMode {
  type: 'walk' | 'taxi' | 'bus' | 'train' | 'subway' | 'bike';
  duration: number;
  cost: number;
  instructions: string[];
}

export interface BookingChange {
  type: 'flight' | 'hotel' | 'activity';
  status: 'delayed' | 'cancelled' | 'changed';
  originalTime?: Date;
  newTime?: Date;
  message: string;
}

export interface EmergencyInfo {
  police: string;
  ambulance: string;
  fire: string;
  embassy?: string;
  nearestHospital?: string;
}

// ============================================
// POST-TRIP TYPES
// ============================================

export interface TripFeedback {
  tripId: string;
  rating: number; // 1-5
  highlights: string[];
  improvements: string[];
  wouldRecommend: boolean;
  
  // Extracted preferences
  preferredActivities?: string[];
  preferredCuisines?: string[];
  budgetComfort?: 'budget' | 'moderate' | 'luxury';
  pacePreference?: 'relaxed' | 'moderate' | 'packed';
}

// ============================================
// TOOL RESPONSE TYPES
// ============================================

export interface MapToolResponse {
  address: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface PlaceRecommendation {
  name: string;
  description: string;
  type: string;
  rating: number;
  whyRecommended: string;
}

export interface POIRecommendation {
  name: string;
  type: string;
  description: string;
  estimatedDuration: number;
  cost: number;
  bestTimeToVisit: string;
}

// ============================================
// AGENT RESPONSE TYPES
// ============================================

export interface AgentResponse {
  agent: AgentType;
  message: string;
  actions?: AgentAction[];
  nextAgent?: AgentType;
  requiresInput?: boolean;
  data?: Record<string, any>;
}

export interface AgentAction {
  type: string;
  label: string;
  data: any;
}

