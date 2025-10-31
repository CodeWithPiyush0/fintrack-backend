import express from "express";
import { signup, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/login
router.post("/login", login);

//Protected route for testing
router.get("/profile", protect, (req, res) => {
    res.json({ message: "Access granted to protected route",
        user: req.user,
    });
});

export default router;