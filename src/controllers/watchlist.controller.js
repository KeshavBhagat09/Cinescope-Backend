import Watchlist from "../models/watchlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// ✅ Add a movie to the user's watchlist
const addToWatchlist = asyncHandler(async (req, res, next) => {
  console.log("📥 Request Body:", req.body);
  console.log("🆔 User ID from Middleware:", req.user?._id);

  const { productId } = req.body;
  const userId = req.user?._id;

  if (!productId) {
    console.log("🚨 Missing Product ID");
    return next(new ApiError(400, "Product ID is required"));
  }

  let watchlist = await Watchlist.findOne({ userId });

  console.log("📝 Existing Watchlist:", watchlist);

  if (watchlist) {
    const isAlreadyAdded = watchlist.items.some(
      (item) => item.productId.toString() === productId
    );

    if (isAlreadyAdded) {
      console.log("⚠️ Movie already exists in Watchlist");
      return res.status(200).json(
        new ApiResponse(200, watchlist, "Movie is already in your watchlist")
      );
    }

    watchlist.items.push({ productId });
  } else {
    watchlist = new Watchlist({ userId, items: [{ productId }] });
  }

  await watchlist.save();
  console.log("✅ Watchlist Updated Successfully!");

  res.status(201).json(
    new ApiResponse(201, watchlist, "Movie added to watchlist successfully")
  );
});


// ✅ Get user's watchlist
const getWatchlist = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const watchlist = await Watchlist.findOne({ userId }).populate({
    path: "items.productId",
    select: "title imageUrl thumbnail", // Only necessary fields
  });

  if (!watchlist) {
    throw new ApiError(404, "Watchlist not found");
  }

  res.status(200).json(
    new ApiResponse(200, watchlist, "Watchlist fetched successfully")
  );
});

// ✅ Remove a movie from watchlist
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user?._id;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const watchlist = await Watchlist.findOne({ userId });

  if (!watchlist) {
    throw new ApiError(404, "Watchlist not found");
  }

  const updatedItems = watchlist.items.filter(
    (item) => item.productId.toString() !== productId
  );

  if (updatedItems.length === watchlist.items.length) {
    throw new ApiError(400, "Movie not found in watchlist");
  }

  watchlist.items = updatedItems;
  await watchlist.save();

  res.status(200).json(
    new ApiResponse(200, watchlist, "Movie removed from watchlist")
  );
});

export { addToWatchlist, getWatchlist, removeFromWatchlist };
