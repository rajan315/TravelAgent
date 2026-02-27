export interface TripPreferences {
  destination: string;
  departing_from: string;
  nationality: string;
  days: number;
  travel_dates: string;
  travelers: string;
  budget: string;
  travel_style: string;
  interests: string;
  special_requirements: string;
}

export interface PhaseInfo {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export const PHASES: PhaseInfo[] = [
  { id: 'flights', title: 'Flights & Travel Options', icon: '✈️', color: '#22d3ee' },
  { id: 'hotels', title: 'Hotels & Accommodation', icon: '🏨', color: '#facc15' },
  { id: 'transport', title: 'Local Transport & Rentals', icon: '🚗', color: '#4ade80' },
  { id: 'rules', title: 'Rules, Laws & Customs', icon: '⚖️', color: '#f87171' },
  { id: 'itinerary', title: 'Day-by-Day Itinerary', icon: '🗓️', color: '#c084fc' },
];

export interface SearchEvent {
  phase_id: string;
  query: string;
  count: number;
}

export interface PhaseResult {
  phase_id: string;
  markdown: string;
  searches: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AppScreen = 'form' | 'loading' | 'results';
