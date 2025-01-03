import { appError } from "../helpers/appError.js";
import User from "../models/userModel.js";

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find();
    res.status(200).json({
      status: true,
      data: users,
    });
  } catch (error) {
    return next(appError(error.message, 401, error));
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { userId, userStatus } = req.body;
    if (!userId || !userStatus) {
      return next(appError("user-id and user-status is required"));
    }
    await User.findByIdAndUpdate(userId, { status: userStatus });
    res.status(200).json({
      status: true,
    });
  } catch (error) {
    return next(appError(error.message, 401, error));
  }
}
