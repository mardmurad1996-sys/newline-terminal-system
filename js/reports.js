const API = 'http://localhost:3000/api';

// Kurdish day names
const kurdishDays = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'];
const kurdishMonths = ['جنواری', 'فیبروری', 'مارچ', 'ئاپریل', 'مەی', 'جوون', 'جولای', 'ئاگوست', 'سێپتەمبەر', 'ئۆکتۆبەر', 'نۆڤەمبەر', 'دیسەمبەر'];

// Update clock
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = h + ':' + m + ':' + s;
}

// Format IQD currency
function formatIQD(amount) {
    if (!amount) return '0 IQD';
    return Number(amount).toLocaleString() + ' IQD';
}

// Load report for selected date
async function loadReport() {
    const dateInput = document.getElementById('report-date').value;
    if (!dateInput) {
        showNotif('تکایە بەرواری دیاری بکە', 'warning');
        return;
    }

    try {
        const res = await fetch(API + '/reports/daily?date=' + dateInput);
        const data = await res.json();
        if (!data.success) {
            showNotif('خرادی لە بارکردنی داتا', 'error');
            return;
        }

        const report = data.data;
        const titleEl = document.getElementById('report-date-title');
        const dateObj = new Date(dateInput);
        const day = kurdishDays[dateObj.getDay()];
        const date = dateObj.getDate();
        const month = kurdishMonths[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        titleEl.textContent = 'ڕاپۆرتی ' + day + ' - ' + date + ' ' + month + ' ' + year;

        const tbody = document.getElementById('report-body');
        tbody.innerHTML = `
            <tr>
                <td>تاکسی ناو شار</td>
                <td>${report.city_taxi_trips || 0}</td>
                <td>${report.city_taxi_passengers || 0}</td>
                <td>${formatIQD(report.city_taxi_income)}</td>
            </tr>
            <tr>
                <td>ڕۆیشتنی دوری درێژ</td>
                <td>${report.longdistance_trips || 0}</td>
                <td>${report.longdistance_passengers || 0}</td>
                <td>${formatIQD(report.longdistance_income)}</td>
            </tr>
            <tr>
                <td>بوس</td>
                <td>${report.bus_trips || 0}</td>
                <td>${report.bus_passengers || 0}</td>
                <td>${formatIQD(report.bus_income)}</td>
            </tr>
            <tr style="font-weight: bold; background-color: #f0f2f5;">
                <td>کۆی گشتی</td>
                <td>${report.total_trips || 0}</td>
                <td>${report.total_passengers || 0}</td>
                <td>${formatIQD(report.total_income)}</td>
            </tr>
        `;
    } catch (err) {
        console.error('Load error:', err);
        showNotif('خرادی سیستم', 'error');
    }
}

// Set today's date as default
function setTodayDate() {
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    document.getElementById('report-date').value = dateStr;
    loadReport();
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
    setTodayDate();
});