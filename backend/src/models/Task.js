import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Review', 'Done'],
      default: 'Todo',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    dueDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
    },
    actualHours: {
      type: Number,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isOverdue: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Update isOverdue before finding
taskSchema.pre(/^find/, function (next) {
  const now = new Date();
  this.updateMany({}, [
    {
      $set: {
        isOverdue: {
          $and: [{ $lt: ['$dueDate', now] }, { $ne: ['$status', 'Done'] }],
        },
      },
    },
  ]);
  next();
});

// Populate references
taskSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate('assignee', 'name email avatar').populate('createdBy', 'name email');
  next();
});

export default mongoose.model('Task', taskSchema);
