const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("./../../models/User")

// generate jwt token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

router.post("/signup", async (req, res) => {
    try {
        console.log(req.body);
        const { fullname, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "user already exists" });
        }

        if (!password) {
            return res.status(400).json({ message: "Please enter your password." });
        }

        const user = await User.create({
            name:fullname,
            email,
            password,
        });

        if (user) {
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            return res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);
        const user = await User.findOne({ email });
        console.log(user);
        const checkPassword = await user.matchPassword(password);

        console.log(checkPassword);

        if (!user || !checkPassword) {
            return res
                .status(400)
                .json({ message: "Invalid email or padssword" });
        }
        if (user?.isDisabled) {
            return res.status(400).json({
                message: "Your account is disabled by admin",
            });
        }
        const token =  generateToken(user._id);
        res.cookie("jwt",token, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        user.password = undefined;

        res.json({ message: "Logged in!",user,token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/social-login", async (req, res) => {
    try {
        const { fullname, email, social_login } = req.body;

        if (!fullname || !email || !social_login) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let user = await User.findOne({ email });

        if (user?.isDisabled) {
            return res.status(400).json({ message: "Your account is disabled by admin" });
        }

        if (user) {
            const token = generateToken(user._id);
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: false, 
                maxAge: 7 * 24 * 60 * 60 * 1000, 
            });

            return res.json({ message: "Logged in!", user, token });
        } else {
            user = await User.create({
                name:fullname,
                email,
                social_login
            });

            if (user) {
                const token = generateToken(user._id);
                res.cookie("jwt", token, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });

                return res.json({ message: "Logged in!", user, token });
            } else {
                return res.status(400).json({ message: "Something went wrong" });
            }
        }
    } catch (error) {
        console.error("Social login error:", error);
        return res.status(500).json({ message: error.message });
    }
});

// ✅ Auth Routes
router.get("/user", (req, res) => {
    if (req.session?.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: "User not authenticated" });
    }
});

router.post("/logout", (req, res) => {
    req.session?.destroy();
    res.json({ message: "Logged out successfully" });
});

module.exports = router;
