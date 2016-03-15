var red = "#D32E21";
var green = "#7ED321";

var onText = "Scanner On";
var offText = "Scanner Off";

// Initialize button to whatever value it was left at last (in background.js)
chrome.runtime.sendMessage({action: "get", value: "scannerOn"}, function(scannerStat) {
  var scanBtn = $("#on-off_btn");
  console.log(scanBtn.css("background"));
  if(scannerStat === false){
    scanBtn.css("background", red);
    scanBtn.text(offText);
  } else {
    scanBtn.css("background", green);
    scanBtn.text(onText);
  }
});

// Change color on click
$("#on-off_btn").click(function() {
var that = this;
  chrome.runtime.sendMessage({action: "get", value: "scannerOn"}, function(scannerStat) {
    console.log($(that).css("background"));
    if(scannerStat === false){
      $(that).css("background", green);
      $(that).text(onText);
      scannerOn = true;
    } else {
        $(that).css("background", red);
        $(that).text(offText);
        scannerOn = false;
    }
    chrome.runtime.sendMessage({action: "set", data: scannerOn})

  });


});

// Set the username in the popup
chrome.runtime.sendMessage({action: "get", value: "email"}, function(email) {
  $('#email_addr').text(email);
});

// Set the first date in the popup
chrome.runtime.sendMessage({action: "get", value: "first_date"}, function(date) {
  $('#email_addr').text(date);
});

// Upload all history on click
$("#log_history_btn").click(function() {
  chrome.runtime.sendMessage({action: "upload_history"});
});
