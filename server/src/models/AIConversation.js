import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'Wellness Conversation' },
  language: { type: String, default: 'en' },
  messages: [{
    sender: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    isClinicalObservation: { type: Boolean, default: false },
    suggestedFollowUps: [{ type: String }]
  }],
  authorizedContextShared: { type: Boolean, default: true }
}, { timestamps: true });

export const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
