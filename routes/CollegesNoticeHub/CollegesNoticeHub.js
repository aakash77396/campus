const express = require("express");
const router = express.Router();
const CollegesNoticeHub = require("../../models/CollegesNoticeHub");

router.get("/", async (req, res) => {
    const response = await CollegesNoticeHub.find({});
    res.json({ response });
});

router.post("/", async (req, res) => {
    try{
    const { title, description, date } = req.body;

    const newNotices = new CollegesNoticeHub({ title, description, date });
    await newNotices.save();

    res.json({ success: true, message: "Notices added successfully!", Notices: newNotices });
    }catch (error) {
        console.error("Notices Store Error:", error);
        res.status(500).json({ success: false, message: "Error storing notices" });
    }
});











module.exports = router;
