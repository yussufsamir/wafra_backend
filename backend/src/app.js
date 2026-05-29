import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import pickupRoutes from "./routes/pickup.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/listings", listingRoutes);
app.use("/reservations", reservationRoutes);
app.use("/users", userRoutes);
app.use("/pickups", pickupRoutes);
app.use("/notifications", notificationRoutes);

export default app;