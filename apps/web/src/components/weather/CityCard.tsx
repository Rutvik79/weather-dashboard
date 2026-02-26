"use client";
import { useState, useEffect } from "react";
import { City, WeatherData } from "@/types";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Trash2,
  Thermometer,
  Droplets,
  Wind,
  NotebookPen,
} from "lucide-react";

interface CityCardProps {
  city: City;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => Promise<void>;
}

export function CityCard({
  city,
  onToggleFavorite,
  onRemove,
  onUpdateNotes,
}: CityCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Notes state
  const [notes, setNotes] = useState(city.notes || "");
  const [notesDirty, setNotesDirty] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError("");
    try {
      const { weather } = await apiFetch<{ weather: WeatherData }>(
        `/api/weather/${encodeURIComponent(city.name)}?country=${city.country}`,
      );
      setWeather(weather);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [city.id]);

  // Sync notes if city prop updates (e.g. after refetch)
  useEffect(() => {
    setNotes(city.notes || "");
  }, [city.notes]);

  const saveNotes = async () => {
    setNotesSaving(true);
    try {
      await onUpdateNotes(city.id, notes);
      setNotesDirty(false);
      setNotesOpen(false);
    } finally {
      setNotesSaving(false);
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-6 text-center space-y-2">
          <p className="text-sm font-medium text-slate-700">{city.name}</p>
          <p className="text-xs text-red-500">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={fetchWeather}>
              Retry
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(city.id)}
              className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Main Card ──────────────────────────────────────────────────────────────
  return (
    <Card
      className={`transition-all ${
        city.isFavorite ? "border-yellow-400 shadow-md shadow-yellow-100" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base leading-tight">
              {city.name}
            </h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {city.country}
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5">
            {/* Notes button */}
            <Popover open={notesOpen} onOpenChange={setNotesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${notes ? "text-blue-500" : "text-slate-300 hover:text-slate-500"}`}
                >
                  <NotebookPen className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" side="left">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Notes — {city.name}</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setNotesDirty(true);
                    }}
                    placeholder="Add a personal note..."
                    className="text-sm resize-none"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={saveNotes}
                      disabled={!notesDirty || notesSaving}
                      className="flex-1"
                    >
                      {notesSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNotesOpen(false);
                        setNotes(city.notes || "");
                        setNotesDirty(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Favorite button */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${city.isFavorite ? "text-yellow-500" : "text-slate-300 hover:text-yellow-400"}`}
              onClick={() => onToggleFavorite(city.id)}
            >
              <Star
                className="h-4 w-4"
                fill={city.isFavorite ? "currentColor" : "none"}
              />
            </Button>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-300 hover:text-red-500"
              onClick={() => onRemove(city.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {weather && (
          <>
            {/* Temperature + icon */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                className="w-12 h-12"
              />
              <div>
                <p className="text-3xl font-bold leading-none">
                  {weather.temperature}°C
                </p>
                <p className="text-slate-500 capitalize text-xs mt-0.5">
                  {weather.description}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-1 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 shrink-0" />
                <span>Feels {weather.feelsLike}°</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3 shrink-0" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3 shrink-0" />
                <span>{weather.windSpeed} m/s</span>
              </div>
            </div>

            {/* Notes preview */}
            {notes && (
              <p className="text-xs text-blue-500 mt-2 truncate italic">
                📝 {notes}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
