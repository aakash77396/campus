const mongoose = require("mongoose");

const userDPSchema = new mongoose.Schema({
  userId:{type:String , required:false, unique:true }, // ✅ Store `userId` as a string
  bio:{type:String , required:false, },
  profileImage:{type:String , required:false, },
});

const UserDP = mongoose.model("UserDP", userDPSchema);

module.exports = UserDP;
