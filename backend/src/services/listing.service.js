import Listing from "../models/listing.model.js";
import Restaurant from "../models/restaurant.model.js";

// CREATE LISTING
export const createListingService = async (
  user_id,
  data
) => {
  const restaurant =
    await Restaurant.findByUserId(user_id);

  if (!restaurant) {
    throw new Error(
      "Restaurant profile not found"
    );
  }

  const {
    food_name,
    category,
    quantity,
    pickup_time,
    location,
  } = data;

  if (
    !food_name ||
    !category ||
    !quantity ||
    !pickup_time ||
    !location
  ) {
    throw new Error(
      "Required listing fields are missing"
    );
  }
  if (quantity <= 0) {
    throw new Error(
      "Quantity must be greater than zero"
    );
  }
  if (new Date(pickup_time) <= new Date()) {
    throw new Error(
      "Pickup time must be in the future"
    );  
  }

  return await Listing.create({
    restaurant_id: restaurant.restaurant_id,
    food_name: data.food_name,
    category: data.category,
    quantity: data.quantity,
    pickup_time: data.pickup_time,
    location: data.location,
    photo_url: data.photo_url,
    dietary_tags: data.dietary_tags,
  });
};

// GET ALL LISTINGS
export const getAllListingsService = async (
  query
) => {
  return await Listing.search({
    search: query.search,
    category: query.category,
    status: query.status,
  });
};

// GET LISTING BY ID
export const getListingByIdService = async (
  listing_id
) => {
  const listing = await Listing.findById(
    listing_id
  );

  if (!listing) {
    throw new Error("Listing not found");
  }

  return listing;
};

// GET MY LISTINGS
export const getMyListingsService = async (
  user_id
) => {
  const restaurant =
    await Restaurant.findByUserId(user_id);

  if (!restaurant) {
    throw new Error(
      "Restaurant profile not found"
    );
  }

  return await Listing.findByRestaurantId(
    restaurant.restaurant_id
  );
};

// UPDATE LISTING
export const updateListingService = async (
  user_id,
  listing_id,
  data
) => {
  const restaurant =
    await Restaurant.findByUserId(user_id);

  if (!restaurant) {
    throw new Error(
      "Restaurant profile not found"
    );
  }

  const listing = await Listing.findById(
    listing_id
  );

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (
    Number(listing.restaurant_id) !==
    Number(restaurant.restaurant_id)
  ) {
    throw new Error(
      "You can only update your own listings"
    );
  }

  if (listing.status === "reserved") {
    throw new Error(
      "Reserved listings cannot be modified"
    );  
  }

  return await Listing.updateById(
    listing_id,
    data
  );
};

// DELETE LISTING
export const deleteListingService = async (
  user_id,
  listing_id
) => {
  const restaurant =
    await Restaurant.findByUserId(user_id);

  if (!restaurant) {
    throw new Error(
      "Restaurant profile not found"
    );
  }

  const listing = await Listing.findById(
    listing_id
  );

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (
    Number(listing.restaurant_id) !==
    Number(restaurant.restaurant_id)
  ) {
    throw new Error(
      "You can only delete your own listings"
    );
  }
  
  if (listing.status === "reserved") {
    throw new Error(
      "Reserved listings cannot be deleted"
    );  
  }

  return await Listing.deleteById(
    listing_id
  );
};