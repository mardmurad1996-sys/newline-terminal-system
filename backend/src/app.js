// ============================================
// MAIN SERVER FILE
// This is where the backend server starts
// All routes and middleware are connected here
// ============================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const db = require('../database/init');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: { origin: 'http://localhost:8080', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const driverRoutes = require('./routes/drivers');
const tripRoutes = require('./routes/trips');
const passengerRoutes = require('./routes/passengers');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');

app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running!' });
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected!');
    socket.on('disconnect', () => console.log('User disconnected!'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});

module.exports = { app, io };
