const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    examDate: { type: Date, required: true },
    hoursPerDay: { type: Number, required: true },
    goals: { type: String, default: '' },
    topics: { type: String, default: '' },
    studyPlan: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
