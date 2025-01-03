import sharp from "sharp";
import { appError } from "./appError.js";
import { Product } from "../models/productModel.js";
import { cloudinary } from "./cloudinary.js";

export async function uploadImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return next(appError("No image uploaded", 400));
    }

    const uploadPromises = req.files.map(async (file) => {
      // Resize the image using Sharp
      const resizedImage = await sharp(file.buffer)
        .resize({ width: 800, height: 800, fit: "inside" })
        .toFormat("jpeg")
        .jpeg({ quality: 80 })
        .toBuffer();

      // Since Cloudinary's upload_stream is callback-based, we need to wrap it in a Promise
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "uploads" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(resizedImage);
        });
      };

      const uploadResult = await uploadStream();

      await Product.findByIdAndUpdate(req.params.id, {
        $push: {
          images: {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          },
        },
      });
    });

    await Promise.all(uploadPromises);

    res
      .status(200)
      .json({ status: true, message: "Images uploded successfully" });
  } catch (error) {
    console.log("err", error);
    return next(appError(error.message, 500, error));
  }
}
