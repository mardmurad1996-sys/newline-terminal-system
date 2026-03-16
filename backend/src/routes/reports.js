// ============================================
// REPORTS ROUTES FILE
// Daily reports for admin
// ============================================
const express = require('express');
const router = express.Router();
const db = require('../../database/init');

// GET daily report
router.get('/daily', (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    db.all(
        'SELECT type, COUNT(*) as trips, SUM(passengers_count) as passengers, SUM(total_income) as income FROM trips WHERE DATE(start_time) = ? GROUP BY type',
        [date],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, data: rows || [], date });
        }
    );
});

// GET driver report
router.get('/driver/:driverId', (req, res) => {
    db.all(
        'SELECT * FROM trips WHERE driver_id = ? ORDER BY start_time DESC',
        [req.params.driverId],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, data: rows || [] });
        }
    );
});

// GET all trips with passengers for export
router.get('/export', (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    db.all(
        'SELECT t.*, p.name as pax_name, p.passport as pax_passport FROM trips t LEFT JOIN passengers p ON t.id = p.trip_id WHERE DATE(t.start_time) = ? ORDER BY t.id',
        [date],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, data: rows || [] });
        }
    );
});

module.exports = router;
