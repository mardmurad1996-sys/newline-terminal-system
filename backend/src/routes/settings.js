const express = require('express');
const router = express.Router();
const db = require('../../database/init');

router.get('/', (req, res) => {
    res.json({ message: 'Settings linked correctly' });
});

module.exports = router;
