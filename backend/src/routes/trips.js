// ============================================
// TRIPS ROUTES FILE
// All API endpoints for trips
// ============================================

const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// GET all trips
router.get('/', tripController.getAll);

// GET active trips only (status = active)
router.get('/active', tripController.getActive);

// GET completed trips (history)
router.get('/history', tripController.getHistory);

// GET stats by service type
router.get('/stats', tripController.getStats);

// GET one trip by ID
router.get('/:id', tripController.getById);

// POST create new trip
router.post('/', tripController.create);

// PUT update trip
router.put('/:id', tripController.update);

// PUT complete a trip (change status to completed)
router.put('/:id/complete', tripController.complete);

// DELETE trip
router.delete('/:id', tripController.delete);

module.exports = router;
