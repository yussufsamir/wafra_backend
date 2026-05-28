import db from "../config/db.js";

function parseTags(row) {
  if (!row) return row;
  const raw = row.dietary_tags;
  if (typeof raw === "string") {
    try { row.dietary_tags = JSON.parse(raw); }
    catch (_) { row.dietary_tags = []; }
  }
  return row;
}

const Listing = {
  async create({
    restaurant_id,
    food_name,
    category,
    quantity,
    pickup_time,
    location,
    photo_url,
    dietary_tags,
  }) {
    const query = `
      INSERT INTO food_listings (
        restaurant_id,
        food_name,
        category,
        quantity,
        pickup_time,
        location,
        photo_url,
        dietary_tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      restaurant_id,
      food_name,
      category,
      quantity,
      pickup_time,
      location,
      photo_url,
      Array.isArray(dietary_tags) ? JSON.stringify(dietary_tags) : dietary_tags,
    ];

    const result = await db.query(query, values);
    return parseTags(result.rows[0]);
  },

  async getAllAvailable() {
    const query = `
      SELECT 
        fl.*,
        r.restaurant_name,
        r.cuisine_type
      FROM food_listings fl
      JOIN restaurants r ON fl.restaurant_id = r.restaurant_id
      WHERE fl.status = 'available'
      ORDER BY fl.created_at DESC;
    `;

    const result = await db.query(query);
    return result.rows.map(parseTags);
  },

  async findById(listing_id , client = db) {
    const query = `
      SELECT 
        fl.*,
        r.restaurant_name,
        r.cuisine_type
      FROM food_listings fl
      JOIN restaurants r ON fl.restaurant_id = r.restaurant_id
      WHERE fl.listing_id = $1;
    `;

    const result = await client.query(query, [listing_id]);
    return parseTags(result.rows[0]);
  },

  async findByRestaurantId(restaurant_id) {
    const query = `
      SELECT *
      FROM food_listings
      WHERE restaurant_id = $1
      ORDER BY created_at DESC;
    `;

    const result = await db.query(query, [restaurant_id]);
    return result.rows.map(parseTags);
  },

  async updateById(
    listing_id,
    {
      food_name,
      category,
      quantity,
      pickup_time,
      location,
      photo_url,
      dietary_tags,
      status,
    }
  ) {
    const query = `
      UPDATE food_listings
      SET
        food_name = COALESCE($1, food_name),
        category = COALESCE($2, category),
        quantity = COALESCE($3, quantity),
        pickup_time = COALESCE($4, pickup_time),
        location = COALESCE($5, location),
        photo_url = COALESCE($6, photo_url),
        dietary_tags = COALESCE($7, dietary_tags),
        status = COALESCE($8, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE listing_id = $9
      RETURNING *;
    `;

    const values = [
      food_name,
      category,
      quantity,
      pickup_time,
      location,
      photo_url,
      Array.isArray(dietary_tags) ? JSON.stringify(dietary_tags) : dietary_tags,
      status,
      listing_id,
    ];

    const result = await db.query(query, values);
    return parseTags(result.rows[0]);
  },

  async reduceQuantity(listing_id, amount , client = db) {
    const query = `
      UPDATE food_listings
      SET
        quantity   = quantity - $1,
        status     = CASE WHEN quantity - $1 <= 0 THEN 'reserved' ELSE status END,
        updated_at = CURRENT_TIMESTAMP
      WHERE listing_id = $2 AND quantity >= $1
      RETURNING *;
    `;

    const result = await client.query(query, [amount, listing_id]);
    if (result.rowCount === 0) {
      throw new Error("Not enough quantity available");
    }
    return parseTags(result.rows[0]);
  },

  async restoreQuantity(listing_id, amount, client = db) {
    const query = `
      UPDATE food_listings
      SET
        quantity   = quantity + $1,
        status     = CASE WHEN status = 'reserved' THEN 'available' ELSE status END,
        updated_at = CURRENT_TIMESTAMP
      WHERE listing_id = $2
      RETURNING *;
    `;

    const result = await client.query(query, [amount, listing_id]);
    return parseTags(result.rows[0]);
  },

  async deleteById(listing_id) {
    const query = `
      DELETE FROM food_listings
      WHERE listing_id = $1
      RETURNING *;
    `;

    const result = await db.query(query, [listing_id]);
    return result.rows[0];
  },

  async search({ search, category, status }) {
    let query = `
      SELECT 
        fl.*,
        r.restaurant_name,
        r.cuisine_type
      FROM food_listings fl
      JOIN restaurants r ON fl.restaurant_id = r.restaurant_id
      WHERE 1 = 1
    `;

    const values = [];
    let index = 1;

    if (search) {
      query += ` AND LOWER(fl.food_name) LIKE LOWER($${index})`;
      values.push(`%${search}%`);
      index++;
    }

    if (category) {
      query += ` AND LOWER(fl.category) = LOWER($${index})`;
      values.push(category);
      index++;
    }

    if (status) {
      query += ` AND fl.status = $${index}`;
      values.push(status);
      index++;
    } else {
      query += ` AND fl.status = 'available'`;
    }

    query += ` ORDER BY fl.created_at DESC;`;

    const result = await db.query(query, values);
    return result.rows.map(parseTags);
  },
};

export default Listing;