import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth.middleware";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const { email, name, password } = parsed.data;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({ email, name, password: hashedPassword })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
    });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  res.cookie("token", token, COOKIE_OPTIONS);

  return res.status(201).json({ user });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  res.cookie("token", token, COOKIE_OPTIONS);

  return res.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .where(eq(users.id, req.userId!))
    .limit(1);

  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out" });
};
