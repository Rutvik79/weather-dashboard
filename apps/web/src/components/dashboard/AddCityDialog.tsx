"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { City } from "@/types";

interface AddCityDialogProps {
  onAdd: (
    name: string,
    country: string,
    lat?: number,
    lon?: number,
  ) => Promise<City>;
}

export function AddCityDialog({ onAdd }: AddCityDialogProps) {
  const [open, setOpen] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCityName("");
    setCountry("");
    setError("");
  };

  const handleAdd = async () => {
    if (!cityName.trim()) {
      setError("Please enter a city name");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onAdd(cityName.trim(), country.trim().toUpperCase() || "IN");
      reset();
      setOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add City
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a city to your dashboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="cityName">City name</Label>
            <Input
              id="cityName"
              placeholder="e.g. London, Tokyo, New York"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">
              Country code{" "}
              <span className="text-slate-400 font-normal">
                (optional, helps with duplicate city names)
              </span>
            </Label>
            <Input
              id="country"
              placeholder="default: IN, e.g. GB, JP, IN, US"
              maxLength={2}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button onClick={handleAdd} disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add City"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
