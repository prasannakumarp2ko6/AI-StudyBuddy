const User = require('../models/User');
const Material = require('../models/Material');
const Summary = require('../models/Summary');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const StudyPlan = require('../models/StudyPlan');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data: { users },
  });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    throw new ApiError(400, 'Admins cannot delete their own account from this panel');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const materials = await Material.find({ userId: user._id }).select('_id');
  const materialIds = materials.map((m) => m._id);

  await Promise.all([
    Summary.deleteMany({ materialId: { $in: materialIds } }),
    Flashcard.deleteMany({ materialId: { $in: materialIds } }),
    Quiz.deleteMany({ materialId: { $in: materialIds } }),
    Material.deleteMany({ userId: user._id }),
    StudyPlan.deleteMany({ userId: user._id }),
    user.deleteOne(),
  ]);

  res.status(200).json({
    success: true,
    message: 'User and all associated data deleted successfully',
    data: {},
  });
});

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalStudents,
    totalAdmins,
    totalMaterials,
    totalSummaries,
    totalFlashcards,
    totalQuizzes,
    totalStudyPlans,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'Student' }),
    User.countDocuments({ role: 'Admin' }),
    Material.countDocuments(),
    Summary.countDocuments(),
    Flashcard.countDocuments(),
    Quiz.countDocuments(),
    StudyPlan.countDocuments(),
  ]);

  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

  res.status(200).json({
    success: true,
    message: 'Application statistics fetched',
    data: {
      totalUsers,
      totalStudents,
      totalAdmins,
      totalMaterials,
      totalSummaries,
      totalFlashcards,
      totalQuizzes,
      totalStudyPlans,
      recentUsers,
    },
  });
});

module.exports = { getUsers, deleteUser, getStats };
