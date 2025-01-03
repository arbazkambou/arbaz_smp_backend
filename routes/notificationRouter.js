import express from "express";
import { protect } from "../controllers/authControllers.js";
import {
  deleteNotification,
  getAllNotifications,
  readAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getAllNotifications);
router.patch("/read", protect, readAllNotifications);
router.delete("/:id", protect, deleteNotification);

export default router;
