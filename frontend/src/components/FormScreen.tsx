import { useState } from 'react';
import type { TripPreferences } from '../types';

const DEFAULT_PREFS: TripPreferences = {
  destination: '',
  departing_from: '',
  nationality: '',
  days: 5,
  travel_dates: '',
  travelers: '1 adult',
  budget: 'mid-range',
  travel_style: 'mixed',
  interests: '',
  special_requirements: '',
};

export function FormScreen({ onSubmit }: { onSubmit: (prefs: TripPreferences) => void }) {
  const [prefs, setPrefs] = useState<TripPreferences>(DEFAULT_PREFS);

  const set = (field: keyof TripPreferences) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const val = field === 'days' ? Number(e.target.value) || 1 : e.target.value;
    setPrefs((p) => ({ ...p, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefs.destination.trim()) return;
    onSubmit(prefs);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🌍 TravelAI
          </h1>
          <p className="text-gray-400 mt-2">AI-powered trip planner with real-time research</p>
          <div className="flex justify-center gap-2 mt-3 text-xs text-gray-500">
            <span>✈️ Flights</span>
            <span>→</span>
            <span>🏨 Hotels</span>
            <span>→</span>
            <span>🚗 Transport</span>
            <span>→</span>
            <span>⚖️ Rules</span>
            <span>→</span>
            <span>🗓️ Itinerary</span>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-indigo-500/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="📍 Destination" required>
              <input
                value={prefs.destination}
                onChange={set('destination')}
                placeholder="e.g. Goa, Bali, Tokyo"
                className="input"
                required
              />
            </Field>

            <Field label="🛫 Departing from">
              <input
                value={prefs.departing_from}
                onChange={set('departing_from')}
                placeholder="e.g. Mumbai, New Delhi"
                className="input"
              />
            </Field>

            <Field label="🛂 Nationality">
              <input
                value={prefs.nationality}
                onChange={set('nationality')}
                placeholder="e.g. Indian"
                className="input"
              />
            </Field>

            <Field label="📅 Number of days">
              <input
                type="number"
                value={prefs.days}
                onChange={set('days')}
                min={1}
                max={60}
                className="input"
              />
            </Field>

            <Field label="🗓️ Travel dates">
              <input
                value={prefs.travel_dates}
                onChange={set('travel_dates')}
                placeholder="e.g. March 15-20, 2026"
                className="input"
              />
            </Field>

            <Field label="👥 Travelers">
              <input
                value={prefs.travelers}
                onChange={set('travelers')}
                placeholder="e.g. 2 adults, 1 kid"
                className="input"
              />
            </Field>

            <Field label="💰 Budget">
              <select value={prefs.budget} onChange={set('budget')} className="input">
                <option value="budget">Budget</option>
                <option value="mid-range">Mid-range</option>
                <option value="luxury">Luxury</option>
              </select>
            </Field>

            <Field label="🎯 Travel style">
              <select value={prefs.travel_style} onChange={set('travel_style')} className="input">
                <option value="adventure">Adventure</option>
                <option value="cultural">Cultural</option>
                <option value="relaxation">Relaxation</option>
                <option value="foodie">Foodie</option>
                <option value="mixed">Mixed</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="❤️ Interests">
                <input
                  value={prefs.interests}
                  onChange={set('interests')}
                  placeholder="hiking, museums, nightlife, photography..."
                  className="input"
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="📝 Special requirements">
                <input
                  value={prefs.special_requirements}
                  onChange={set('special_requirements')}
                  placeholder="dietary, accessibility, etc."
                  className="input"
                />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            className="btn-glow mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition-colors cursor-pointer"
          >
            🚀 Start Research
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-300 mb-1 block">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
