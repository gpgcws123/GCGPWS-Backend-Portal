const express = require('express');
const router = express.Router();
const academicController = require('../controller/academicController');
const upload = require('../middleware/upload');

// Type-specific routes
router.get('/type/:type', async (req, res) => {
  req.query.type = req.params.type;
  return academicController.getAll(req, res);
});

// CRUD routes with file upload middleware
router.post('/', upload.single('image'), academicController.create);
router.get('/', academicController.getAll);
router.get('/:id', academicController.getOne);
router.put('/:id', upload.single('image'), academicController.update);
router.delete('/:id', academicController.delete);

module.exports = router; 