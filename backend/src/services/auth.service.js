import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import FoodBank from "../models/foodBank.model.js";
import Individual from "../models/individual.model.js";
import VerificationCode from "../models/verification_code.model.js";

import { generateToken } from "../utils/jwt.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.util.js";

import {
  validateRegister,
  validateRole,
} from "../validators/auth.validator.js";

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const expiresIn15Min = () =>
  new Date(Date.now() + 15 * 60 * 1000);

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

    // Send verification code
    const code = generateCode();
    await VerificationCode.create({
      user_id: user.user_id,
      code,
      type: "email_verification",
      expires_at: expiresIn15Min(),
    });
    await sendVerificationEmail(email, code);

    return { email_verified: false, user_id: user.user_id, email };
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

    // Block unverified users and send a fresh code
    if (!user.is_email_verified) {
      const code = generateCode();
      await VerificationCode.invalidateAll(user.user_id, "email_verification");
      await VerificationCode.create({
        user_id: user.user_id,
        code,
        type: "email_verification",
        expires_at: expiresIn15Min(),
      });
      await sendVerificationEmail(user.email, code);
      return { email_verified: false, user_id: user.user_id, email: user.email };
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
        verification_status: user.verification_status,
      },
    };
  },

  // SEND VERIFICATION CODE (resend)
  async sendVerificationCode(user_id) {
    const user = await User.findById(user_id);
    if (!user) throw new Error("User not found");

    const code = generateCode();
    await VerificationCode.invalidateAll(user_id, "email_verification");
    await VerificationCode.create({
      user_id,
      code,
      type: "email_verification",
      expires_at: expiresIn15Min(),
    });
    await sendVerificationEmail(user.email, code);
  },

  // VERIFY EMAIL
  async verifyEmail(user_id, code) {
    const record = await VerificationCode.findValid({
      user_id,
      code,
      type: "email_verification",
    });
    if (!record) throw new Error("Invalid or expired code");

    await VerificationCode.markUsed(record.id);
    const user = await User.setEmailVerified(user_id);
    const token = generateToken(user);
    return {
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        verification_status: user.verification_status,
      },
    };
  },

  // FORGOT PASSWORD
  async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (!user) throw new Error("No account found with that email");

    const code = generateCode();
    await VerificationCode.invalidateAll(user.user_id, "password_reset");
    await VerificationCode.create({
      user_id: user.user_id,
      code,
      type: "password_reset",
      expires_at: expiresIn15Min(),
    });
    await sendPasswordResetEmail(email, code);
    return { user_id: user.user_id };
  },

  // RESET PASSWORD
  async resetPassword(user_id, code, new_password) {
    if (!new_password || new_password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    const record = await VerificationCode.findValid({
      user_id,
      code,
      type: "password_reset",
    });
    if (!record) throw new Error("Invalid or expired code");

    await VerificationCode.markUsed(record.id);
    const hashed = await bcrypt.hash(new_password, 10);
    await User.updatePassword(user_id, hashed);
  },
};

export default authService;