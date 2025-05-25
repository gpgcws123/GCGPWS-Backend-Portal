const express = require('express');
const router = express.Router();
const studentPortalController = require('../controller/studentPortalController');

// CRUD routes
router.post('/', studentPortalController.create);
router.get('/', studentPortalController.getAll);
router.get('/:id', studentPortalController.getOne);
router.put('/:id', studentPortalController.update);
router.delete('/:id', studentPortalController.delete);

module.exports = router; 