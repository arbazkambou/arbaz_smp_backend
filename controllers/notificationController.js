import { appError } from "../helpers/appError.js";
import { Notification } from "../models/notificationModel.js";

export async function getAllNotifications(req, res, next) {
  try {
    let notificationsData = {};
    const notifications = await Notification.find({ seller: req.user._id });
    const unReadNotifications = notifications.filter(
      (item) => item.read === false
    ).length;
    notificationsData.notifications = notifications;
    notificationsData.unReadNotifications = unReadNotifications;
    res.status(200).json({
      status: true,
      data: notificationsData,
    });
  } catch (error) {
    return next(appError(error.message, 401, error));
  }
}

export async function readAllNotifications(req, res, next) {
  try {
    await Notification.updateMany(
      { seller: req.user._id },
      { $set: { read: true } }
    );

    res.status(200).json({
      status: true,
    });
  } catch (error) {
    return next(appError(error.message, 401, error));
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
    });
  } catch (error) {
    return next(appError(error.message, 401, error));
  }
}
