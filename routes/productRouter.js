import express from "express";
import { protect, restrict } from "../controllers/authControllers.js";
import {
  addProduct,
  deleteImageFromProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getUserProducts,
  updateProduct,
  updateProductStatus,
} from "../controllers/productController.js";
import { upload } from "../helpers/multur.js";
import { uploadImages } from "../helpers/uploadImages.js";

const router = express.Router();

router.get("/", protect, getProducts);
router.post(
  "/:id/update-status",
  protect,
  restrict("admin"),
  updateProductStatus
);
router.get("/get-user-products", protect, getUserProducts);
router.put("/:id/images", protect, upload.array("images", 10), uploadImages);
router.delete("/:id/images", protect, deleteImageFromProduct);
router.get("/:id", protect, getProduct);
router.post("/", protect, addProduct);
router.post("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
