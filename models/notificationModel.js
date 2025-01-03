import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "Message is required"],
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  read: {
    type: Boolean,
    default: false,
  },
});

export const Notification = mongoose.model("Notification", notificationSchema);
