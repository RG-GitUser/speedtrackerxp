const mongoose = require('mongoose');

const testExecutionSchema = new mongoose.Schema({
  testCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase',
    required: true
  },
  executedBy: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pass', 'fail', 'blocked', 'skipped', 'in-progress'],
    required: true
  },
  environment: {
    type: String,
    enum: ['production', 'staging', 'development', 'qa', 'uat', 'local'],
    required: true
  },
  version: {
    type: String,
    trim: true
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'api', 'other'],
    default: 'desktop'
  },
  browser: {
    type: String,
    trim: true
  },
  os: {
    type: String,
    trim: true
  },
  actualResult: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  defects: [{
    id: String,
    description: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  executionTime: {
    type: Number,
    default: null
  },
  executedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TestExecution', testExecutionSchema);
