import express from "express";

import {
  generatePickupCode,
  confirmPickup,
} from "../controllers/pickup.controller.js";

import {
  authMiddleware,
  allowRoles,
  requireApprovedUser,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// GENERATE PICKUP CODE
router.post(
  "/generate",
  authMiddleware,
  allowRoles(
    "individual",
    "foodbank"
  ),
  requireApprovedUser,
  generatePickupCode
);

// CONFIRM PICKUP
router.post(
  "/confirm",
  authMiddleware,
  allowRoles("restaurant"),
  requireApprovedUser,
  confirmPickup
);

export default router;