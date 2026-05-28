import db from "../config/db.js";

import Pickup from "../models/pickup.model.js";
import Reservation from "../models/reservation.model.js";
import Restaurant from "../models/restaurant.model.js";
import Listing from "../models/listing.model.js";

import { generateCode } from "../utils/generateCode.js";

// GENERATE PICKUP CODE
export const generatePickupCodeService =
  async (user_id, reservation_id) => {
    const reservation =
      await Reservation.findById(
        reservation_id
      );

    if (!reservation) {
      throw new Error(
        "Reservation not found"
      );
    }

    if (
      Number(reservation.user_id) !==
      Number(user_id)
    ) {
      throw new Error(
        "You can only generate pickup code for your own reservation"
      );
    }

    if (
      reservation.status !== "accepted"
    ) {
      throw new Error(
        "Pickup code can only be generated for accepted reservations"
      );
    }

    const existingPickup =
      await Pickup.findByReservationId(
        reservation_id
      );

    if (existingPickup) {
      return {
        alreadyExists: true,

        pickup: {
          ...existingPickup,

          qr_payload: {
            reservation_id,
            pickup_code:
              existingPickup.code,
          },
        },
      };
    }

    const code = generateCode();

    const expires_at = new Date(
      Date.now() +
        24 * 60 * 60 * 1000
    );

    const pickup = await Pickup.create({
      reservation_id,
      code,
      expires_at,
    });

    return {
      alreadyExists: false,

      pickup: {
        ...pickup,

        qr_payload: {
          reservation_id,
          pickup_code: code,
        },
      },
    };
  };

// CONFIRM PICKUP
export const confirmPickupService =
  async (
    user_id,
    reservation_id,
    pickup_code
  ) => {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const restaurant =
        await Restaurant.findByUserId(
          user_id
        );

      if (!restaurant) {
        throw new Error(
          "Restaurant profile not found"
        );
      }

      const pickup =
        await Pickup.findByCodeAndReservation(
          reservation_id,
          pickup_code,
          client
        );

      if (!pickup) {
        throw new Error(
          "Invalid pickup data"
        );
      }

      if (pickup.status !== "active") {
        throw new Error(
          "Pickup code is not active"
        );
      }

      // EXPIRED PICKUP
      if (
        pickup.expires_at &&
        new Date(pickup.expires_at) <
          new Date()
      ) {
        await Pickup.expirePickup(
          pickup.pickup_id,
          client
        );

        await Reservation.cancel(
          pickup.reservation_id,
          client
        );

        await Listing.restoreQuantity(
          pickup.listing_id,
          pickup.requested_quantity,
          client
        );

        await client.query("COMMIT");

        throw new Error(
          "Pickup code has expired"
        );
      }

      if (
        pickup.reservation_status !==
        "accepted"
      ) {
        throw new Error(
          "Only accepted reservations can be confirmed"
        );
      }

      if (
        Number(pickup.restaurant_id) !==
        Number(
          restaurant.restaurant_id
        )
      ) {
        throw new Error(
          "You can only confirm pickup for your own restaurant listings"
        );
      }

      const usedPickup =
        await Pickup.markAsUsed(
          pickup.pickup_id,
          client
        );

      const completedReservation =
        await Reservation.complete(
          pickup.reservation_id,
          client
        );

      await client.query("COMMIT");

      return {
        pickup: usedPickup,
        reservation:
          completedReservation,
      };
    } catch (error) {
      await client.query("ROLLBACK");

      throw error;
    } finally {
      client.release();
    }
  };