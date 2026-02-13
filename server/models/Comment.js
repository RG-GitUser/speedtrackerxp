const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  testRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRun',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);
