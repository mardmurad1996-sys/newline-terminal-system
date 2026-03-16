const API = 'http://localhost:3000/api';

// Kurdish day names
const kurdishDays = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'];
const kurdishMonths = ['جنواری', 'فیبروری', 'مارچ', 'ئاپریل', 'مەی', 'جوون', 'جولای', 'ئاگوست', 'سێپتەمبەر', 'ئۆکتۆبەر', 'نۆڤەمبەر', 'دیسەمبەر'];

// Update clock and date
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = h + ':' + m + ':' + s;

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

// Load history
async function loadHistory() {
    try {
        const res = await fetch(API + '/trips/history');
        const data = await res.json();
        if (!data.success) {
            showNotif('خرادی لە بارکردنی داتا', 'error');
            return;
        }

        const tbody = document.getElementById('history-body');
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">ڕۆیشتنی بۆتالگی نیە</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(trip => {
            const endDate = new Date(trip.end_time);
            const dateStr = endDate.getDate() + '/' + String(endDate.getMonth()+1).padStart(2, '0') + '/' + endDate.getFullYear();
            return `
                <tr>
                    <td>${trip.id}</td>
                    <td>${trip.type}</td>
                    <td>${trip.driver_name}</td>
                    <td>${trip.route_from} → ${trip.route_to}</td>
                    <td>${trip.passengers_count}</td>
                    <td>${formatIQD(trip.total_income)}</td>
                    <td>${dateStr}</td>
                    <td>
                        <button onclick="showPassengers(${trip.id})" class="btn-small btn-info">گەشتیاران</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Load error:', err);
        showNotif('خرادی سیستم', 'error');
    }
}

// Show passengers
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

// Show notification
function showNotif(msg, type) {
    const n = document.createElement('div');
    n.className = 'notification notif-' + (type || 'info');
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => { n.remove(); }, 3500);
}

// Start on load
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 1000);
    loadHistory();
});