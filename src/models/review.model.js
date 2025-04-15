import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    // video: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Video",
    // },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Assuming owner is mandatory
    },
  },
  { timestamps: true }
);

CommentSchema.plugin(mongooseAggregatePaginate);

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;