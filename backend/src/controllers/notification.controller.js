import {
  getNotificationsService,
  markAllReadService,
} from "../services/notification.service.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsService(req.user.user_id);
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await markAllReadService(req.user.user_id);
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
