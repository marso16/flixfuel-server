require("dotenv").config({ quiet: true });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const chalk = require("chalk");
const path = require("path");
const favicon = require("serve-favicon");

const authRoutes = require("../routes/auth");
const productRoutes = require("../routes/products");
const cartRoutes = require("../routes/cart");
const orderRoutes = require("../routes/orders");
const paymentRoutes = require("../routes/payment");
const wishlistRoutes = require("../routes/wishlist");

const app = express();

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.static(path.join(__dirname, "public")));

// ====== Load Environment Variables ======
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV;

// ====== Middleware ======
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
app.use(
  cors(/*{
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }*/)
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

    if (NODE_ENV === "development") {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () =>
        console.log(chalk.blue(`🌍 Server running on http://localhost:${PORT}`))
      );
    }
  })
  .catch((err) => {
    console.error(chalk.red("❌ MongoDB connection failed:"), err.message);
  });

module.exports = app;
