import db from "../config/db.js";

const Pickup = {
  // CREATE PICKUP
  async create(
    {
      reservation_id,
      code,
      qr_code,
      expires_at,
    },
    client = db
  ) {
    const query = `
      INSERT INTO pickups (
        reservation_id,
        code,
        qr_code,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      reservation_id,
      code,
      qr_code,
      expires_at,
    ];

    const result = await client.query(
      query,
      values
    );

    return result.rows[0];
  },

  // FIND BY RESERVATION
  async findByReservationId(
    reservation_id,
    client = db
  ) {
    const query = `
      SELECT *
      FROM pickups
      WHERE reservation_id = $1;
    `;

    const result = await client.query(
      query,
      [reservation_id]
    );

    return result.rows[0];
  },

  // FIND BY CODE
  async findByCode(
    code,
    client = db
  ) {
    const query = `
      SELECT 
        p.*,

        r.status AS reservation_status,
        r.user_id AS receiver_user_id,
        r.requested_quantity,
        r.listing_id,
        r.reservation_id,

        fl.restaurant_id,
        fl.food_name

      FROM pickups p

      JOIN reservations r
      ON p.reservation_id = r.reservation_id

      JOIN food_listings fl
      ON r.listing_id = fl.listing_id

      WHERE p.code = $1;
    `;

    const result = await client.query(
      query,
      [code]
    );

    return result.rows[0];
  },

  // MARK AS USED
  async markAsUsed(
    pickup_id,
    client = db
  ) {
    const query = `
      UPDATE pickups
      SET
        status = 'used',
        confirmed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE pickup_id = $1
      RETURNING *;
    `;

    const result = await client.query(
      query,
      [pickup_id]
    );

    return result.rows[0];
  },

  // EXPIRE PICKUP
  async expirePickup(
    pickup_id,
    client = db
  ) {
    const query = `
      UPDATE pickups
      SET
        status = 'expired',
        updated_at = CURRENT_TIMESTAMP
      WHERE pickup_id = $1
      RETURNING *;
    `;

    const result = await client.query(
      query,
      [pickup_id]
    );

    return result.rows[0];
  },
};

export default Pickup;