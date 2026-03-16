const fs = require('fs');

// Add receipt script to new-trip.html
var html = fs.readFileSync('frontend/pages/new-trip.html', 'utf8');
html = html.replace(
    '<script src="../js/new-trip.js"></script>',
    '<script src="../js/receipt.js"></script><script src="../js/new-trip.js"></script>'
);
fs.writeFileSync('frontend/pages/new-trip.html', html, 'utf8');

// Add print function to new-trip.js
var js = fs.readFileSync('frontend/js/new-trip.js', 'utf8');
js += '\nasync function printCurrentReceipt(){if(!tripId){alert("No active trip!");return;}var res=await fetch("http://localhost:3000/api/trips/"+tripId);var data=await res.json();if(data.success){printReceipt(data.data,passengers);}}';
fs.writeFileSync('frontend/js/new-trip.js', js, 'utf8');

console.log('RECEIPT ADDED!');
