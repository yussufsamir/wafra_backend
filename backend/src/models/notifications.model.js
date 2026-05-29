import db from "../config/db.js";

const Notification = {
  async create({ user_id, title, message, type }) {
    const query = `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await db.query(query, [user_id, title, message, type]);
    return result.rows[0];
  },

  async findByUserId(user_id) {
    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [user_id]);
    return result.rows;
  },

  async markAllAsRead(user_id) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1;
    `;
    await db.query(query, [user_id]);
  },
};

export default Notification;
