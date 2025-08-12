import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  contentType: {
    type: String,
    enum: ['Post', 'Reel', 'Story'],
    required: true
  },
  caption: {
    type: String,
    required: [true, 'Caption is required'],
    trim: true
  },
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Posted', 'Not Posted'],
    default: 'Pending'
  },
  publishAt: {
    type: Date,
    required: [true, 'Publish date is required']
  },
  reminderEmails: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isReminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Content = mongoose.model('Content', contentSchema);
export default Content;