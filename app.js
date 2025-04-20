require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

const session = require("express-session");
const { type } = require("os");
const { Console, log } = require("console");
const path = require("path");
const multer = require("multer");
const app = express();
const cloudinary = require("cloudinary");
const User = require("./models/User");

app.use(
    session({
        secret: "my_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true }, // Use secure: true in production (HTTPS)
    })
);

app.use("/uploads", express.static("uploads"));

// ✅ Set the upload directory
const uploadPath = path.join(__dirname, "uploads");

// Ensure the upload directory exists
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ✅ Correct CORS configuration
const allowedOrigins = [
    "https://campusmitra.netlify.app",
    "http://localhost:4000",
    "https://www.campusmitra.in"
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (origin && allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);






// app.use((req, res, next) => {
//     res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
//     res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//     next();
// });

app.use(express.urlencoded({ extended: true })); // Allow form-data handling
app.use(express.json()); // Middleware to parse JSON data


// ✅ Connect to MongoDB
mongoose
    .connect(
        process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

const UserDP = require("./models/UserDP");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store temporarily
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Serve Uploaded Images
app.use("/uploads", express.static("uploads"));

// online indicator
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://campusmitra.netlify.app/", // ✅ React frontend ka URL
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Store online users: { userId: socketId }
let onlineUsers = {};

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("user-online", (userId) => {
        console.log(`User ${userId} is online`);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});
const fileUpload = require("express-fileupload");

// ✅ ✅ Add this BEFORE your API routes (very important!)
app.use((req, res, next) => {
    const apiSource = req.headers["x-api-source"];
    if (apiSource !== "campusmitra-client") {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
});

app.use("/uploads", express.static("uploads"));
app.use("/api/posts", require("./routes/posts/posts"));
app.use("/api/users", require("./routes/users/users"));
app.use("/api/auth", require("./routes/auth/auth"));
app.use("/api/follow", require("./routes/users/follow"));
app.use("/api/profile/update", require("./routes/profileUpdate/profileUpdate"));
app.use("/api/colleges", require("./routes/CollegeList/CollegeList"));
app.use("/api/notices", require("./routes/CollegesNoticeHub/CollegesNoticeHub"));


app.use(fileUpload({
    useTempFiles: true
}));



// ✅ Start Server
const PORT = process.env.PORT || 5001;


const swaggerDocs = require("./config/swaggerConfig");
// Setup Swagger
swaggerDocs(app);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
