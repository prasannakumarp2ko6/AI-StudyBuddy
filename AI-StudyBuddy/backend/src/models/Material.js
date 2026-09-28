const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    subject: { type: String, required: [true, 'Subject is required'], trim: true },
    content: { type: String, required: [true, 'Content is required'] },
    sourceFileName: { type: String, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('Material', materialSchema);
