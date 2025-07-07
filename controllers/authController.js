import crypto from 'crypto';
import sendEmail from '../utils/email.js';
import { createSendToken, verifyToken, changedPasswordAfter } from '../utils/auth.js';
import User from '../models/User.js';


export const signup = async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// User Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // 2) Find user and include password
    const user = await User.findOne({ email }).select('+password');

    // 3) Check if user exists and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // 4) Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // 5) Send token
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// Password Reset - Initiate
export const forgotPassword = async (req, res) => {
  try {
    // 1) Get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Don't reveal if user doesn't exist for security
      return res.status(200).json({
        status: 'success',
        message: 'Password reset instructions sent if account exists'
      });
    }

    // 2) Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send token via email
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    const message = `You requested a password reset. Click this link to reset your password:\n${resetURL}\n\nIf you didn't request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });

      res.status(200).json({
        status: 'success',
        message: 'Password reset instructions sent to your email'
      });
    } catch (emailErr) {
      // Reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!'
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// Password Reset - Complete
export const resetPassword = async (req, res) => {
  try {
    // 1) Hash token to match DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2) Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // 3) If token invalid/expired
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired'
      });
    }

    // 4) Update password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // This triggers password hashing and passwordChangedAt update
    await user.save(); 

    // 5) Log user in (send token)
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// Password Update for Logged-in Users
export const updatePassword = async (req, res) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is incorrect'
      });
    }

    // 3) Update password
    user.password = req.body.newPassword;
    await user.save();

    // 4) Log user in, send new JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// User Logout
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true
  });
  
  res.status(200).json({ status: 'success' });
};

export const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verification token
    const decoded = await verifyToken(token);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.'
      });
    }

    // 4) Check if user changed password after the token was issued
    if (changedPasswordAfter(currentUser, decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again.'
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again.'
    });
  }
};