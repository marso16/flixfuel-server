require("dotenv").config({ quiet: true });
const serverless = require("serverless-http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const chalk = require("chalk");

const authRoutes = require("../routes/auth");
const productRoutes = require("../routes/products");
const cartRoutes = require("../routes/cart");
const orderRoutes = require("../routes/orders");
const paymentRoutes = require("../routes/payment");
const wishlistRoutes = require("../routes/wishlist");

const app = express();

// ===== Middleware =====
app.use(helmet());
app.use(cors());
app.use(express.json());

// ===== API ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World from backend" });
});

// ===== MongoDB Connection =====
let isConnected;

const connectToMongo = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log(chalk.green("🚀 MongoDB CONNECTED"));
  } catch (err) {
    console.error(chalk.red("❌ MongoDB connection failed:"), err.message);
  }
};

connectToMongo();

// ===== Export serverless function =====
module.exports = serverless(async (req, res) => {
  if (!isConnected) await connectToMongo();
  return app(req, res);
});
