import Notification from "../models/notifications.model.js";

export const getNotificationsService = async (user_id) => {
  return await Notification.findByUserId(user_id);
};

export const markAllReadService = async (user_id) => {
  await Notification.markAllAsRead(user_id);
};
