// ============================================
// DASHBOARD JS FILE
// Updates stats every 5 seconds automatically
// Shows live clock and date in Kurdish
// ============================================

const API = 'http://localhost:3000/api';

// Kurdish day names
var kurdishDays = ['????????','????????','???????','??????mm?','??????mm?','?????','??mm?'];

// Kurdish month names
var kurdishMonths = ['??????? ?????','?????','?????','?????','?????','????????','???????','???','???????','?????? ?????','?????? ?????','??????? ?????'];

// Update clock every second
function updateClock() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    var clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = h + ':' + m + ':' + s;

    // Update date
    var dateEl = document.getElementById('today-date');
    if (dateEl) {
        var day = kurdishDays[now.getDay()];
        var date = now.getDate();
        var month = kurdishMonths[now.getMonth()];
        var year = now.getFullYear();
        dateEl.textContent = day + ' - ' + date + ' ' + month + ' ' + year;
    }
}

// Format IQD currency
function formatIQD(amount) {
    if (!amount) return '0 IQD';
    return Number(amount).toLocaleString() + ' IQD';
}

// Load dashboard stats from backend
async function loadStats() {
    try {
        var res = await fetch(API + '/dashboard/stats');
        var data = await res.json();
        if (!data.success) return;
        var s = data.data;

        // Update City Taxi stats
        document.getElementById('ct-trips').textContent = s.cityTaxi.trips || 0;
        document.getElementById('ct-passengers').textContent = s.cityTaxi.passengers || 0;
        document.getElementById('ct-income').textContent = formatIQD(s.cityTaxi.income);
        document.getElementById('ct-active').textContent = s.cityTaxi.active || 0;

        // Update Long Distance stats
        document.getElementById('ld-trips').textContent = s.longDistance.trips || 0;
        document.getElementById('ld-passengers').textContent = s.longDistance.passengers || 0;
        document.getElementById('ld-income').textContent = formatIQD(s.longDistance.income);
        document.getElementById('ld-active').textContent = s.longDistance.active || 0;

        // Update Bus stats
        document.getElementById('bs-trips').textContent = s.bus.trips || 0;
        document.getElementById('bs-passengers').textContent = s.bus.passengers || 0;
        document.getElementById('bs-income').textContent = formatIQD(s.bus.income);
        document.getElementById('bs-active').textContent = s.bus.active || 0;

        // Update Total stats
        document.getElementById('tot-trips').textContent = s.total.trips || 0;
        document.getElementById('tot-passengers').textContent = s.total.passengers || 0;
        document.getElementById('tot-income').textContent = formatIQD(s.total.income);
        document.getElementById('tot-active').textContent = s.total.active || 0;

    } catch (err) {
        console.log('Stats error:', err.message);
    }
}

// Show notification message
function showNotif(msg, type) {
    var n = document.createElement('div');
    n.className = 'notification notif-' + (type || 'info');
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(function() { n.remove(); }, 3500);
}

// Start everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 1000);
    loadStats();
    setInterval(loadStats, 5000);
});
