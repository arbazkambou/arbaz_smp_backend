import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have name"],
      minLength: 4,
    },
    email: {
      type: String,
      required: [true, "A user must have email"],
      validate: [validator.isEmail, "Please enter correct email"],
      unique: [true, "This email is already taken"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minLength: 8,
      select: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "inactive",
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    profilPic: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },

  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
