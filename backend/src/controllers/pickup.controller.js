import {
  generatePickupCodeService,
  confirmPickupService,
} from "../services/pickup.service.js";

// GENERATE PICKUP CODE
export const generatePickupCode =
  async (req, res) => {
    try {
      const {
        reservation_id,
      } = req.body;

      const result =
        await generatePickupCodeService(
          req.user.user_id,
          reservation_id
        );

      if (result.alreadyExists) {
        return res.status(200).json({
          message:
            "Pickup code already generated",
          pickup: result.pickup,
        });
      }

      res.status(201).json({
        message:
          "Pickup code generated successfully",
        pickup: result.pickup,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  };

// CONFIRM PICKUP
export const confirmPickup =
  async (req, res) => {
    try {
      const { code } = req.body;

      const result =
        await confirmPickupService(
          req.user.user_id,
          code
        );

      res.status(200).json({
        message:
          "Pickup confirmed successfully",
        pickup: result.pickup,
        reservation:
          result.reservation,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  };