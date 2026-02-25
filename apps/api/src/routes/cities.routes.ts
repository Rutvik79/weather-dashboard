import { Router } from "express";
import {
  getCities,
  addCity,
  deleteCity,
  toggleFavorite,
  updateNotes,
} from "../controllers/cities.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All city routes are protected — apply middleware once at the top
router.use(authMiddleware);

router.get("/", getCities);
router.post("/", addCity);
router.delete("/:id", deleteCity);
router.patch("/:id/favorite", toggleFavorite);
router.patch("/:id/notes", updateNotes);

export default router;
