const express = require("express");
const { body } = require("express-validator");
const { protect, admin } = require("../middleware/auth");
const authController = require("../controllers/auth");
const googleAuthController = require("../controllers/googleAuth");

const router = express.Router();

// OTP routes
router.post(
  "/send-otp",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.sendOTP
);

router.post(
  "/verify-otp",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  authController.verifyOTP
);

router.post(
  "/resend-otp",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
  ],
  authController.resendOTP
);

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

router.get("/profile", protect, authController.getProfile);

router.put(
  "/profile",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("phone").optional().trim(),
  ],
  authController.updateUserProfile
);

router.put(
  "/change-password",
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  authController.changePassword
);

router.get("/verify", protect, authController.verifyToken);

router.get("/users", protect, admin, authController.getAllUsers);

router.delete("/users/:_id", protect, admin, authController.deleteOneUser);
router.delete("/users/", protect, admin, authController.deleteAllUsers);
router.put("/users/:userId/role", authController.updateUserRole);

router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
  ],
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  authController.resetPassword
);

// Google OAuth routes
router.post(
  "/google",
  [
    body("token").notEmpty().withMessage("Google token is required"),
  ],
  googleAuthController.googleLogin
);

router.post(
  "/link-google",
  protect,
  [
    body("token").notEmpty().withMessage("Google token is required"),
  ],
  googleAuthController.linkGoogleAccount
);

router.delete("/unlink-google", protect, googleAuthController.unlinkGoogleAccount);

module.exports = router;
