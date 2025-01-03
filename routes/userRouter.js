import express from "express";
import {
  confirmEmail,
  forgotPassword,
  isAuthenticated,
  login,
  logout,
  protect,
  register,
  resetPassword,
  restrict,
} from "../controllers/authControllers.js";
import {
  getAllUsers,
  updateUserStatus,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, restrict("admin"), getAllUsers);

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/isAuthenticated", isAuthenticated);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/token/:token", resetPassword);

router.get("/confirm-email/token/:token/user/:id", confirmEmail);

router.patch(
  "/update-user-status",
  protect,
  restrict("admin"),
  updateUserStatus
);

export default router;
