const mongoose = require("mongoose");

const CollegesNoticeHubSchema = new mongoose.Schema({
    title: { type: String, required: true}, // Event heading
    description: { type: String }, 
    date: { type: String }  
});

const CollegesNoticeHub = mongoose.model("CollegesNoticeHub", CollegesNoticeHubSchema);
module.exports = CollegesNoticeHub;
