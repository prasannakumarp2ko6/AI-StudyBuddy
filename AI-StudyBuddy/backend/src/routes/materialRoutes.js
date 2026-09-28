const express = require('express');
const {
  uploadMaterial,
  getMaterials,
  getMaterialById,
  deleteMaterial,
  summarizeMaterial,
} = require('../controllers/materialController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/material/upload', upload.single('file'), uploadMaterial);
router.get('/material', getMaterials);
router.get('/material/:id', getMaterialById);
router.delete('/material/:id', deleteMaterial);

router.post('/materials/:id/summarize', summarizeMaterial);

module.exports = router;
