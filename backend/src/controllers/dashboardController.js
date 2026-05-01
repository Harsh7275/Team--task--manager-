import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ErrorHandler from '../utils/errorHandler.js';

export const getDashboard = async (req, res, next) => {
  try {
    // Get user's projects
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    });

    const projectIds = projects.map((p) => p._id);

    // Get all tasks for user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email');

    // Get user's assigned tasks
    const myTasks = allTasks.filter((t) => t.assignee && t.assignee._id.toString() === req.user._id.toString());

    // Task status breakdown
    const statusStats = {
      todo: allTasks.filter((t) => t.status === 'Todo').length,
      inProgress: allTasks.filter((t) => t.status === 'In Progress').length,
      review: allTasks.filter((t) => t.status === 'Review').length,
      done: allTasks.filter((t) => t.status === 'Done').length,
    };

    // Overdue tasks
    const now = new Date();
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'Done'
    );

    // Priority breakdown
    const priorityStats = {
      low: allTasks.filter((t) => t.priority === 'Low').length,
      medium: allTasks.filter((t) => t.priority === 'Medium').length,
      high: allTasks.filter((t) => t.priority === 'High').length,
      critical: allTasks.filter((t) => t.priority === 'Critical').length,
    };

    res.status(200).json({
      success: true,
      dashboard: {
        totalProjects: projects.length,
        totalTasks: allTasks.length,
        myTasks: myTasks.length,
        overdueTasks: overdueTasks.length,
        statusStats,
        priorityStats,
        recentTasks: myTasks.slice(0, 5),
        overdueTasks: overdueTasks.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};
