const express = require("express");
const router = express.Router();
const User = require("./../../models/User");

// ✅ API Endpoint to Save User Data
router.post("/", async (req, res) => {
    try {
        const { sub, name, email, email_verified, picture } = req.body;

        if (!sub || !email) {
            return res.status(400).json({ message: "Invalid user data" });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // If user does not exist, create a new one
            user = new User({ sub, name, email, email_verified, picture });
            await user.save();

            // Store user session
            req.session.user = user;
            return res
                .status(201)
                .json({ message: "User created successfully", user });
        }

        // If user already exists, return success without updating anything
        return res.status(200).json({ message: "User already exists", user });
    } catch (error) {
        console.error("❌ Error saving user:", error);
        res.status(500).json({ message: "Error saving user" });
    }
});

// ✅ API Endpoint to Get All User Data
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ users });
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        return res
            .status(500)
            .json({ message: "Error fetching users", error: error.message });
    }
});

// ✅ Fetch user by ID
router.get("/:userId", async (req, res) => {
    try {
        console.log("Fetching user with sub:", req.params.userId); // Debugging log

        const user = await User.findOne({ _id: req.params.userId });

        if (!user) {
            console.log("User not found:", req.params.userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User found:", user);
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
