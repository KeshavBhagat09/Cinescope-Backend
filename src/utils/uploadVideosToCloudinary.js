import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Video from "../models/Video.models.js"; // Import Video model
import connectDB from "../db/index.js";
dotenv.config();

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dcm0yakuc",
  api_key: process.env.CLOUDINARY_API_KEY || "111686871396262",
  api_secret: process.env.CLOUDINARY_API_SECRET || "m7aReiB0WQM674NKkeEq0i23zcg",
});

// Get __dirname equivalent in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Define video folder path
const VIDEO_FOLDER = path.join(__dirname, "../../Public/videos");

// Ensure the folder exists
if (!fs.existsSync(VIDEO_FOLDER)) {
  console.log("⚠️ Folder 'public/videos' not found. Creating it...");
  fs.mkdirSync(VIDEO_FOLDER, { recursive: true });
}

// ✅ Upload a single video to Cloudinary and save to MongoDB
const uploadVideoToCloudinary = async (videoPath, fileName) => {
  try {
    console.log(`🚀 Uploading ${fileName} to Cloudinary...`);

    const result = await cloudinary.uploader.upload(videoPath, {
      resource_type: "video",
      folder: "videos",
    });

    console.log(`✅ Successfully uploaded ${fileName}: ${result.secure_url}`);

    // Extract title from filename (remove extension)
    const title = path.parse(fileName).name;

    // Save video details to MongoDB
    const newVideo = new Video({
      title,
      videoUrl: result.secure_url,
      thumbnail: result.secure_url.replace("/upload/", "/upload/w_300,h_200/"), // Generate a small thumbnail
    });

    await newVideo.save();
    console.log(`📦 Saved to DB: ${title}`);

    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error);
    throw new ApiError(500, "Error uploading video to Cloudinary");
  }
};

// ✅ Upload all videos from folder, save to Cloudinary & DB
export const uploadAllVideos = async () => {
  try {
    await connectDB();
    console.log("📂 Checking video folder...");
    const files = fs.readdirSync(VIDEO_FOLDER);

    if (files.length === 0) {
      console.log("⚠️ No videos found in the folder.");
      return new ApiResponse(200, "No videos found.");
    }

    let uploadedVideos = [];

    for (const file of files) {
      const filePath = path.join(VIDEO_FOLDER, file);
      const videoUrl = await uploadVideoToCloudinary(filePath, file);
      uploadedVideos.push(videoUrl);

      // 🗑️ Delete local file after upload
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted local file: ${file}`);
    }

    console.log("🎉 All videos uploaded successfully!");
    return new ApiResponse(200, "Videos uploaded successfully", uploadedVideos);
  } catch (error) {
    console.error("❌ Error processing video uploads:", error);
    throw new ApiError(500, "Error processing video uploads");
  }
};

// ✅ Call the function to upload all videos
uploadAllVideos().catch((err) => console.error("❌ Upload Error:", err));