var red = "#ff0000";
var green = "#33cc33";

// Initialize button to whatever value it was left at last (in background.js)
chrome.runtime.sendMessage({action: "get"}, function(scannerStat) {
  var scanBtn = $("#on-off_btn");
  console.log(scanBtn.css("background"));
  if(scannerStat === false){
    scanBtn.css("background", red);
    scanBtn.text("Off");
  } else {
    scanBtn.css("background", green);
    scanBtn.text("On");
  }
});

// Change color on click
$("#on-off_btn").click(function() {
var that = this;
  chrome.runtime.sendMessage({action: "get"}, function(scannerStat) {
    console.log($(that).css("background"));
    if(scannerStat === false){
      $(that).css("background", green);
      $(that).text("On");
      scannerOn = true;
    } else {
        $(that).css("background", red);
        $(that).text("Off");
        scannerOn = false;
    }
    chrome.runtime.sendMessage({action: "set", data: scannerOn})

  });


});
