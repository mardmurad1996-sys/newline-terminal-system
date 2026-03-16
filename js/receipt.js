function printReceipt(trip, passengers) {
  var rows = "";
  for(var i=1; i<=7; i++){
    var p = passengers[i-1] || {name:"", passport:"", nationality:""};
    rows += "<tr><td>"+i+"</td><td>"+p.name+"</td><td>"+p.passport+"</td><td>"+p.nationality+"</td></tr>";
  }
  var now = new Date();
  var timeStr = String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
  var dateStr = now.getFullYear()+"/"+String(now.getMonth()+1).padStart(2,"0")+"/"+String(now.getDate()).padStart(2,"0");
  var style = "<style>@page{size:A5;margin:10mm}body{font-family:Arial,sans-serif;direction:rtl;font-size:13px}.receipt{border:2px solid #000;padding:10px}.header{display:flex;justify-content:space-between;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:8px}.title{font-size:18px;font-weight:bold}.phone{background:#1a1a2e;color:white;padding:3px 8px;border-radius:4px;font-size:12px}.number{color:red;font-size:18px;font-weight:bold}.subtitle{background:#f59e0b;color:white;text-align:center;padding:6px;font-weight:bold;margin:8px 0;border-radius:4px}.info-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #ddd}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #000;padding:5px;text-align:center;font-size:12px}th{background:#1a1a2e;color:#ffd700}.footer{text-align:center;margin-top:8px;font-size:11px}.page-break{page-break-after:always}</style>";
  var card = "<div class=receipt>";
  card += "<div class=header><div><div class=title>دەروازەی نێودەوڵەتی حاجی ئۆمەران</div>";
  card += "<div>وێنەی بازگه &nbsp; تێرمینال &nbsp; <span class=number>ژمارە : "+trip.id+"</span></div></div>";
  card += "<div class=phone>0750 235 3448</div></div>";
  card += "<div class=subtitle>پسووڵەی دەرچوونی تاکسی بۆ ناو حاجی ئۆمەران</div>";
  card += "<div class=info-row><span>کات ( "+timeStr+" )</span><span>ڕێکەوت : "+dateStr+"</span></div>";
  card += "<div class=info-row>ناوی شۆفێر : "+trip.driver_name+"</div>";
  card += "<div class=info-row><span>ئۆتۆمبێلی ژمارە : "+trip.driver_car+"</span><span>ڕۆیشتنی بۆ : "+trip.route_to+"</span></div>";
  card += "<div class=info-row><span>ژ.م شۆفێر : "+trip.driver_phone+"</span><span>بڕی پارە : "+Number(trip.total_income).toLocaleString()+" IQD</span></div>";
  card += "<table><thead><tr><th>ژ</th><th>ناوی گەشتیار</th><th>ژ.پاسەپۆرت</th><th>وڵاتنامە</th></tr></thead><tbody>"+rows+"</tbody></table>";
  card += "<div class=footer>دەروازەی نێودەوڵەتی حاجی ئۆمەران - تێرمینال</div></div>";
  var w = window.open("", "_blank");
  w.document.write("<!DOCTYPE html><html><head><meta charset=UTF-8>"+style+"</head><body>"+card+"<div class=page-break></div>"+card+"</body></html>");
  w.document.close();
  setTimeout(function(){w.print();}, 800);
}