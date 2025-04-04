import express from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "../controllers/watchlist.controller.js";

const router = express.Router();

router.post("/add", verifyJwt, addToWatchlist); // Add movie to watchlist
router.get("/", verifyJwt, getWatchlist); // Get user's watchlist
router.delete("/remove", verifyJwt, removeFromWatchlist); // Remove movie from watchlist

export default router;
