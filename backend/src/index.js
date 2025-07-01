import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import userRoutes from "./routes/users.js";
import uploadRoutes from "./routes/upload.js";
import analyticsRoutes from "./routes/analytics.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();
const app = express();

app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("Welcome to EduSphere!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
