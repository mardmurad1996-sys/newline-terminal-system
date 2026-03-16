// ============================================
// TRIP CONTROLLER FILE
// Handles all trip operations
// City Taxi, Long Distance, Bus
// ============================================

const db = require('../../database/init');

// GET ALL TRIPS
exports.getAll = (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const type = req.query.type || null;
    let sql = 'SELECT * FROM trips ORDER BY id DESC LIMIT ?';
    let params = [limit];
    if (type) {
        sql = 'SELECT * FROM trips WHERE type = ? ORDER BY id DESC LIMIT ?';
        params = [type, limit];
    }
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: rows || [] });
    });
};

// GET ACTIVE TRIPS (currently on road)
exports.getActive = (req, res) => {
    db.all('SELECT * FROM trips WHERE status = ? ORDER BY start_time DESC', ['active'], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: rows || [] });
    });
};

// GET HISTORY (completed trips)
exports.getHistory = (req, res) => {
    db.all('SELECT * FROM trips WHERE status = ? ORDER BY end_time DESC LIMIT 100', ['completed'], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: rows || [] });
    });
};

// GET STATS for dashboard
// Returns today totals by service type
exports.getStats = (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    db.all(
        'SELECT type, COUNT(*) as trips, SUM(passengers_count) as passengers, SUM(total_income) as income, SUM(CASE WHEN status=? THEN 1 ELSE 0 END) as active FROM trips WHERE DATE(start_time) = ? GROUP BY type',
        ['active', today],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            const stats = { cityTaxi: { trips:0, passengers:0, income:0, active:0 }, longDistance: { trips:0, passengers:0, income:0, active:0 }, bus: { trips:0, passengers:0, income:0, active:0 }, total: { trips:0, passengers:0, income:0, active:0 } };
            rows.forEach(row => {
                if (row.type === 'City Taxi') stats.cityTaxi = row;
                if (row.type === 'Long Distance') stats.longDistance = row;
                if (row.type === 'Bus') stats.bus = row;
                stats.total.trips += row.trips || 0;
                stats.total.passengers += row.passengers || 0;
                stats.total.income += row.income || 0;
                stats.total.active += row.active || 0;
            });
            res.json({ success: true, data: stats });
        }
    );
};

// GET ONE TRIP BY ID
exports.getById = (req, res) => {
    db.get('SELECT * FROM trips WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, error: 'Trip not found' });
        res.json({ success: true, data: row });
    });
};

// CREATE NEW TRIP
exports.create = (req, res) => {
    const { type, driver_name, driver_phone, driver_car, driver_id, route_from, route_to, fare_per_person } = req.body;
    if (!type || !driver_name || !route_from || !route_to) {
        return res.status(400).json({ success: false, error: 'Type, driver, and route required' });
    }
    db.run(
        'INSERT INTO trips (type, driver_id, driver_name, driver_phone, driver_car, route_from, route_to, fare_per_person, status, start_time) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [type, driver_id||null, driver_name.trim(), driver_phone||'', driver_car||'', route_from.trim(), route_to.trim(), fare_per_person||0, 'active', new Date().toISOString()],
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            // Send real-time update to all connected users
            const io = req.app.get('io');
            if (io) io.emit('tripCreated', { id: this.lastID });
            res.status(201).json({ success: true, data: { id: this.lastID } });
        }
    );
};

// UPDATE TRIP
exports.update = (req, res) => {
    const { passengers_count, total_income, status } = req.body;
    db.run(
        'UPDATE trips SET passengers_count=?, total_income=?, status=? WHERE id=?',
        [passengers_count, total_income, status, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: 'Trip updated!' });
        }
    );
};

// COMPLETE A TRIP
// Changes status from active to completed
exports.complete = (req, res) => {
    db.run(
        'UPDATE trips SET status=?, end_time=? WHERE id=?',
        ['completed', new Date().toISOString(), req.params.id],
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            const io = req.app.get('io');
            if (io) io.emit('tripCompleted', { id: req.params.id });
            res.json({ success: true, message: 'Trip completed!' });
        }
    );
};

// DELETE TRIP
exports.delete = (req, res) => {
    db.run('DELETE FROM trips WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: 'Trip deleted!' });
    });
};
