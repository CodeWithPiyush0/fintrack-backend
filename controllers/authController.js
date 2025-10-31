import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// function to generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Signup controller
export const signup = async (req, res) => {
    try{
        const { name, email, password } = req.body;

        //check if user exists
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: "User already exists" });
        }

        // create new user
        const user = await User.create({ name, email, password });

        // generate JWT token
        const token = generateToken(user._id);

        // send success response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// login controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //check if user exists
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "User Logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}