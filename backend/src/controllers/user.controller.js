import { getMeService } from "../services/user.service.js";

export const getMe = async (req, res) => {
  try {
    const result = await getMeService(
      req.user.user_id
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};