import { appError } from "../helpers/appError.js";
import { cloudinary } from "../helpers/cloudinary.js";
import { Bid } from "../models/bidModel.js";
import { Notification } from "../models/notificationModel.js";
import { Product } from "../models/productModel.js";
import User from "../models/userModel.js";

export async function addProduct(req, res, next) {
  try {
    req.body.seller = req.user._id;
    const product = await Product.create(req.body);
    res.status(200).json({
      status: true,
    });
    const admin = await User.findOne({ role: "admin" });
    const user = await User.findById(req.user._id);
    await Notification.create({
      message: `A product named ${product.name} has been placed by ${user.name} for approval`,
      seller: admin._id,
    });
  } catch (error) {
    return next(appError(error.message, 401));
  }
}

export async function getProducts(req, res, next) {
  try {
    let products;
    if (req.user.role === "admin") {
      products = await Product.find().populate("seller");
    } else {
      products = await Product.find({ status: "approved" })
        .populate("seller")
        .sort({
          createdAt: -1,
        });
    }
    res.status(200).json({
      status: true,
      data: products,
    });
  } catch (error) {
    return next(appError(error, 401));
  }
}

export async function getUserProducts(req, res, next) {
  try {
    const products = await Product.find({ seller: req.user._id });
    res.status(200).json({
      status: true,
      data: products,
    });
  } catch (error) {
    return next(appError(error, 401));
  }
}
export async function getProduct(req, res, next) {
  try {
    if (!req.params.id) {
      return next(appError("Product id is required!", 401));
    }
    const product = await Product.findById(req.params.id).populate("seller");
    const bids = await Bid.find({ product: req.params.id });
    product.bids = bids;
    res.status(200).json({
      status: true,
      data: product,
    });
  } catch (error) {
    return next(appError(error, 401));
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { _id, seller, status, ...data } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    res.status(200).json({
      status: true,
      data: product,
    });
  } catch (error) {
    return next(appError(error, 401));
  }
}

export async function updateProductStatus(req, res, next) {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
      }
    );

    await Notification.create({
      message: `Your product ${product.name} has been ${status} by admin`,
      seller: product.seller._id,
    });
    res.status(200).json({
      status: true,
      data: product,
    });
  } catch (error) {
    return next(appError(error, 401));
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    let public_id_array;
    if (product.images.length > 0) {
      public_id_array = product.images.map((image) => image.public_id);
      const deleteImagePromises = public_id_array.map(
        async (public_id) => await cloudinary.uploader.destroy(public_id)
      );
      await Promise.all(deleteImagePromises);
      await Product.findByIdAndDelete(req.params.id);
    } else {
      await Product.findByIdAndDelete(req.params.id);
    }

    res.status(200).json({
      status: true,
    });
  } catch (error) {
    return next(appError(error, 401));
  }
}

export async function deleteImageFromProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { publicId } = req.body;
    await cloudinary.uploader.destroy(publicId);
    await Product.findByIdAndUpdate(id, {
      $pull: { images: { public_id: publicId } },
    });
    res.status(200).json({
      status: true,
    });
  } catch (error) {
    return next(appError(error, 401));
  }
}
