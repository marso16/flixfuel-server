const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided by Google'
      });
    }

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update Google login info if not already set
      if (!user.socialLogins.google.id) {
        user.socialLogins.google = {
          id: googleId,
          email: email
        };
        
        // Update avatar if user doesn't have one
        if (!user.avatar.url && picture) {
          user.avatar.url = picture;
        }
        
        await user.save();
      }
    } else {
      // Create new user with Google login
      user = new User({
        name: name,
        email: email,
        password: Math.random().toString(36).slice(-8), // Random password for Google users
        isEmailVerified: true, // Google emails are verified
        isOtpVerified: true, // Skip OTP for Google users
        socialLogins: {
          google: {
            id: googleId,
            email: email
          }
        },
        avatar: {
          url: picture || ''
        }
      });

      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        socialLogins: user.socialLogins
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    
    if (error.message.includes('Token used too late')) {
      return res.status(400).json({
        success: false,
        message: 'Google token has expired'
      });
    }

    if (error.message.includes('Invalid token')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during Google authentication'
    });
  }
};

const linkGoogleAccount = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;

    // Check if this Google account is already linked to another user
    const existingUser = await User.findOne({ 'socialLogins.google.id': googleId });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This Google account is already linked to another user'
      });
    }

    // Update current user's Google login info
    const user = await User.findById(userId);
    user.socialLogins.google = {
      id: googleId,
      email: email
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Google account linked successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        socialLogins: user.socialLogins
      }
    });

  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while linking Google account'
    });
  }
};

const unlinkGoogleAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user.socialLogins.google.id) {
      return res.status(400).json({
        success: false,
        message: 'No Google account linked to this user'
      });
    }

    // Remove Google login info
    user.socialLogins.google = {
      id: undefined,
      email: undefined
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Google account unlinked successfully'
    });

  } catch (error) {
    console.error('Unlink Google account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while unlinking Google account'
    });
  }
};

module.exports = {
  googleLogin,
  linkGoogleAccount,
  unlinkGoogleAccount
};

