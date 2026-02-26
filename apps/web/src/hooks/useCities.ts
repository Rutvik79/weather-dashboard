"use client";
import { useState, useEffect, useCallback } from "react";
import { City } from "@/types";
import { apiFetch } from "@/lib/api";

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchCities = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { cities } = await apiFetch<{ cities: City[] }>("/api/cities");
      setCities(cities);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const addCity = async (
    name: string,
    country: string,
    lat?: number,
    lon?: number,
  ): Promise<City> => {
    const { city } = await apiFetch<{ city: City }>("/api/cities", {
      method: "POST",
      body: JSON.stringify({ name, country, lat, lon }),
    });
    setCities((prev) => [...prev, city]);
    return city;
  };

  const removeCity = async (id: string) => {
    await apiFetch(`/api/cities/${id}`, { method: "DELETE" });
    setCities((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleFavorite = async (id: string) => {
    // Optimistic update — flip immediately in UI
    setCities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c)),
    );
    try {
      const { city } = await apiFetch<{ city: City }>(
        `/api/cities/${id}/favorite`,
        { method: "PATCH" },
      );
      // Sync with server response
      setCities((prev) => prev.map((c) => (c.id === id ? city : c)));
    } catch {
      // Rollback on failure
      setCities((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isFavorite: !c.isFavorite } : c,
        ),
      );
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    const { city } = await apiFetch<{ city: City }>(`/api/cities/${id}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    });
    setCities((prev) => prev.map((c) => (c.id === id ? city : c)));
  };

  return {
    cities,
    favoriteCities: cities.filter((c) => c.isFavorite),
    isLoading,
    error,
    addCity,
    removeCity,
    toggleFavorite,
    updateNotes,
    refetch: fetchCities,
  };
}
