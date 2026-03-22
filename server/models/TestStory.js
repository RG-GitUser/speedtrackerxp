const mongoose = require('mongoose');

const testStorySchema = new mongoose.Schema({
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
  userStory: {
    type: String,
    trim: true
  },
  acceptanceCriteria: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'ready', 'in-progress', 'completed', 'blocked'],
    default: 'draft'
  },
  assignedTo: {
    type: String,
    default: null
  },
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

testStorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TestStory', testStorySchema);
