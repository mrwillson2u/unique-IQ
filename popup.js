
var red = "#D32E21";
var green = "#7ED321";

var onText = "Scanner On";
var offText = "Scanner Off";

var currentStatus = false;

// Initialize button to whatever value it was left at last (in background.js)

// chrome.runtime.sendMessage({action: "get", data: "userInfo"}, function(userInfo) {
chrome.runtime.sendMessage({action: "get", name: "scannner_status"}, function(scannerStat) {
  // console.log(scanBtn.css("background"));
  console.log("scannerStat: " + scannerStat);
  currentStatus = scannerStat;
  setButton(currentStatus);

  // ref.child('users/' + userInfo.id + '/scanner_status').on("child_changed", setButton(statusSnap));

  // Change color on click
  $("#on-off_btn").click(function() {
    console.log("Switching status!");

    // ref.child('users/' + userInfo.id + '/scsnner_status').once("value", function(scannerStat) {
      // chrome.runtime.sendMessage({action: "set", data: !scannerStat})
      // ref.child('users').child(userInfo.id).update({scanner_status: !scannerStat.val()});
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
      //  var buttonRef =$("#on-off_btn");
      // if(request.value === "true") {
      //   buttonRef.css("background", green);
      //   buttonRef.text(onText);
      // } else if (request.value === "icon_off") {
      //   buttonRef.css("background", red);
      //   buttonRef.text(offText);
      // }
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
