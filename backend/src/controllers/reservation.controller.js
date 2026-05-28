import {
  createReservationService,
  getMyReservationsService,
  getRestaurantReservationsService,
  acceptReservationService,
  declineReservationService,
  cancelReservationService,
} from "../services/reservation.service.js";

// CREATE RESERVATION
export const createReservation = async (
  req,
  res
) => {
  try {
    const reservation =
      await createReservationService(
        req.user.user_id,
        req.body
      );

    res.status(201).json({
      message:
        "Reservation request created successfully",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// GET MY RESERVATIONS
export const getMyReservations = async (
  req,
  res
) => {
  try {
    const reservations =
      await getMyReservationsService(
        req.user.user_id
      );

    res.status(200).json({
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET RESTAURANT RESERVATIONS
export const getRestaurantReservations =
  async (req, res) => {
    try {
      const reservations =
        await getRestaurantReservationsService(
          req.user.user_id
        );

      res.status(200).json({
        count: reservations.length,
        reservations,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  };

// ACCEPT RESERVATION
export const acceptReservation = async (
  req,
  res
) => {
  try {
    const reservation =
      await acceptReservationService(
        req.user.user_id,
        req.params.id
      );

    res.status(200).json({
      message:
        "Reservation accepted successfully",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// DECLINE RESERVATION
export const declineReservation = async (
  req,
  res
) => {
  try {
    const reservation =
      await declineReservationService(
        req.user.user_id,
        req.params.id
      );

    res.status(200).json({
      message:
        "Reservation declined successfully",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// CANCEL RESERVATION
export const cancelReservation = async (
  req,
  res
) => {
  try {
    const reservation =
      await cancelReservationService(
        req.user.user_id,
        req.params.id
      );

    res.status(200).json({
      message:
        "Reservation cancelled successfully",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};