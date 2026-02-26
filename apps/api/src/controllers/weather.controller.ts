import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getWeatherByCity } from "../services/weather.service";


// GET /api/weather/:cityName?country=GB
export const getWeather = async (req: AuthRequest, res: Response) => {
  const { cityName } = req.params as { cityName: string };
  const { country } = req.query as { country?: string };

  try {
    const weather = await getWeatherByCity(cityName, country);
    return res.json({ weather });
  } catch (err: any) {
    // Pass OWM "not found" errors as 404, everything else as 500
    const status = err.message.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: err.message });
  }
};
