import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import FoodBank from "../models/foodBank.model.js";
import Individual from "../models/individual.model.js";

export const getMeService = async (user_id) => {
  // Find user
  const user = await User.findById(user_id);

  if (!user) {
    throw new Error("User not found");
  }

  let profile = null;

  // Restaurant profile
  if (user.role === "restaurant") {
    profile = await Restaurant.findByUserId(
      user.user_id
    );
  }

  // Food bank profile
  else if (user.role === "foodbank") {
    profile = await FoodBank.findByUserId(
      user.user_id
    );
  }

  // Individual profile
  else if (user.role === "individual") {
    profile = await Individual.findByUserId(
      user.user_id
    );
  }

  return {
    user,
    profile,
  };
};