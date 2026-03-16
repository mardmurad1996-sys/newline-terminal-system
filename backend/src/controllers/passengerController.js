// ============================================
// PASSENGER CONTROLLER FILE
// Handles adding passengers to trips
// ============================================
const db = require('../../database/init');

exports.getByTrip = (req, res) => {
    db.all('SELECT * FROM passengers WHERE trip_id = ?', [req.params.tripId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: rows || [] });
    });
};

exports.create = (req, res) => {
    const { trip_id, name, passport, nationality } = req.body;
    if (!trip_id || !name) return res.status(400).json({ success: false, error: 'Trip ID and name required' });
    db.run('INSERT INTO passengers (trip_id, name, passport, nationality) VALUES (?,?,?,?)',
        [trip_id, name.trim(), passport||'', nationality||''],
        function(err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            db.run('UPDATE trips SET passengers_count = passengers_count + 1, total_income = fare_per_person * (passengers_count + 1) WHERE id = ?', [trip_id]);
            const io = req.app.get('io');
            if (io) io.emit('passengerAdded', { trip_id, id: this.lastID });
            res.status(201).json({ success: true, data: { id: this.lastID } });
        }
    );
};

exports.bulkCreate = (req, res) => {
    const { trip_id, passengers } = req.body;
    if (!trip_id || !passengers || !passengers.length) {
        return res.status(400).json({ success: false, error: 'Trip ID and passengers required' });
    }
    passengers.forEach(p => {
        db.run('INSERT INTO passengers (trip_id, name, passport, nationality) VALUES (?,?,?,?)',
            [trip_id, p.name.trim(), p.passport||'', p.nationality||'']);
    });
    db.run('UPDATE trips SET passengers_count = ?, total_income = fare_per_person * ? WHERE id = ?',
        [passengers.length, passengers.length, trip_id]);
    const io = req.app.get('io');
    if (io) io.emit('passengersAdded', { trip_id, count: passengers.length });
    res.status(201).json({ success: true, message: passengers.length + ' passengers added!' });
};

exports.delete = (req, res) => {
    db.run('DELETE FROM passengers WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: 'Passenger deleted!' });
    });
};
