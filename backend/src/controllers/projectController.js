import Project from '../models/Project.js';
import User from '../models/User.js';
import ErrorHandler from '../utils/errorHandler.js';

export const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    if (!name) {
      return next(new ErrorHandler('Please provide project name', 400));
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'Admin',
        },
      ],
      startDate,
      endDate,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    // Get projects where user is owner or member
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    }).populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return next(new ErrorHandler('Project not found', 404));
    }

    // Check if user is owner or member
    const isMember =
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user._id.toString() === req.user._id.toString());

    if (!isMember) {
      return next(new ErrorHandler('Not authorized to access this project', 403));
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorHandler('Project not found', 404));
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler('Not authorized to update this project', 403));
    }

    const { name, description, status, startDate, endDate } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;

    project = await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorHandler('Project not found', 404));
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler('Not authorized to delete this project', 403));
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const { id: projectId } = req.params;

    if (!email) {
      return next(new ErrorHandler('Please provide member email', 400));
    }

    // Find user by email
    const memberUser = await User.findOne({ email });
    if (!memberUser) {
      return next(new ErrorHandler('User with this email not found', 404));
    }

    let project = await Project.findById(projectId);

    if (!project) {
      return next(new ErrorHandler('Project not found', 404));
    }

    // Check if user is owner or admin member
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = project.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.role === 'Admin'
    );

    if (!isOwner && !isAdmin) {
      return next(new ErrorHandler('Only owner or admin can add members', 403));
    }

    // Check if member already exists
    const memberExists = project.members.some((m) => m.user.toString() === memberUser._id.toString());
    if (memberExists) {
      return next(new ErrorHandler('Member already in project', 400));
    }

    // Cannot add owner as member
    if (memberUser._id.toString() === project.owner.toString()) {
      return next(new ErrorHandler('Owner is already in the project', 400));
    }

    project.members.push({
      user: memberUser._id,
      role: role || 'Member',
    });

    project = await project.save();
    await project.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { id: projectId } = req.params;

    if (!userId) {
      return next(new ErrorHandler('Please provide user ID', 400));
    }

    let project = await Project.findById(projectId);

    if (!project) {
      return next(new ErrorHandler('Project not found', 404));
    }

    // Check if user is owner or admin member
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = project.members.some(
      (m) => m.user.toString() === req.user._id.toString() && m.role === 'Admin'
    );

    if (!isOwner && !isAdmin) {
      return next(new ErrorHandler('Only owner or admin can remove members', 403));
    }

    project.members = project.members.filter((m) => m.user.toString() !== userId);

    project = await project.save();

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};
