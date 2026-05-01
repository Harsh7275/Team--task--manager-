import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['Admin', 'Member'],
          default: 'Member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Completed'],
      default: 'Active',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Populate owner and members on find
projectSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate('owner', 'name email avatar');
  next();
});

export default mongoose.model('Project', projectSchema);
