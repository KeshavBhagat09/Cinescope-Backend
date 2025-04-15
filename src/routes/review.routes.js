import express from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createReview,
  updateReview,
  deleteReview,
  getReviews
} from "../controllers/review.controller.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/comment", verifyJwt, createReview); // Create a comment
router.put("/comment/:commentId", verifyJwt, updateReview); // PUT /api/v1/comments/comment/:commentId
router.delete("/comment/:commentId", verifyJwt, deleteReview); // DELETE /api/v1/comments/comment/:commentId


// Public or protected route (depending on your needs)
router.get("/", getReviews); // Get paginated comments

export default router;