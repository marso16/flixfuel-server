const nodemailer = require("nodemailer");

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
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f6fa; padding: 40px 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background-color: #1E90FF; padding: 25px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">Email Verification</h1>
          </div>
          <div style="padding: 35px; line-height: 1.6; color: #333;">
            <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 15px;">Thank you for signing up. Use the OTP below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background: #eef5ff; color: #1E90FF; padding: 18px 36px; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 12px;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #555;">This OTP is valid for 10 minutes.</p>
            <p style="font-size: 14px; color: #888;">If you didn't request this, please ignore this email.</p>
          </div>
          <div style="background-color: #f1f3f6; padding: 18px 30px; text-align: center; font-size: 12px; color: #999;">
            This is an automated message, please do not reply.
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
 * Send Order Confirmation Email
 * @param {string} email - Customer email
 * @param {object} order - { id, name, total, items, status, trackingNumber }
 */
const sendOrderEmail = async (email, order) => {
  try {
    const transporter = createTransporter();

    // Status-based content mapping
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
          `<li style="margin:5px 0; font-size: 15px;">${item.name} (x${item.quantity}) - $${item.price}</li>`
      )
      .join("");

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `🛒 Order #${order.id} - ${statusContent.title}`,
      html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f6fa; padding: 40px 20px;">
        <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background-color: ${statusContent.color}; padding: 25px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 26px;">${statusContent.title}</h1>
          </div>
          <div style="padding: 35px; line-height: 1.6; color: #333;">
            <p style="font-size: 16px;">Hi <strong>${order.name}</strong>,</p>
            <p style="font-size: 15px;">${statusContent.message}</p>
            <ul style="list-style: none; padding: 0; margin-top: 15px;">${itemsList}</ul>
            <p style="font-size: 16px; font-weight: bold; margin-top: 20px;">Total: $${order.total}</p>
          </div>
          <div style="background-color: #f1f3f6; padding: 18px 30px; text-align: center; font-size: 12px; color: #999;">
            This is an automated message, please do not reply.
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
};
