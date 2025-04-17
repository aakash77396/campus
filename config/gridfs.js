const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");

const mongoURI = "your_mongodb_atlas_connection_string"; // 🔹 अपने MongoDB Atlas का कनेक्शन स्ट्रिंग डालो

const conn = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads"); // 🔹 GridFS में "uploads" नाम का बकेट बनेगा
});

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return {
            filename: `profile_${Date.now()}_${file.originalname}`,
            bucketName: "uploads", // 🔹 बकेट का नाम "uploads" ही रखना
        };
    },
});

const upload = multer({ storage });

module.exports = { upload, gfs };
