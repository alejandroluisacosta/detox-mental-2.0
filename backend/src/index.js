import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import onboardingRoutes from "./onboarding/onboarding.routes.js";
import authRoutes from "./auth/auth.routes.js";
import stripeRoutes from "./stripe/stripe.routes.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
// Raw body required for Stripe webhook signature verification — must precede express.json()
app.use("/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ status: "ok", message: "Detox Mental backend is alive." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

app.use("/chat", onboardingRoutes);
app.use("/auth", authRoutes);
app.use("/stripe", stripeRoutes);
