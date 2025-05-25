const express = require('express');
const router = express.Router();
const facilityHeroController = require('../controller/facilityHeroController');
const upload = require('../middleware/upload');

// CRUD routes
router.post('/', upload.single('image'), facilityHeroController.create);
router.get('/', facilityHeroController.getAll);
router.get('/:id', facilityHeroController.getOne);
router.put('/:id', upload.single('image'), facilityHeroController.update);
router.delete('/:id', facilityHeroController.delete);

module.exports = router; 