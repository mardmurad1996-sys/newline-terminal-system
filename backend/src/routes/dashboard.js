// ============================================
// DASHBOARD ROUTES FILE
// Real-time stats for the main dashboard
// ============================================
const express = require('express');
const router = express.Router();
const db = require('../../database/init');

// GET dashboard stats - called every 5 seconds
router.get('/stats', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    db.all(
        'SELECT type, COUNT(*) as trips, SUM(passengers_count) as passengers, SUM(total_income) as income, SUM(CASE WHEN status=? THEN 1 ELSE 0 END) as active FROM trips WHERE DATE(start_time) = ? GROUP BY type',
        ['active', today],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            const stats = {
                cityTaxi:     { trips:0, passengers:0, income:0, active:0 },
                longDistance: { trips:0, passengers:0, income:0, active:0 },
                bus:          { trips:0, passengers:0, income:0, active:0 },
                total:        { trips:0, passengers:0, income:0, active:0 }
            };
            rows.forEach(row => {
                if (row.type === 'City Taxi')    stats.cityTaxi = row;
                if (row.type === 'Long Distance') stats.longDistance = row;
                if (row.type === 'Bus')           stats.bus = row;
                stats.total.trips      += row.trips || 0;
                stats.total.passengers += row.passengers || 0;
                stats.total.income     += row.income || 0;
                stats.total.active     += row.active || 0;
            });
            res.json({ success: true, data: stats });
        }
    );
});

module.exports = router;
