const API = 'http://localhost:3000/api';

// Kurdish day names
const kurdishDays = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'];
const kurdishMonths = ['جنواری', 'فیبروری', 'مارچ', 'ئاپریل', 'مەی', 'جوون', 'جولای', 'ئاگوست', 'سێپتەمبەر', 'ئۆکتۆبەر', 'نۆڤەمبەر', 'دیسەمبەر'];

// Update clock and date every second
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = h + ':' + m + ':' + s;

    // Update date
    const dateEl = document.getElementById('today-date');
    if (dateEl) {
        const day = kurdishDays[now.getDay()];
        const date = now.getDate();
        const month = kurdishMonths[now.getMonth()];
        const year = now.getFullYear();
        dateEl.textContent = day + ' - ' + date + ' ' + month + ' ' + year;
    }
}

// Format IQD currency
function formatIQD(amount) {
    if (!amount) return '0 IQD';
    return Number(amount).toLocaleString() + ' IQD';
}

// Load active trips
async function loadActiveTrips() {
    try {
        const res = await fetch(API + '/trips/active');
        const data = await res.json();
        if (!data.success) {
            showNotif('خرادی لە بارکردنی داتا', 'error');
            return;
        }

        const tbody = document.getElementById('trips-body');
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">ڕۆیشتنی چالاکی نیە</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(trip => `
            <tr>
                <td>${trip.id}</td>
                <td>${trip.type}</td>
                <td>${trip.driver_name}</td>
                <td>${trip.route_from} → ${trip.route_to}</td>
                <td>${trip.passengers_count}</td>
                <td>${new Date(trip.start_time).toLocaleTimeString('ckb-IQ')}</td>
                <td>
                    <button onclick="completeTrip(${trip.id})" class="btn-small btn-success">تێچوو کردن</button>
                    <button onclick="showPassengers(${trip.id})" class="btn-small btn-info">گەشتیاران</button>
                    <button onclick="printReceiptTrip(${trip.id})" class="btn-small btn-print">چاپی پسووڵە</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Load error:', err);
        showNotif('خرادی سیستم', 'error');
    }
}

// Complete a trip
async function completeTrip(tripId) {
    if (!confirm('ئایا دڵنیایت کە ئەم ڕۆیشتنە تێچووبکەی؟')) return;

    try {
        const res = await fetch(API + '/trips/' + tripId + '/complete', { method: 'PUT' });
        const data = await res.json();
        if (data.success) {
            showNotif('ڕۆیشتنە تێچوو کرا', 'success');
            loadActiveTrips();
        } else {
            showNotif(data.message || 'خرادی لە تێچوو کردن', 'error');
        }
    } catch (err) {
        console.error('Error:', err);
        showNotif('خرادی سیستم', 'error');
    }
}

// Show passengers for a trip
async function showPassengers(tripId) {
    try {
        const res = await fetch(API + '/passengers?trip_id=' + tripId);
        const data = await res.json();
        if (data.success) {
            let passList = data.data.map((p, i) => (i+1) + '. ' + p.name + ' - ' + p.passport).join('\n');
            alert('گەشتیاران:\n\n' + passList);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// Print receipt for trip
async function printReceiptTrip(tripId) {
    try {
        const res = await fetch(API + '/trips/' + tripId);
        const data = await res.json();
        if (data.success) {
            const trip = data.data;
            const pasRes = await fetch(API + '/passengers?trip_id=' + tripId);
            const pasData = await pasRes.json();
            if (pasData.success) {
                printReceipt(trip, pasData.data);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// Print receipt function
function printReceipt(trip, passengers) {
    let rows = '';
    for (let i = 1; i <= 10; i++) {
        const p = passengers[i-1] || {name: '', passport: '', nationality: ''};
        rows += '<tr><td>' + i + '</td><td>' + p.name + '</td><td>' + p.passport + '</td><td>' + p.nationality + '</td></tr>';
    }

    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const dateStr = now.getFullYear() + '/' + String(now.getMonth()+1).padStart(2, '0') + '/' + String(now.getDate()).padStart(2, '0');

    const style = '<style>@page{size:A5;margin:10mm}body{font-family:Arial,sans-serif;direction:rtl;font-size:13px;margin:0;padding:0}.receipt{border:2px solid #000;padding:10px;width:100%}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:8px}.title{font-size:18px;font-weight:bold;color:#1a1a2e}.phone{background:#1a1a2e;color:white;padding:3px 8px;border-radius:4px;font-size:12px}.number{color:red;font-size:20px;font-weight:bold}.subtitle{background:#f59e0b;color:white;text-align:center;padding:6px;font-weight:bold;margin:8px 0;border-radius:4px}.info-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #ddd}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #000;padding:6px;text-align:center;font-size:12px}th{background:#1a1a2e;color:#ffd700}.footer{text-align:center;margin-top:10px;font-size:11px;color:#666}.page-break{page-break-after:always}</style>';

    const subtitle = trip.type === 'City Taxi' ? 'پسووڵەی دەرچوونی تاکسی بۆ ناو حاجی ئۆمەران' : 'پسووڵەی دەرچوونی تاکسی بۆ هەموو شار و شارۆچکەکان';

    const card = '<div class=receipt>' +
        '<div class=header><div><div class=title>دەروازەی نێودەوڵەتی حاجی ئۆمەران</div>' +
        '<div>وێنەی بازگە &nbsp; تێرمینال &nbsp; <span class=number>ژمارە : ' + trip.id + '</span></div></div>' +
        '<div class=phone>0750 235 3448</div></div>' +
        '<div class=subtitle>' + subtitle + '</div>' +
        '<div class=info-row><span>کات ( ' + timeStr + ' )</span><span>ڕێکەوت : ' + dateStr + '</span></div>' +
        '<div class=info-row>ناوی شۆفێر : ' + trip.driver_name + '</div>' +
        '<div class=info-row><span>ئۆتۆمبێلی ژمارە : ' + trip.driver_car + '</span><span>ڕۆیشتنی بۆ : ' + trip.route_to + '</span></div>' +
        '<div class=info-row><span>ژ.م شۆفێر : ' + trip.driver_phone + '</span><span>بڕی پارە : ' + Number(trip.total_income).toLocaleString() + ' IQD</span></div>' +
        '<table><thead><tr><th>ژ</th><th>ناوی گەشتیار</th><th>ژ.پاسەپۆرت</th><th>وڵاتنامە</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<div class=footer>دەروازەی نێودەوڵەتی حاجی ئۆمەران - تێرمینال</div></div>';

    const w = window.open('', '_blank');
    w.document.write('<!DOCTYPE html><html><head><meta charset=UTF-8>' + style + '</head><body>' + card + '<div class=page-break></div>' + card + '</body></html>');
    w.document.close();
    setTimeout(() => { w.print(); }, 800);
}

// Show notification
function showNotif(msg, type) {
    const n = document.createElement('div');
    n.className = 'notification notif-' + (type || 'info');
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => { n.remove(); }, 3500);
}

// Start on page load
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 1000);
    loadActiveTrips();
    setInterval(loadActiveTrips, 5000);
});