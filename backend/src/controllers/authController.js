import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import ErrorHandler from '../utils/errorHandler.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, country } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return next(new ErrorHandler('Please provide all required fields', 400));
    }

    if (password !== confirmPassword) {
      return next(new ErrorHandler('Passwords do not match', 400));
    }

    let user = await User.findOne({ email });
    if (user) {
      return next(new ErrorHandler('User already exists', 400));
    }

    user = await User.create({
      name,
      email,
      password,
      country: country || 'United States',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        country: user.country,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }

    const isPasswordMatched = await user.matchPassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        country: user.country,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        country: user.country,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return next(new ErrorHandler('Please provide your password to confirm deletion', 400));
    }

    // Verify password before deletion
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    const isPasswordMatched = await user.matchPassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler('Incorrect password', 401));
    }

    const userId = req.user._id;
    const ownedProjects = await Project.find({ owner: userId }).select('_id');
    const ownedProjectIds = ownedProjects.map((project) => project._id);

    // Remove projects owned by the user and every task inside them.
    const deletedOwnedProjectTasks = await Task.deleteMany({
      project: { $in: ownedProjectIds },
    });
    const deletedUserTasks = await Task.deleteMany({
      project: { $nin: ownedProjectIds },
      createdBy: userId,
    });
    const clearedAssignments = await Task.updateMany(
      { assignee: userId },
      { $unset: { assignee: 1 } }
    );
    const removedComments = await Task.updateMany(
      { 'comments.user': userId },
      { $pull: { comments: { user: userId } } }
    );
    const removedMemberships = await Project.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );
    const deletedProjects = await Project.deleteMany({ owner: userId });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Account deleted permanently',
      cleanup: {
        deletedProjects: deletedProjects.deletedCount,
        deletedTasks: deletedOwnedProjectTasks.deletedCount + deletedUserTasks.deletedCount,
        clearedAssignments: clearedAssignments.modifiedCount,
        removedComments: removedComments.modifiedCount,
        removedMemberships: removedMemberships.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
