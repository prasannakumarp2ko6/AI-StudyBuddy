const Material = require('../models/Material');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const StudyPlan = require('../models/StudyPlan');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const geminiService = require('../services/geminiService');

const getOwnedMaterial = async (materialId, userId) => {
  const material = await Material.findOne({ _id: materialId, userId });
  if (!material) {
    throw new ApiError(404, 'Study material not found');
  }
  return material;
};

// POST /api/ai/flashcards  { materialId, count? }
const createFlashcards = asyncHandler(async (req, res) => {
  const { materialId, count } = req.body;
  if (!materialId) {
    throw new ApiError(400, 'materialId is required');
  }
  const material = await getOwnedMaterial(materialId, req.user._id);

  const generated = await geminiService.generateFlashcards(material.content, count || 10);

  // Replace any previous flashcard set for this material with the newly generated one
  await Flashcard.deleteMany({ materialId: material._id });
  const docs = generated.map((f) => ({
    userId: req.user._id,
    materialId: material._id,
    question: f.question,
    answer: f.answer,
  }));
  const flashcards = await Flashcard.insertMany(docs);

  res.status(201).json({
    success: true,
    message: 'Flashcards generated successfully',
    data: { flashcards },
  });
});

// POST /api/ai/quiz  { materialId, count? }
const createQuiz = asyncHandler(async (req, res) => {
  const { materialId, count } = req.body;
  if (!materialId) {
    throw new ApiError(400, 'materialId is required');
  }
  const material = await getOwnedMaterial(materialId, req.user._id);

  const questions = await geminiService.generateQuiz(material.content, count || 5);

  const quiz = await Quiz.findOneAndUpdate(
    { materialId: material._id },
    { userId: req.user._id, materialId: material._id, questions },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({
    success: true,
    message: 'Quiz generated successfully',
    data: { quiz },
  });
});

// POST /api/ai/study-plan  { subject, examDate, hoursPerDay, goals?, topics? }
const createStudyPlan = asyncHandler(async (req, res) => {
  const { subject, examDate, hoursPerDay, goals, topics } = req.body;

  if (!subject || !examDate || !hoursPerDay) {
    throw new ApiError(400, 'subject, examDate and hoursPerDay are required');
  }
  if (Number.isNaN(Number(hoursPerDay)) || Number(hoursPerDay) <= 0) {
    throw new ApiError(400, 'hoursPerDay must be a positive number');
  }
  if (Number.isNaN(Date.parse(examDate))) {
    throw new ApiError(400, 'examDate must be a valid date');
  }

  const generatedPlan = await geminiService.generateStudyPlan({
    subject,
    examDate,
    hoursPerDay,
    goals,
    topics,
  });

  const studyPlan = await StudyPlan.create({
    userId: req.user._id,
    subject,
    examDate,
    hoursPerDay,
    goals: goals || '',
    topics: topics || '',
    studyPlan: generatedPlan,
  });

  res.status(201).json({
    success: true,
    message: 'Study plan generated successfully',
    data: { studyPlan },
  });
});

// GET /api/ai/study-plan  (list the user's saved study plans)
const getStudyPlans = asyncHandler(async (req, res) => {
  const studyPlans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: 'Study plans fetched',
    data: { studyPlans },
  });
});

module.exports = { createFlashcards, createQuiz, createStudyPlan, getStudyPlans };
