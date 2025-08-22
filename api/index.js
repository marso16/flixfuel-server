require("dotenv").config({ quiet: true });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const chalk = require("chalk");
// const rateLimit = require("express-rate-limit");

const authRoutes = require("../routes/auth");
const productRoutes = require("../routes/products");
const cartRoutes = require("../routes/cart");
const orderRoutes = require("../routes/orders");
const paymentRoutes = require("../routes/payment");
const wishlistRoutes = require("../routes/wishlist");

const app = express();

// ====== Load Environment Variables ======
const MONGODB_URI = process.env.MONGODB_URI;

// ====== Middleware ======
app.use(helmet());

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ====== API ROUTES ======
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/wishlist", wishlistRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World from backend" });
});

// ====== DB Connection & Server Start ======
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(chalk.green("🚀 DB CONNECTED"));
  })
  .catch((err) => {
    console.error(chalk.red("❌ MongoDB connection failed:"), err.message);
  });

module.exports = app;
