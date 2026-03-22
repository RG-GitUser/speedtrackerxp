const mongoose = require('mongoose');

const devTaskSchema = new mongoose.Schema({
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'in-review', 'completed', 'blocked'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  estimatedHours: {
    type: Number,
    default: null
  },
  actualHours: {
    type: Number,
    default: null
  },
  relatedTestStoryIds: [{
    type: String,
    trim: true
  }],
  relatedTestCaseIds: [{
    type: String,
    trim: true
  }],
  relatedDevTaskIds: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

devTaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DevTask', devTaskSchema);
