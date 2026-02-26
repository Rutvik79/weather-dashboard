import { Router } from "express";
import { getWeather } from "../controllers/weather.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/:cityName", authMiddleware, getWeather);

export default router;
