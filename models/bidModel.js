import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bidAmount: {
      type: Number,
      required: [true, "Bid amount is required"],
    },
    message: {
      type: String,
      required: [true, "Bid message is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const Bid = mongoose.model("Bid", bidSchema);
