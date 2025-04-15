import Comment from "../models/review.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Create a new comment
const createReview = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user?._id; // From verifyJwt middleware

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.create({
    content: content.trim(),
    owner: userId,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to create comment");
  }

  // Populate owner details for response
  const populatedComment = await Comment.findById(comment._id).populate(
    "owner",
    "username avatar"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedComment, "Comment created successfully")
    );
});

// Update an existing comment
const updateReview = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  console.log("commentId", req.params);
  
  const { content } = req.body;
  const userId = req.user?._id;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Updated content is required");
  }

  const review = await Comment.findById(commentId);
  if (!review) {
    throw new ApiError(404, "review not found");
  }

  // Check if the user owns the comment
  if (review.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  comment.content = content.trim();
  await review.save();

  // Populate owner details for response
  const updatedComment = await Comment.findById(review._id).populate(
    "owner",
    "username avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

// Delete a comment
const deleteReview = asyncHandler(async (req, res) => {
  const { ReviewId } = req.params;
 
  const userId = req.user?._id;

  if (!ReviewIdeviewId) {
    throw new ApiError(400, "Comment ID is required");
  }

  const review = await Comment.findById(ReviewId);
  if (!review) {
    throw new ApiError(404, "review not found");
  }

  // Check if the user owns the comment
  if (review.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await review.findByIdAndDelete(ReviewId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

// Get paginated comments (e.g., for a resource)
const getReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 }, // Newest first
    populate: { path: "owner", select: "username avatar" }, // Populate owner details
  };

  // Aggregation pipeline (can be customized based on needs)
  const aggregateQuery = Comment.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        "owner.username": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  const result = await Comment.aggregatePaginate(aggregateQuery, options);

  if (!result) {
    throw new ApiError(500, "Failed to fetch comments");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments: result.docs,
        totalDocs: result.totalDocs,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
      "Comments fetched successfully"
    )
  );
});

export { createReview, updateReview, deleteReview, getReviews };