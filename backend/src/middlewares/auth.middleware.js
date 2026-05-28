import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authMiddleware = (req, res, next) => {
  try {
    let token;

    
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    next();
  };
};

export const requireApprovedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (user.verification_status !== "approved") {
      return res.status(403).json({
        error: "Your account is pending verification",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export default authMiddleware;