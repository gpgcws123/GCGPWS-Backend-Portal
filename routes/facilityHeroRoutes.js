const express = require('express');
const router = express.Router();
const facilityHeroController = require('../controller/facilityHeroController');

// CRUD routes
router.post('/', facilityHeroController.create);
router.get('/', facilityHeroController.getAll);
router.get('/:id', facilityHeroController.getOne);
router.put('/:id', facilityHeroController.update);
router.delete('/:id', facilityHeroController.delete);

module.exports = router; 