

var ref = new Firebase("https://unique-iq.firebaseio.com");

var authData;
var scannerOn = true;
var currentIcon = "icon_on.png";

chrome.history.onVisited.addListener(updateLink);

// Set icon to initial state
chrome.browserAction.setIcon({path: currentIcon});

chrome.identity.getProfileUserInfo(function(userInfo) {
  if(!userInfo.id) {
    console.log('user logged out!');
  }
  console.log('user logged in!');
  console.log(userInfo);
  authData = userInfo;
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("scanner: " + request.action);

  if(request.action === "get") {

    if(request.value === "scannerOn") {
      sendResponse(scannerOn);
    } else if(request.value === "email") {
        console.log("Email: " + authData.email);
      if (authData.email) {
        sendResponse(authData.email);
      } else {
        sendResponse("Not logged in");
      }
    } else if(request.value === "first_date") {

        sendResponse("Unknown");

    }

  } else if (request.action === "set"){
    scannerOn = request.data;
    if(scannerOn === false){
      currentIcon = "icon_off.png";
      // Turn listener off
      chrome.history.onVisited.removeListener(updateLink);
    } else {
      currentIcon = "icon_on.png";
      // Turn listener on
      chrome.history.onVisited.addListener(updateLink);
    }
    chrome.browserAction.setIcon({path: currentIcon});
  }
  else if(request.action === "upload_history") {
    console.log("Uplading all history.");
    getAllHistory();
  }
});

// Updates the icon when the user turns it on or off
function updateIcon() {

  if (currentIcon === "icon_on.png") {
    currentIcon = "icon_off.png";
    // Turn listener off
    chrome.history.onVisited.removeListener(updateLink);

  } else {
    currentIcon = "icon_on.png";
    // Turn listener on
    chrome.history.onVisited.addListener(updateLink);

  }
    chrome.browserAction.setIcon({path: currentIcon});

}


// Collects all URLS in the history and logs them to the database
function getAllHistory() {
  ref.once("value", function(snapshot) {
    if(!snapshot.child('users').exists()) {
       users = ref.child('users');
       auth = ref.getAuth();

       getHistory(function(history) {

       }, function(errorMessage) {
         renderStatus('Huston, we have a problem.');
       });
    }
  });
}


// Updates the new page visited to database
function updateLink(historyItem) {
  console.log("Uploading...");
  uploadData([historyItem.url]);
}


function getHistory(callback) {

  chrome.history.search({text: "", maxResults: 1000}, function(data) {
    var result = [];
    console.log(data.length);

    var urls = [];

    for(i = 0; i < data.length; i++) {
      var page = data[i];
      urls.push(page.url);

      };

    uploadData(urls);
  });
};

function renderStatus(statusText) {
  //document.getElementById('status').textContent = statusText;

}

function uploadData(data) {

  // Check if the user already is logged on the server, and if not create it, then enter the data
  var userRef = ref.child('users/' + authData.id);
  userRef.once('value', function(snapshot) {

    if(!snapshot.exists()) {
      console.log('New User!');
      for(i in data) {
        ref.child('users').child(authData.id + '/URLS').push({URL: data[i], Processed: 'no'});


      }
    } else {

        var exists = false;
        for(i in data) {
          snapshot.child('URLS').forEach(function(value) {
            // If it is found..
              if(value.val().URL === data[i]) {
                exists = true;
                console.log(data[i] + '  -- already exists!');
                return true;
              }
          });
          // If this url hasnt beeen logged already, a=log it to Firebase
          if(!exists) {
            console.log('Adding to existing user: ' + data[i]);
             ref.child('users').child(authData.id + '/URLS').push({URL: data[i], Processed: 'no'});
          }
        }
      }
        // If it doesnt already exist, lets push it to Firebase
        console.log("Data Uploaded!");

  });
}






/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabTitle(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query


  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;
    var title = tab.title;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(title);
  });

}
