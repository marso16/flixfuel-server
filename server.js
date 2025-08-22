require("dotenv").config({ quiet: true });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const chalk = require("chalk");
// const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");
const wishlistRoutes = require("./routes/wishlist");

const app = express();

// ====== Load Environment Variables ======
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

// ====== Middleware ======
app.use(helmet());

app.use(
  cors(/*{
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }*/)
);

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 300,
// });
// app.use(limiter);

app.use(express.json());

// ====== API ROUTES ======
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World from backend" });
});

// ====== DB Connection & Server Start ======
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(chalk.green("🚀 DB CONNECTED"));
    app.listen(PORT, () => {
      console.log(chalk.green(`🚀 SERVER RUNNING...`));
    });
  })
  .catch((err) => {
    console.error(chalk.red("❌ MongoDB connection failed:"), err.message);
    process.exit(1);
  });
