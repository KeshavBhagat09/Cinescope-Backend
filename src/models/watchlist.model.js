import mongoose, { Schema } from "mongoose";

const WatchlistItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product", // Reference to Product model
      required: true,
    },
  },
  { timestamps: true }
);

const WatchlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
      unique: true, // Ensures one watchlist per user
    },
    items: [WatchlistItemSchema], // List of products in watchlist
  },
  { timestamps: true }
);

const Watchlist = mongoose.model("Watchlist", WatchlistSchema);

export default Watchlist;
