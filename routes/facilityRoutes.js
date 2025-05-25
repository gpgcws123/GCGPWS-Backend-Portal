const express = require('express');
const router = express.Router();
const facilityController = require('../controller/facilityController');

// CRUD routes
router.post('/', facilityController.create);
router.get('/', facilityController.getAll);
router.get('/:id', facilityController.getOne);
router.put('/:id', facilityController.update);
router.delete('/:id', facilityController.delete);

module.exports = router; 