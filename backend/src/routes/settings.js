const express = require('express');
const router = express.Router();
const db = require('../database/init');

// Get next receipt number and increment counter
router.get('/next-receipt', (req, res) => {
    try {
        db.get('SELECT value FROM settings WHERE key = ?', ['receipt_counter'], (err, row) => {
            if (err) {
                return res.json({ success: false, message: 'خرادی لە دۆزینەوەی ژمارە پسووڵە' });
            }

            let nextNum = parseInt(row?.value || 0) + 1;

            // Increment counter
            db.run('UPDATE settings SET value = ? WHERE key = ?', [nextNum.toString(), 'receipt_counter'], (err) => {
                if (err) {
                    return res.json({ success: false, message: 'خرادی لە نوێ کردنەوەی ژمارە پسووڵە' });
                }

                res.json({ success: true, data: { receipt_number: nextNum } });
            });
        });
    } catch (err) {
        res.json({ success: false, message: 'خرادی سیستم' });
    }
});

module.exports = router;