const mongoose = require('mongoose');

const testRunSchema = new mongoose.Schema({
  createdBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running'
  },
  tests: [{
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCase',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'passed', 'failed'],
      default: 'pending'
    },
    startTime: {
      type: Date,
      default: null
    },
    endTime: {
      type: Date,
      default: null
    },
    logs: [{
      type: String
    }],
    result: {
      type: String,
      enum: ['success', 'failure', null],
      default: null
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('TestRun', testRunSchema);
