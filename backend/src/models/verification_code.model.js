import db from "../config/db.js";

const VerificationCode = {
  async create({ user_id, code, type, expires_at }) {
    const query = `
      INSERT INTO verification_codes (user_id, code, type, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await db.query(query, [user_id, code, type, expires_at]);
    return result.rows[0];
  },

  async findValid({ user_id, code, type }) {
    const query = `
      SELECT * FROM verification_codes
      WHERE user_id = $1
        AND code = $2
        AND type = $3
        AND used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const result = await db.query(query, [user_id, code, type]);
    return result.rows[0];
  },

  async invalidateAll(user_id, type) {
    const query = `
      UPDATE verification_codes
      SET used = TRUE
      WHERE user_id = $1 AND type = $2 AND used = FALSE;
    `;
    await db.query(query, [user_id, type]);
  },

  async markUsed(id) {
    const query = `
      UPDATE verification_codes SET used = TRUE WHERE id = $1;
    `;
    await db.query(query, [id]);
  },
};

export default VerificationCode;
