const express = require('express');
const router = express.Router();
const newsEventController = require('../controller/newsEventController');

// CRUD routes
router.post('/', newsEventController.create);
router.get('/', newsEventController.getAll);
router.get('/:id', newsEventController.getOne);
router.put('/:id', newsEventController.update);
router.delete('/:id', newsEventController.delete);

module.exports = router; 