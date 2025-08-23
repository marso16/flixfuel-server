const nodemailer = require("nodemailer");
require("dotenv").config({ quiet: true });

// Create transporter (Gmail SMTP)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP Email
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @param {string} name - Recipient name
 */
const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "🔐 Verify Your Email Address",
      html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 14px; box-shadow: 0 12px 24px rgba(0,0,0,0.08); overflow: hidden;">
          <div style="background-color: #1E90FF; padding: 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 700;">Email Verification</h1>
          </div>
          <div style="padding: 40px 35px; color: #333; line-height: 1.6;">
            <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #555;">Thank you for registering with us! Please use the OTP below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background: #e6f0ff; color: #1E90FF; padding: 20px 40px; font-size: 32px; font-weight: 700; letter-spacing: 6px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                ${otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #777;">This OTP is valid for 10 minutes.</p>
            <p style="font-size: 14px; color: #aaa;">If you did not request this, please ignore this email.</p>
          </div>
          <div style="background-color: #f1f3f6; padding: 18px 30px; text-align: center; font-size: 12px; color: #999;">
            Automated message — please do not reply.
          </div>
        </div>
      </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Send Password Reset Email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} name - Recipient name
 */
const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "🔐 Password Reset Request",
      html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 14px; box-shadow: 0 12px 24px rgba(0,0,0,0.08); overflow: hidden;">
          <div style="background-color: #DC3545; padding: 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 700;">Password Reset</h1>
          </div>
          <div style="padding: 40px 35px; color: #333; line-height: 1.6;">
            <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #555;">You requested a password reset for your account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #DC3545; color: #fff; padding: 15px 30px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(220,53,69,0.3);">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #777;">This link is valid for 10 minutes.</p>
            <p style="font-size: 14px; color: #aaa;">If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all;">${resetUrl}</span></p>
          </div>
          <div style="background-color: #f1f3f6; padding: 18px 30px; text-align: center; font-size: 12px; color: #999;">
            Automated message — please do not reply.
          </div>
        </div>
      </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendOrderEmail = async (email, order) => {
  try {
    const transporter = createTransporter();

    const statusMessages = {
      pending: {
        title: "Order Received",
        message: "Your order has been placed and is awaiting processing.",
        color: "#FFA500",
      },
      processing: {
        title: "Order Processing",
        message: "We are preparing your order. Sit tight!",
        color: "#17a2b8",
      },
      shipped: {
        title: "Order Shipped",
        message: `Your order is on the way${
          order.trackingNumber ? ` (Tracking No: ${order.trackingNumber})` : ""
        }.`,
        color: "#007bff",
      },
      delivered: {
        title: "Order Delivered",
        message: "Your order has been successfully delivered. Enjoy!",
        color: "#28a745",
      },
      cancelled: {
        title: "Order Cancelled",
        message: "Your order has been cancelled. Contact support if needed.",
        color: "#DC3545",
      },
      refunded: {
        title: "Order Refunded",
        message:
          "Your order has been refunded. Check your account for details.",
        color: "#6C757D",
      },
    };

    const statusContent =
      statusMessages[order.status] || statusMessages.pending;

    const itemsList = order.items
      .map(
        (item) =>
          `<li style="margin:6px 0; font-size: 15px; color:#555;">${item.name} (x${item.quantity}) — $${item.price}</li>`
      )
      .join("");

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `🛒 Order #${order.id} - ${statusContent.title}`,
      html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafc; padding: 40px 20px;">
        <div style="max-width: 650px; margin: auto; background: #fff; border-radius: 14px; box-shadow: 0 12px 24px rgba(0,0,0,0.08); overflow: hidden;">
          <div style="background-color: ${statusContent.color}; padding: 28px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 26px; font-weight: 700;">${statusContent.title}</h1>
          </div>
          <div style="padding: 40px 35px; color: #333; line-height: 1.6;">
            <p style="font-size: 16px;">Hi <strong>${order.name}</strong>,</p>
            <p style="font-size: 15px; color:#555;">${statusContent.message}</p>
            <ul style="list-style: none; padding: 0; margin-top: 15px;">${itemsList}</ul>
            <p style="font-size: 16px; font-weight: 700; margin-top: 25px; color:#111;">Total: $${order.total}</p>
          </div>
          <div style="background-color: #f1f3f6; padding: 18px 30px; text-align: center; font-size: 12px; color: #999;">
            Automated message — please do not reply.
          </div>
        </div>
      </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendOrderEmail,
  sendPasswordResetEmail,
};
