import {
  createListingService,
  getAllListingsService,
  getListingByIdService,
  getMyListingsService,
  updateListingService,
  deleteListingService,
} from "../services/listing.service.js";

// CREATE LISTING
export const createListing = async (
  req,
  res
) => {
  try {
    const listing =
      await createListingService(
        req.user.user_id,
        req.body
      );

    res.status(201).json({
      message:
        "Food listing created successfully",
      listing,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// GET ALL LISTINGS
export const getAllListings = async (
  req,
  res
) => {
  try {
    const listings =
      await getAllListingsService(req.query);

    res.status(200).json({
      count: listings.length,
      listings,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET LISTING BY ID
export const getListingById = async (
  req,
  res
) => {
  try {
    const listing =
      await getListingByIdService(
        req.params.id
      );

    res.status(200).json({
      listing,
    });
  } catch (error) {
    res.status(404).json({
      error: error.message,
    });
  }
};

// GET MY LISTINGS
export const getMyListings = async (
  req,
  res
) => {
  try {
    const listings =
      await getMyListingsService(
        req.user.user_id
      );

    res.status(200).json({
      count: listings.length,
      listings,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// UPDATE LISTING
export const updateListing = async (
  req,
  res
) => {
  try {
    const listing =
      await updateListingService(
        req.user.user_id,
        req.params.id,
        req.body
      );

    res.status(200).json({
      message:
        "Listing updated successfully",
      listing,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// DELETE LISTING
export const deleteListing = async (
  req,
  res
) => {
  try {
    await deleteListingService(
      req.user.user_id,
      req.params.id
    );

    res.status(200).json({
      message:
        "Listing deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};