var red = "#D32E21";
var green = "#7ED321";

var onText = "Scanner On";
var offText = "Scanner Off";

console.log("bleh");
// Initialize button to whatever value it was left at last (in background.js)
chrome.runtime.sendMessage({action: "get", value: "scannerOn"}, function(scannerStat) {
  var scanBtn = $("#on-off_btn");
  // console.log(scanBtn.css("background"));
  // console.log("scannerStat: " + scannerStat);
  setButton(scannerStat);


  // Change color on click
  $("#on-off_btn").click(function() {
    console.log("Switching status!");
    chrome.runtime.sendMessage({action: "get", value: "scannerOn"}, function(scannerStat) {
      chrome.runtime.sendMessage({action: "set", data: !scannerStat})
      setButton(!scannerStat);
      // chrome.runtime.sendMessage({action: "set", data: scannerOn})

    });
  });
});

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   console.log("message recieved: " + request.action + "-->" + request.value);
//   if(request.action === "set") {
//     var scannerOn;
//     // var statusBtnRef =
//     if(request.value === "icon_on") {
//       $("#on-off_btn").css("background", green);
//       $("#on-off_btn").text(onText);
//     } else if (request.value === "icon_off") {
//       $("#on-off_btn").css("background", red);
//       $("#on-off_btn").text(offText);
//     }
//   }
//
// });

function setButton(buttonVal) {
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
chrome.runtime.sendMessage({action: "get", value: "email"}, function(email) {
  $('#email_addr').text(email);
});

// Set the first date in the popup
chrome.runtime.sendMessage({action: "get", value: "date_joined"}, function(date) {
  $('#first_date').text(date);
});

// Upload all history on click
$("#log_history_btn").click(function() {
  chrome.runtime.sendMessage({action: "upload_history"});
});
