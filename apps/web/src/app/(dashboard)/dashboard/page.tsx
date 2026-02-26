"use client";
import { useCities } from "@/hooks/useCities";

import { Navbar } from "@/components/dashboard/Navbar";
import { Star, CloudOff } from "lucide-react";
import { CityCard } from "@/components/weather/CityCard";

export default function DashboardPage() {
  const {
    cities,
    favoriteCities,
    isLoading,
    error,
    addCity,
    removeCity,
    toggleFavorite,
    updateNotes,
  } = useCities();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onAddCity={addCity} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* ── Loading state ──────────────────────────────── */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white rounded-xl border animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ── Error state ───────────────────────────────── */}
        {!isLoading && error && (
          <div className="text-center py-16 text-red-500">
            <CloudOff className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>{error}</p>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────── */}
        {!isLoading && !error && cities.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            <CloudOff className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-500">No cities yet</p>
            <p className="text-sm mt-1">
              Click "Add City" in the top right to get started
            </p>
          </div>
        )}

        {/* ── Favorites section ─────────────────────────── */}
        {!isLoading && favoriteCities.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-yellow-600 mb-4">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              Favorites
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favoriteCities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onToggleFavorite={toggleFavorite}
                  onRemove={removeCity}
                  onUpdateNotes={updateNotes}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── All cities section ────────────────────────── */}
        {!isLoading && cities.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              All Cities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onToggleFavorite={toggleFavorite}
                  onRemove={removeCity}
                  onUpdateNotes={updateNotes}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
