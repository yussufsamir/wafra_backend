import db from "../config/db.js";

import Reservation from "../models/reservation.model.js";
import Listing from "../models/listing.model.js";
import Restaurant from "../models/restaurant.model.js";
import Notification from "../models/notifications.model.js";

// CREATE RESERVATION
export const createReservationService =
  async (user_id, data) => {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const {
        listing_id,
        requested_quantity,
      } = data;

      if (
        !listing_id ||
        !requested_quantity
      ) {
        throw new Error(
          "Listing ID and quantity are required"
        );
      }

      const listing =
        await Listing.findById(
          listing_id,
          client
        );

      if (!listing) {
        throw new Error("Listing not found");
      }

      if (
        listing.status !== "available"
      ) {
        throw new Error(
          "This listing is not available"
        );
      }

      if (
        Number(requested_quantity) >
        Number(listing.quantity)
      ) {
        throw new Error(
          "Requested quantity exceeds available quantity"
        );
      }
      if (requested_quantity <= 0) {
        throw new Error(
          "Requested quantity must be greater than zero"
        );
      }

      const reservation =
        await Reservation.create(
          {
            listing_id,
            user_id,
            requested_quantity,
          },
          client
        );

      await Listing.reduceQuantity(
        listing_id,
        requested_quantity,
        client
      );

      await client.query("COMMIT");

      // Best-effort: notify the restaurant owner
      try {
        const restaurant = await Restaurant.findById(listing.restaurant_id);
        if (restaurant) {
          await Notification.create({
            user_id: restaurant.user_id,
            title: "New Reservation",
            message: `${requested_quantity}x ${listing.food_name} has been reserved`,
            type: "new_reservation",
          });
        }
      } catch (_) {}

      return reservation;
    } catch (error) {
      await client.query("ROLLBACK");

      throw error;
    } finally {
      client.release();
    }
  };

// GET MY RESERVATIONS
export const getMyReservationsService =
  async (user_id) => {
    return await Reservation.findByUserId(
      user_id
    );
  };

// GET RESTAURANT RESERVATIONS
export const getRestaurantReservationsService =
  async (user_id) => {
    const restaurant =
      await Restaurant.findByUserId(user_id);

    if (!restaurant) {
      throw new Error(
        "Restaurant profile not found"
      );
    }

    return await Reservation.findByRestaurantId(
      restaurant.restaurant_id
    );
  };

// ACCEPT RESERVATION
export const acceptReservationService =
  async (user_id, reservation_id) => {
    const restaurant =
      await Restaurant.findByUserId(user_id);

    if (!restaurant) {
      throw new Error(
        "Restaurant profile not found"
      );
    }

    const reservation =
      await Reservation.findById(
        reservation_id
      );

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (
      Number(reservation.restaurant_id) !==
      Number(restaurant.restaurant_id)
    ) {
      throw new Error(
        "You can only accept reservations for your own listings"
      );
    }

    if (reservation.status !== "pending") {
      throw new Error(
        "Only pending reservations can be accepted"
      );
    }

    const accepted = await Reservation.accept(reservation_id);

    // Best-effort: notify the individual / food bank
    try {
      await Notification.create({
        user_id: reservation.user_id,
        title: "Reservation Accepted!",
        message: "Your reservation has been accepted. Remember to pick it up in time!",
        type: "reservation_accepted",
      });
    } catch (_) {}

    return accepted;
  };

// DECLINE RESERVATION
export const declineReservationService =
  async (user_id, reservation_id) => {
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

      const reservation =
        await Reservation.findById(
          reservation_id,
          client
        );

      if (!reservation) {
        throw new Error(
          "Reservation not found"
        );
      }

      if (
        Number(
          reservation.restaurant_id
        ) !==
        Number(restaurant.restaurant_id)
      ) {
        throw new Error(
          "You can only decline reservations for your own listings"
        );
      }

      if (
        reservation.status !== "pending"
      ) {
        throw new Error(
          "Only pending reservations can be declined"
        );
      }

      const updatedReservation =
        await Reservation.decline(
          reservation_id,
          client
        );

      await Listing.restoreQuantity(
        reservation.listing_id,
        reservation.requested_quantity,
        client
      );

      await client.query("COMMIT");

      return updatedReservation;
    } catch (error) {
      await client.query("ROLLBACK");

      throw error;
    } finally {
      client.release();
    }
  };

// CANCEL RESERVATION
export const cancelReservationService =
  async (user_id, reservation_id) => {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const reservation =
        await Reservation.findById(
          reservation_id,
          client
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
          "You can only cancel your own reservations"
        );
      }

      if (
        reservation.status !== "pending"
      ) {
        throw new Error(
          "Only pending reservations can be cancelled"
        );
      }

      const updatedReservation =
        await Reservation.cancel(
          reservation_id,
          client
        );

      await Listing.restoreQuantity(
        reservation.listing_id,
        reservation.requested_quantity,
        client
      );

      await client.query("COMMIT");

      return updatedReservation;
    } catch (error) {
      await client.query("ROLLBACK");

      throw error;
    } finally {
      client.release();
    }
  };