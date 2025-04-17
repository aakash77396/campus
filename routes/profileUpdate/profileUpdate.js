const express = require("express");
const multer = require("multer");
const UserDP = require("../../models/UserDP"); // Import your model
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage

router.patch("/:userId", upload.single("profileImage"), async (req, res) => {
    try {
        const { userId } = req.params;
        const { bio } = req.body;
        let profileImageUrl;

        if (req.file) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "user_profiles", // Optional: Folder in Cloudinary
                transformation: [{ width: 300, height: 300, crop: "fill" }] // Resize if needed
            });

            profileImageUrl = result.secure_url;

            // Delete local temp file
            fs.unlinkSync(req.file.path);
        }

        // Find user profile
        let userProfile = await UserDP.findOne({ userId });

        if (userProfile) {
            // Update profile
            userProfile.bio = bio;
            if (profileImageUrl) userProfile.profileImage = profileImageUrl;
            await userProfile.save();
            return res.json({ message: "Profile updated successfully!", userProfile });
        } else {
            // Create new profile
            userProfile = new UserDP({
                userId,
                bio,
                profileImage: profileImageUrl,
            });
            await userProfile.save();
            return res.json({ message: "Profile created successfully!", userProfile });
        }
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});

// ✅ Get user profile by userId
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const userProfile = await UserDP.findOne({ userId });

        if (!userProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(userProfile);
    } catch (error) {
        console.error("Fetch Profile Error:", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
});

module.exports = router;
