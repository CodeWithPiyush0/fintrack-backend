import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        // get token from headers
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        //extract token after "Bearer "
        const token = authHeader.split(" ")[1];

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user by id (exclude passowrd)
        req.user = await User.findById(decoded.id).select("-password");

        // continue to next middleware or controller
        next();
    } catch (error) {
        console.error(error);
        res.ststus(401).json({ message: "Token is invalid or expired" });
    }
};