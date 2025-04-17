const express = require("express");
const College = require("../../models/collegeList"); // College Model Import
const router = express.Router();

// 🔹 Get All College Names
router.get("/", async (req, res) => {
    try {
        const colleges = await College.find({}, "name"); // Sirf "name" field fetch
        res.json({ success: true, colleges }); // Array of objects return kar rahe
    } catch (error) {
        console.error("Fetch Colleges Error:", error);
        res.status(500).json({ success: false, message: "Error fetching colleges" });
    }
});

// ✅ College Name Store Karne Ka Route
router.post("/", async (req, res) => {
    try {
        const { name, location, website } = req.body;

        // College Already Exists?
        const existingCollege = await College.findOne({ name });
        if (existingCollege) {
            return res.status(400).json({ success: false, message: "College already exists" });
        }

        // Naya College Add Karo
        const newCollege = new College({ name, location, website });
        await newCollege.save();

        res.json({ success: true, message: "College added successfully!", college: newCollege });
    } catch (error) {
        console.error("College Store Error:", error);
        res.status(500).json({ success: false, message: "Error storing college" });
    }
});


module.exports = router;
