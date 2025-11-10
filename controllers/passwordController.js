import User from "../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// forgot password (send mail)
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: "user not found" });
        }

        //create token valid for 15 min
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

        //reset link
        const resetLink = `http://localhost:5173/reset-password/${token}`;

        const testAccount = await nodemailer.createTestAccount();

        //email setup
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const mailOptions = {
            from: '"FinTrack Support" <no-reply@fintrack.com>',
            to: email,
            subject: "Reset your FinTrack password",
            html: `
                <div style="font-family: Poppins, Arial, sans-serif; background: #f8fafc; padding: 30px;">
                    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); padding: 30px;">
                        <div style="text-align: center">
                            <h2 style="color: #00b894;">FinTrack</h2>
                        </div>
                        <h3 style="color: #333;">Password Reset Request</h3>
                        <p style="color: #555;">Hello,</p>
                        <p style="color: #555;">
                            We received a request to reset you password. Click the button below to set a new one. THis link will expire in <b>14 minutes</b>.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" target="_blank" style="background: #00b894; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #888; font-size: 14px;">
                            If you didn't request thism you can safely ignore this email.
                        </p>
                        <p style="color: #888; font-size: 13px text-align: center;">
                            &copy ${new Date().getFullYear()} FinTrack. All rights deserved.
                        </p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Password reset email sent!");
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

        res.status(200).json({ message: "Reset link sent check console for preview URL." });
    } catch (error) {
        console.error("Forgot Password error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// reset password (verify token)
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    console.log("received token:", token ? "present" : "missing");
    console.log("received password:", password ? "present" : "missing")

    try {
        if(!token){
            return res.status(400).json({ message: "Token missing" });
        }

        if(!password){
            return res.status(400).json({ message: "Password missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        user.password = password;
        await user.save();

        res.status(200).json({ message: "Password reset successfully!" });
    } catch (error) {
        console.error("Reset passwrod error:", error);
        res.status(400).json({ message: "Invalid or expired token" });
    }
};