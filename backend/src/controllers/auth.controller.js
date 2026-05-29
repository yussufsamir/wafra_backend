import authService from "../services/auth.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    // Email not verified yet — no JWT issued
    if (result.email_verified === false) {
      return res.status(201).json({
        email_verified: false,
        user_id: result.user_id,
        email: result.email,
      });
    }

    res.cookie("token", result.token, cookieOptions);
    res.status(201).json({
      message: "User registered successfully. Please choose your role.",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const chooseRole = async (req, res) => {
  try {
    const result = await authService.chooseRole(
      req.user.user_id,
      req.body
    );

    res.cookie("token", result.token, cookieOptions);

    res.status(200).json({
      message: "Role selected successfully. Please complete your profile.",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const result = await authService.completeProfile(
      req.user.user_id,
      req.body
    );

    res.cookie("token", result.token, cookieOptions);

    res.status(200).json({
      message: "Profile completed successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    // Email not verified yet — no JWT issued
    if (result.email_verified === false) {
      return res.status(200).json({
        email_verified: false,
        user_id: result.user_id,
        email: result.email,
      });
    }

    res.cookie("token", result.token, cookieOptions);
    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
};

export const sendVerificationCode = async (req, res) => {
  try {
    await authService.sendVerificationCode(req.body.user_id);
    res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { user_id, code } = req.body;
    const result = await authService.verifyEmail(user_id, code);
    res.cookie("token", result.token, cookieOptions);
    res.status(200).json({ message: "Email verified", token: result.token, user: result.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.status(200).json({ message: "Reset code sent", user_id: result.user_id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { user_id, code, new_password } = req.body;
    await authService.resetPassword(user_id, code, new_password);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
