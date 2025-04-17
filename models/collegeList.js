const mongoose = require("mongoose");

const CollegeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // College ka naam
    location: { type: String }, // (Optional) Location store karna ho to
    website: { type: String }  // (Optional) College ka official website
});

const College = mongoose.model("College", CollegeSchema);
module.exports = College;
