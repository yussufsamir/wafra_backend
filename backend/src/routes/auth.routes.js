import express from "express";

import {
  register,
  login,
  logout,
  chooseRole,
  completeProfile,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.patch("/choose-role", authMiddleware, chooseRole);
router.patch("/complete-profile", authMiddleware, completeProfile);

export default router;