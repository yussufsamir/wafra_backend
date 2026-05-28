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
  res.clearCookie("token" , cookieOptions);

  res.status(200).json({
    message: "Logged out successfully",
  });
};
