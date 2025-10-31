import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
    },
    { timestamps: true }
);

//Hash pass before saving
userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))
        return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare pass during login
userSchema.methods.matchPassword = async function (enteredPassowrd){
    return await bcrypt.compare(enteredPassowrd, this.password);
};

//Export the model
const User = mongoose.model("User", userSchema);
export default User;