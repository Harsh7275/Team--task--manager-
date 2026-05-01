import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ErrorHandler from '../utils/errorHandler.js';

export const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, priority, dueDate, estimatedHours } = req.body;

    if (!title || !projectId) {
      return next(new ErrorHandler('Please provide title and project ID', 400));
    }

    // Verify project exists and user is member
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ErrorHandler('Project not found', 404));
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return next(new ErrorHandler('Not authorized to create task in this project', 403));
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      createdBy: req.user._id,
      priority,
      dueDate,
      estimatedHours,
    });

    await task.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee } = req.query;

    // Verify project exists and user is member
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ErrorHandler('Project not found', 404));
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return next(new ErrorHandler('Not authorized to view tasks in this project', 403));
    }

    let query = { project: projectId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email avatar')
      .populate('project', 'name');

    if (!task) {
      return next(new ErrorHandler('Task not found', 404));
    }

    // Verify user has access to project
    const project = await Project.findById(task.project);
    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return next(new ErrorHandler('Not authorized to view this task', 403));
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, estimatedHours, actualHours, assignee } = req.body;

    let task = await Task.findById(req.params.taskId);

    if (!task) {
      return next(new ErrorHandler('Task not found', 404));
    }

    // Verify user has access
    const project = await Project.findById(task.project);
    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return next(new ErrorHandler('Not authorized to update this task', 403));
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (estimatedHours) task.estimatedHours = estimatedHours;
    if (actualHours) task.actualHours = actualHours;
    if (assignee) task.assignee = assignee;

    task = await task.save();
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return next(new ErrorHandler('Task not found', 404));
    }

    // Only creator or project owner can delete
    const project = await Project.findById(task.project);
    const isAuthorized =
      task.createdBy.toString() === req.user._id.toString() ||
      project.owner.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return next(new ErrorHandler('Not authorized to delete this task', 403));
    }

    await Task.findByIdAndDelete(req.params.taskId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { taskId } = req.params;

    if (!text) {
      return next(new ErrorHandler('Please provide comment text', 400));
    }

    let task = await Task.findById(taskId);

    if (!task) {
      return next(new ErrorHandler('Task not found', 404));
    }

    task.comments.push({
      user: req.user._id,
      text,
    });

    task = await task.save();
    await task.populate('comments.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};
