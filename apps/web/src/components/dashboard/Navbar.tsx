"use client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, CloudSun } from "lucide-react";
import { AddCityDialog } from "./AddCityDialog";
import { City } from "@/types";

interface NavbarProps {
  onAddCity: (
    name: string,
    country: string,
    lat?: number,
    lon?: number,
  ) => Promise<City>;
}

export function Navbar({ onAddCity }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudSun className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Weather Dashboard
            </h1>
            <p className="text-xs text-slate-400">Hello, {user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AddCityDialog onAdd={onAddCity} />
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
