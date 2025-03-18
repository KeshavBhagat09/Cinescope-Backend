import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      (req.header("Authorization") && req.header("Authorization").replace("Bearer ", "").trim());

    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Fetch user based on decoded token
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    // Provide more specific error messages
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid Access Token: Malformed JWT");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Invalid Access Token: Token expired");
    }
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});