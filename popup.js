
var red = "#D32E21";
var green = "#7ED321";

var onText = "Scanner On";
var offText = "Scanner Off";

var currentStatus = false;

// Initialize button to whatever value it was left at last (in background.js)
chrome.runtime.sendMessage({action: "get", name: "scannner_status"}, function(scannerStat) {
  console.log("scannerStat: " + scannerStat);
  currentStatus = scannerStat;
  setButton(currentStatus);

  // Change color on click
  $("#on-off_btn").click(function() {
    console.log("Switching status!");

    chrome.runtime.sendMessage({action: "switch_status"});
    // });
  });
});
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("message recieved: " + request.action + "-->" + request.value);
  if(request.action === "set") {
    if(request.name === "scanner_status") {
      setButton(request.value);
    }
  }
});

function setButton(buttonVal) {
  console.log("buttonVal: " + buttonVal);
  var scanBtn = $("#on-off_btn");
  if(buttonVal === false){
    scanBtn.css("background", red);
    scanBtn.text(offText);
  } else {
    scanBtn.css("background", green);
    scanBtn.text(onText);
  }
}

// Set the username in the popup
chrome.runtime.sendMessage({action: "get", name: "email"}, function(email) {
  $('#email_addr').text(email);
});

// Set the first date in the popup
chrome.runtime.sendMessage({action: "get", name: "date_joined"}, function(date) {
  $('#first_date').text(date);
});

// Upload all history on click
$("#log_history_btn").click(function() {
  chrome.runtime.sendMessage({action: "upload_history"});
});
