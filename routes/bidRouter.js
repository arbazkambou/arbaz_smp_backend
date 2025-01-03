import express from "express";
import { protect } from "../controllers/authControllers.js";
import { getAllBids, getBidsOnProduct } from "../controllers/bidController.js";
import { placeBid } from "../controllers/bidController.js";

const router = express.Router();

router.get("/", protect, getAllBids);
router.post("/", protect, placeBid);
router.get("/get-product-bids/:id", protect, getBidsOnProduct);

export default router;
