const fs = require('fs');
const Material = require('../models/Material');
const Summary = require('../models/Summary');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const geminiService = require('../services/geminiService');

// POST /api/material/upload  (multipart/form-data: file + title + subject)
// Also supports pasted text: JSON body { title, subject, content }
const uploadMaterial = asyncHandler(async (req, res) => {
  const { title, subject } = req.body;
  let content = req.body.content;
  let sourceFileName = null;

  if (req.file) {
    content = fs.readFileSync(req.file.path, 'utf-8');
    sourceFileName = req.file.originalname;
  }

  if (!title || !subject) {
    throw new ApiError(400, 'Title and subject are required');
  }
  if (!content || !content.trim()) {
    throw new ApiError(400, 'Study material must include text content, either pasted or from an uploaded file');
  }

  const material = await Material.create({
    userId: req.user._id,
    title,
    subject,
    content,
    sourceFileName,
  });

  res.status(201).json({
    success: true,
    message: 'Study material uploaded successfully',
    data: { material },
  });
});

// GET /api/material
const getMaterials = asyncHandler(async (req, res) => {
  const materials = await Material.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: 'Study materials fetched',
    data: { materials },
  });
});

// GET /api/material/:id
const getMaterialById = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, userId: req.user._id });
  if (!material) {
    throw new ApiError(404, 'Study material not found');
  }

  const [summary, flashcards, quiz] = await Promise.all([
    Summary.findOne({ materialId: material._id }),
    Flashcard.find({ materialId: material._id }).sort({ createdAt: 1 }),
    Quiz.findOne({ materialId: material._id }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Study material fetched',
    data: { material, summary, flashcards, quiz },
  });
});

// DELETE /api/material/:id
const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, userId: req.user._id });
  if (!material) {
    throw new ApiError(404, 'Study material not found');
  }

  await Promise.all([
    Summary.deleteMany({ materialId: material._id }),
    Flashcard.deleteMany({ materialId: material._id }),
    Quiz.deleteMany({ materialId: material._id }),
    material.deleteOne(),
  ]);

  res.status(200).json({
    success: true,
    message: 'Study material deleted successfully',
    data: {},
  });
});

// POST /api/materials/:id/summarize
const summarizeMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.id, userId: req.user._id });
  if (!material) {
    throw new ApiError(404, 'Study material not found');
  }

  const summaryText = await geminiService.generateSummary(material.content);

  const summary = await Summary.findOneAndUpdate(
    { materialId: material._id },
    { userId: req.user._id, materialId: material._id, summary: summaryText },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Summary generated successfully',
    data: { summary },
  });
});

module.exports = {
  uploadMaterial,
  getMaterials,
  getMaterialById,
  deleteMaterial,
  summarizeMaterial,
};
