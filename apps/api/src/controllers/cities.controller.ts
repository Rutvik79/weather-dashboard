import { Response } from "express";
import { db } from "../db";
import { cities } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

const idSchema = z.uuid();

const addCitySchema = z.object({
  name: z.string().min(1),
  country: z.string().min(2).max(10),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

const updateNotesSchema = z.object({
  notes: z.string().nullable().optional(),
});

// GET /api/cities
export const getCities = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userCities = await db
      .select()
      .from(cities)
      .where(eq(cities.userId, req.userId))
      .orderBy(cities.addedAt);

    return res.json({ cities: userCities });
  } catch (error) {
    console.error("Get cities error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/cities
export const addCity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const parsed = addCitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
    }

    const { name, country, lat, lon } = parsed.data;

    const [city] = await db
      .insert(cities)
      .values({
        userId: req.userId,
        name,
        country,
        lat: lat?.toString(),
        lon: lon?.toString(),
      })
      .returning();

    return res.status(201).json({ city });
  } catch (err: any) {
    // Postgres unique constraint violation code
    if (err.code === "23505") {
      return res.status(409).json({ error: "City already on your dashboard" });
    }
    throw err;
  }
};

// DELETE /api/cities/:id
export const deleteCity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return res.status(400).json({ error: "Invalid city id" });
    }
    const id = req.params.id as string;

    const deleted = await db
      .delete(cities)
      .where(and(eq(cities.id, id), eq(cities.userId, req.userId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }

    return res.json({ message: "City removed" });
  } catch (error) {
    console.error("Delete city error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/cities/:id/favorite
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return res.status(400).json({ error: "Invalid city id" });
    }

    const id = parsedId.data;

    // First fetch the city to get current favorite status
    const [city] = await db
      .select()
      .from(cities)
      .where(and(eq(cities.id, id), eq(cities.userId, req.userId)))
      .limit(1);

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    const [updated] = await db
      .update(cities)
      .set({ isFavorite: !city.isFavorite })
      .where(eq(cities.id, id))
      .returning();

    return res.json({ city: updated });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/cities/:id/notes
export const updateNotes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success) {
      return res.status(400).json({ error: "Invalid city id" });
    }

    const parsedBody = updateNotesSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: "Invalid notes format" });
    }

    const id = parsedId.data;
    const { notes } = parsedBody.data;

    const [city] = await db
      .update(cities)
      .set({ notes: notes ?? null })
      .where(and(eq(cities.id, id), eq(cities.userId, req.userId)))
      .returning();

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    return res.json({ city });
  } catch (error) {
    console.error("Update notes error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
