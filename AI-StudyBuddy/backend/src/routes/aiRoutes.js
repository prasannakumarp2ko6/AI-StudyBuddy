const express = require('express');
const {
  createFlashcards,
  createQuiz,
  createStudyPlan,
  getStudyPlans,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/flashcards', createFlashcards);
router.post('/quiz', createQuiz);
router.post('/study-plan', createStudyPlan);
router.get('/study-plan', getStudyPlans);

module.exports = router;
