"use client";
import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "@/hooks/useAuth";
import { User } from "@/types";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await apiFetch<{ user: User }>("/api/auth/me");
        setUser(user);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await apiFetch<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setUser(user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // rethrow if you want the UI to handle it
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const { user } = await apiFetch<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, name, password }),
      });

      setUser(user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
