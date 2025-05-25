const express = require('express');
const router = express.Router();
const academicController = require('../controller/academicController');

// CRUD routes
router.post('/', academicController.create);
router.get('/', academicController.getAll);
router.get('/:id', academicController.getOne);
router.put('/:id', academicController.update);
router.delete('/:id', academicController.delete);

module.exports = router; 