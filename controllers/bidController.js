import { appError } from "../helpers/appError.js";
import { Bid } from "../models/bidModel.js";
import { Notification } from "../models/notificationModel.js";
import { Product } from "../models/productModel.js";

export async function getAllBids(req, res, next) {
  try {
    let bids;
    if (req.user.role === "admin") {
      bids = await Bid.find()
        .populate("buyer")
        .populate("seller")
        .populate("product");
    } else {
      bids = await Bid.find({ buyer: req.user._id })
        .populate("buyer")
        .populate("product")
        .populate("seller");
    }

    return res.status(200).json({
      status: true,
      data: bids,
    });
  } catch (error) {
    return next(appError(error.message, error, 401));
  }
}

export async function placeBid(req, res, next) {
  try {
    const { product, seller, message, bidAmount, buyer } = req.body;
    if (!product || !seller || !message || !bidAmount || !buyer) {
      return next(appError("Please provide all required fields", 401));
    }

    await Bid.create({
      buyer,
      seller,
      message,
      bidAmount,
      product,
    });

    const productData = await Product.findById(product);
    await Notification.create({
      seller: seller,
      message: `A bid has been placed by ${req.user.name} on your product ${productData.name} for Rs ${bidAmount}`,
    });
    await res.status(200).json({
      status: true,
    });
  } catch (error) {
    return next(appError(error.message, 401, error));
  }
}

export async function getBidsOnProduct(req, res, next) {
  try {
    const bids = await Bid.find({ product: req.params.id }).populate("buyer");

    res.status(200).json({
      status: true,
      data: bids,
    });
  } catch (error) {
    return next(appError(error.message, 401, error));
  }
}
