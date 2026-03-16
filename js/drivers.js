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

// Load all drivers
async function loadDrivers() {
    try {
        const res = await fetch(API + '/drivers');
        const data = await res.json();
        if (!data.success) {
            showNotif('خرادی لە بارکردنی داتا', 'error');
            return;
        }

        const tbody = document.getElementById('drivers-body');
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">شۆفێری نیە</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(driver => `
            <tr>
                <td>${driver.id}</td>
                <td>${driver.name}</td>
                <td>${driver.phone}</td>
                <td>${driver.car_number}</td>
                <td>${driver.car_type}</td>
                <td>
                    <button onclick="deleteDriver(${driver.id})" class="btn-small btn-danger">سڕینەوە</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Load error:', err);
        showNotif('خرادی سیستم', 'error');
    }
}

// Add new driver
async function addDriver() {
    const name = document.getElementById('new-name').value.trim();
    const phone = document.getElementById('new-phone').value.trim();
    const car = document.getElementById('new-car').value.trim();
    const type = document.getElementById('new-type').value.trim();

    if (!name || !phone || !car || !type) {
        showNotif('تکایە هەموو خانە پڕ بکە', 'warning');
        return;
    }

    try {
        const res = await fetch(API + '/drivers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, car_number: car, car_type: type })
        });
        const data = await res.json();
        if (data.success) {
            showNotif('شۆفێری نووسراو کرا', 'success');
            document.getElementById('new-name').value = '';
            document.getElementById('new-phone').value = '';
            document.getElementById('new-car').value = '';
            document.getElementById('new-type').value = '';
            loadDrivers();
        } else {
            showNotif(data.message || 'خرادی لە زیادکردن', 'error');
        }
    } catch (err) {
        console.error('Error:', err);
        showNotif('خرادی سیستم', 'error');
    }
}

// Delete driver
async function deleteDriver(driverId) {
    if (!confirm('ئایا دڵنیایت کە بتویت ئەم شۆفێرە سڕیت؟')) return;

    try {
        const res = await fetch(API + '/drivers/' + driverId, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showNotif('شۆفێری سڕاوەتەوە', 'success');
            loadDrivers();
        } else {
            showNotif(data.message || 'خرادی لە سڕینەوە', 'error');
        }
    } catch (err) {
        console.error('Error:', err);
        showNotif('خرادی سیستم', 'error');
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
    loadDrivers();
});