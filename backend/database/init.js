const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Where to save the database file
const DB_PATH = path.join(__dirname, 'terminal.db');

// Connect to database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) { console.error('Database error:', err.message); process.exit(1); }
    console.log('Database connected!');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create all tables
db.serialize(() => {

    // DRIVERS TABLE - saves all drivers
    db.run('CREATE TABLE IF NOT EXISTS drivers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, car_number TEXT NOT NULL, car_type TEXT DEFAULT Taxi, status TEXT DEFAULT active, created_at TEXT DEFAULT CURRENT_TIMESTAMP)', (err) => {
        if (err) console.error('Drivers table error:', err.message);
        else console.log('Drivers table ready!');
    });

    // TRIPS TABLE - saves every trip
    db.run('CREATE TABLE IF NOT EXISTS trips (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, driver_id INTEGER, driver_name TEXT NOT NULL, driver_phone TEXT, driver_car TEXT, route_from TEXT NOT NULL, route_to TEXT NOT NULL, passengers_count INTEGER DEFAULT 0, fare_per_person REAL DEFAULT 0, total_income REAL DEFAULT 0, status TEXT DEFAULT active, start_time TEXT DEFAULT CURRENT_TIMESTAMP, end_time TEXT, notes TEXT)', (err) => {
        if (err) console.error('Trips table error:', err.message);
        else console.log('Trips table ready!');
    });

    // PASSENGERS TABLE - saves every passenger
    db.run('CREATE TABLE IF NOT EXISTS passengers (id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id INTEGER NOT NULL, name TEXT NOT NULL, passport TEXT, nationality TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)', (err) => {
        if (err) console.error('Passengers table error:', err.message);
        else console.log('Passengers table ready!');
    });

    // DAILY SUMMARY TABLE - saves end of day totals
    db.run('CREATE TABLE IF NOT EXISTS daily_summary (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL UNIQUE, city_taxi_trips INTEGER DEFAULT 0, city_taxi_passengers INTEGER DEFAULT 0, city_taxi_income REAL DEFAULT 0, longdistance_trips INTEGER DEFAULT 0, longdistance_passengers INTEGER DEFAULT 0, longdistance_income REAL DEFAULT 0, bus_trips INTEGER DEFAULT 0, bus_passengers INTEGER DEFAULT 0, bus_income REAL DEFAULT 0, total_trips INTEGER DEFAULT 0, total_passengers INTEGER DEFAULT 0, total_income REAL DEFAULT 0)', (err) => {
        if (err) console.error('Daily summary error:', err.message);
        else console.log('Daily summary table ready!');
    });

    console.log('All tables created!');
});

module.exports = db;
