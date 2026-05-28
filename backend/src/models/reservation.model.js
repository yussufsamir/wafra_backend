import db from "../config/db.js";

const Reservation = {
  // CREATE RESERVATION
  async create(
    { listing_id, user_id, requested_quantity },
    client = db
  ) {
    const query = `
      INSERT INTO reservations (
        listing_id,
        user_id,
        requested_quantity
      )
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [
      listing_id,
      user_id,
      requested_quantity,
    ];

    const result = await client.query(
      query,
      values
    );

    return result.rows[0];
  },

  // FIND BY ID
  async findById(
    reservation_id,
    client = db
  ) {
    const query = `
      SELECT 
        res.*,

        fl.food_name,
        fl.category,
        fl.quantity,
        fl.pickup_time,
        fl.location,
        fl.restaurant_id,

        r.restaurant_name,

        u.email AS receiver_email,
        u.role AS receiver_role,

        CASE
          WHEN u.role = 'individual'
          THEN CONCAT(i.first_name, ' ', i.last_name)

          WHEN u.role = 'foodbank'
          THEN fb.organization_name

          ELSE u.email
        END AS receiver_name,

        CASE
          WHEN u.role = 'individual'
          THEN i.phone

          WHEN u.role = 'foodbank'
          THEN fb.phone

          ELSE NULL
        END AS receiver_phone

      FROM reservations res

      JOIN food_listings fl
      ON res.listing_id = fl.listing_id

      JOIN restaurants r
      ON fl.restaurant_id = r.restaurant_id

      JOIN users u
      ON res.user_id = u.user_id

      LEFT JOIN individuals i
      ON u.user_id = i.user_id

      LEFT JOIN food_banks fb
      ON u.user_id = fb.user_id

      WHERE res.reservation_id = $1;
    `;

    const result = await client.query(
      query,
      [reservation_id]
    );

    return result.rows[0];
  },

  // FIND BY USER
  async findByUserId(
    user_id,
    client = db
  ) {
    const query = `
      SELECT 
        res.*,

        fl.food_name,
        fl.category,
        fl.pickup_time,
        fl.location,

        r.restaurant_name

      FROM reservations res

      JOIN food_listings fl
      ON res.listing_id = fl.listing_id

      JOIN restaurants r
      ON fl.restaurant_id = r.restaurant_id

      WHERE res.user_id = $1

      ORDER BY res.created_at DESC;
    `;

    const result = await client.query(
      query,
      [user_id]
    );

    return result.rows;
  },

  // FIND BY RESTAURANT
  async findByRestaurantId(
    restaurant_id,
    client = db
  ) {
    const query = `
      SELECT 
        res.*,

        fl.food_name,
        fl.category,
        fl.pickup_time,
        fl.location,

        u.email AS receiver_email,
        u.role AS receiver_role,

        CASE
          WHEN u.role = 'individual'
          THEN CONCAT(i.first_name, ' ', i.last_name)

          WHEN u.role = 'foodbank'
          THEN fb.organization_name

          ELSE u.email
        END AS receiver_name,

        CASE
          WHEN u.role = 'individual'
          THEN i.phone

          WHEN u.role = 'foodbank'
          THEN fb.phone

          ELSE NULL
        END AS receiver_phone

      FROM reservations res

      JOIN food_listings fl
      ON res.listing_id = fl.listing_id

      JOIN users u
      ON res.user_id = u.user_id

      LEFT JOIN individuals i
      ON u.user_id = i.user_id

      LEFT JOIN food_banks fb
      ON u.user_id = fb.user_id

      WHERE fl.restaurant_id = $1

      ORDER BY res.created_at DESC;
    `;

    const result = await client.query(
      query,
      [restaurant_id]
    );

    return result.rows;
  },

  // UPDATE STATUS
  async updateStatus(
    reservation_id,
    status,
    client = db
  ) {
    const query = `
      UPDATE reservations
      SET 
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE reservation_id = $2
      RETURNING *;
    `;

    const result = await client.query(
      query,
      [status, reservation_id]
    );

    return result.rows[0];
  },

  // ACCEPT
  async accept(
    reservation_id,
    client = db
  ) {
    return await this.updateStatus(
      reservation_id,
      "accepted",
      client
    );
  },

  // DECLINE
  async decline(
    reservation_id,
    client = db
  ) {
    return await this.updateStatus(
      reservation_id,
      "declined",
      client
    );
  },

  // CANCEL
  async cancel(
    reservation_id,
    client = db
  ) {
    return await this.updateStatus(
      reservation_id,
      "cancelled",
      client
    );
  },

  // COMPLETE
  async complete(
    reservation_id,
    client = db
  ) {
    return await this.updateStatus(
      reservation_id,
      "completed",
      client
    );
  },
};

export default Reservation;