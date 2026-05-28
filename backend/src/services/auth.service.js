import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import FoodBank from "../models/foodBank.model.js";
import Individual from "../models/individual.model.js";

import { generateToken } from "../utils/jwt.js";

import {
  validateRegister,
  validateRole,
} from "../validators/auth.validator.js";

const authService = {
  // REGISTER
  async register(data) {
    const { username, email, password } = data;

    // Validation
    validateRegister({
      username,
      email,
      password,
    });

    // Check existing email
    const existingEmail = await User.findByEmail(email);

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Check existing username
    const existingUsername =
      await User.findByUsername(username);

    if (existingUsername) {
      throw new Error("Username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const user = await User.createBasic({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = generateToken(user);

    return {
      token,
      user,
    };
  },

  // CHOOSE ROLE
  async chooseRole(user_id, { role }) {
    // Validate role
    validateRole(role);

    // Find user
    const user = await User.findById(user_id);

    if (!user) {
      throw new Error("User not found");
    }

    // Prevent role changing
    if (user.role) {
      throw new Error("Role already selected");
    }

    // Update role
    const updatedUser = await User.chooseRole(
      user_id,
      role
    );

    // Generate new JWT
    const token = generateToken(updatedUser);

    return {
      token,
      user: updatedUser,
    };
  },

  // COMPLETE PROFILE
  async completeProfile(user_id, data) {
    const user = await User.findById(user_id);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.role) {
      throw new Error(
        "Please choose a role first"
      );
    }

    if (
      user.verification_status !== "incomplete"
    ) {
      throw new Error(
        "Profile already completed"
      );
    }
    // INDIVIDUAL PROFILE
    if (user.role === "individual") {
      const {
        first_name,
        last_name,
        phone,
        birthdate,
      } = data;

      if (
        !first_name ||
        !last_name ||
        !phone ||
        !birthdate
      ) {
        throw new Error(
          "All individual fields are required"
        );
      }

      await Individual.create({
        user_id,
        first_name,
        last_name,
        phone,
        birthdate,
      });
    }
    // RESTAURANT PROFILE
    else if (user.role === "restaurant") {
      const {
        restaurant_name,
        cuisine_type,
        full_address,
        phone,
        business_license_number,
      } = data;

      if (
        !restaurant_name ||
        !cuisine_type ||
        !full_address ||
        !phone ||
        !business_license_number
      ) {
        throw new Error(
          "All restaurant fields are required"
        );
      }

      await Restaurant.create({
        user_id,
        restaurant_name,
        cuisine_type,
        full_address,
        phone,
        business_license_number,
      });
    }
    // FOOD BANK PROFILE
    else if (user.role === "foodbank") {
      const {
        organization_name,
        registration_number,
        phone,
        location,
      } = data;

      if (
        !organization_name ||
        !registration_number ||
        !phone ||
        !location
      ) {
        throw new Error(
          "All food bank fields are required"
        );
      }

      await FoodBank.create({
        user_id,
        organization_name,
        registration_number,
        phone,
        location,
      });
    }
    else {
      throw new Error("Invalid role");
    }
    // UPDATE VERIFICATION STATUS
    const verification_status =
      user.role === "individual"
        ? "approved"
        : "pending";

    const updatedUser =
      await User.updateVerificationStatus(
        user_id,
        verification_status
      );

    // Generate new JWT
    const token = generateToken(updatedUser);

    return {
      token,
      user: updatedUser,
    };
  },

  // LOGIN
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error(
        "Email and password are required"
      );
    }

    // Find user
    const user = await User.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = generateToken(user);

    return {
      token,

      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        verification_status:
          user.verification_status,
      },
    };
  },
};

export default authService;