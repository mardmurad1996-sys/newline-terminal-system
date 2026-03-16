// ============================================
// DRIVER CONTROLLER FILE
// Contains all logic for driver operations
// Each function handles one API endpoint
// ============================================

const db = require('../../database/init');

// GET ALL DRIVERS
// Returns list of all drivers in database
exports.getAll = (req, res) => {
    db.all('SELECT * FROM drivers ORDER BY name ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: rows || [] });
    });
};

// SEARCH DRIVERS (for auto-suggest)
// User types letters, returns matching drivers
exports.search = (req, res) => {
    const q = req.query.q || '';
    if (!q) return res.json({ success: true, data: [] });
    db.all(
        'SELECT * FROM drivers WHERE name LIKE ? OR phone LIKE ? OR car_number LIKE ? LIMIT 10',
        ['%' + q + '%', '%' + q + '%', '%' + q + '%'],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, data: rows || [] });
        }
    );
};

// GET DRIVER BY ID
exports.getById = (req, res) => {
    db.get('SELECT * FROM drivers WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, error: 'Driver not found' });
        res.json({ success: true, data: row });
    });
};

// CREATE NEW DRIVER
// Saves new driver to database
exports.create = (req, res) => {
    const { name, phone, car_number, car_type } = req.body;
    if (!name || !phone || !car_number) {
        return res.status(400).json({ success: false, error: 'Name, phone and car number required' });
    }
    db.run(
        'INSERT INTO drivers (name, phone, car_number, car_type) VALUES (?, ?, ?, ?)',
        [name.trim(), phone.trim(), car_number.trim(), car_type || 'Taxi'],
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.status(201).json({ success: true, data: { id: this.lastID } });
        }
    );
};

// UPDATE DRIVER
exports.update = (req, res) => {
    const { name, phone, car_number, car_type } = req.body;
    db.run(
        'UPDATE drivers SET name=?, phone=?, car_number=?, car_type=? WHERE id=?',
        [name, phone, car_number, car_type, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: 'Driver updated!' });
        }
    );
};

// DELETE DRIVER
exports.delete = (req, res) => {
    db.run('DELETE FROM drivers WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: 'Driver deleted!' });
    });
};
