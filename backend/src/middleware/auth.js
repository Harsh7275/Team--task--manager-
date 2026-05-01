import jwt from 'jsonwebtoken';
import ErrorHandler from '../utils/errorHandler.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new ErrorHandler('Please login to access this resource', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler('User not found', 404));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler('Invalid token', 401));
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    next();
  };
};
