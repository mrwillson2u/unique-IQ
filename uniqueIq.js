var ref = new Firebase("https://unique-iq.firebaseio.com");

// var userInfo;
var currentIcon = "icon_off.png";
// Initialize icon to off state
chrome.browserAction.setIcon({path: currentIcon});

chrome.identity.getProfileUserInfo(function(userInfo) {
  if(!userInfo.id) {
    console.log('user logged out!');
  } else {
        console.log("USER INFO: " + userInfo.id);
        httpPOSTAsync("http://unique-server.herokuapp.com", userInfo.id, function(response) {

        ref.authWithCustomToken(response, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            console.log("Login Succeeded!", authData);
            authData.email = userInfo.email
            loggedIn(authData);
          }
        });

      });
  }
});

function loggedIn(userInfo) {


    console.log('user logged in!');
    console.log(userInfo);
    // userInfo = userInfo;

    // Previously the database didnt have the "scanner_status" parameter, so we want to update all the original users who dont have it
    // The next four lines can be removed once all profiles have been updated

    ref.child('users/' + userInfo.uid).once("value", function(userSnap) {
      // If user isnt already in the database, add it
      if(userSnap.val() === null){
        console.log("Adding new user: " + userInfo.email);
        ref.child('users/' + userInfo.uid).update({scanner_status: true});
        // Get the date and convert it to a string
        var theDate = new Date();
        var dateString = theDate.getUTCDate() + "-" + theDate.getUTCMonth() +  "-" + theDate.getUTCFullYear();
        ref.child('users/' + userInfo.uid).update({date_joined: dateString, scanner_status: true});
        updateIcon(true);
      }
      // Previously the database didnt have the "scanner_status"or "date_joined" parameters, so we want to update all the original users who dont have it
      else {
        ref.child('users/' + userInfo.uid + '/scanner_status').once("value", function(statusSnap) {
          console.log("statusSnap.val(): " + statusSnap.val());
          if(statusSnap.val() === null) {
            console.log("updating profile status");
            ref.child('users/' + userInfo.uid).update({scanner_status: true});
            // updateIcon(true);
          }
          updateIcon(statusSnap.val()); // Initialize scanner status icon to current state
        });

        ref.child('users/' + userInfo.uid + '/date_joined').once("value", function(dateSnap) {
          console.log("dateSnap: " + dateSnap.val());
          if(dateSnap.val() === null) {
            console.log("updating profile date");
            var theDate = new Date();
            var dateString = theDate.getUTCDate() + "-" + theDate.getUTCMonth() +  "-" + theDate.getUTCFullYear();
            ref.child('users/' + userInfo.uid).update({date_joined: dateString});
          }
        });

        // If the user is added and up to date, update the users scanner status icon

      }
    });

    // updateIcon();

    ref.child('users/' + userInfo.uid).orderByKey().equalTo("scanner_status").on("child_changed", function(statusSnap) {
      updateIcon(statusSnap.val());
    });


    // Listen for messages from popup.js
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

      if(request.action === "get") {
        if(request.name === "scannner_status") {
          ref.child('users/' + userInfo.uid + '/scanner_status').once("value", function(statusSnap) {
            sendResponse(statusSnap.val());
          });
        } else if(request.name === "email") {
            console.log("Email: " + userInfo.email);
          if (userInfo.email) {
            sendResponse(userInfo.email);
          } else {
            sendResponse("Not logged in");
          }
        } else if(request.name === "date_joined") {
          ref.child('users/' + userInfo.uid + "/date_joined").on("value", function(date) {
            if (date.val()) {
                sendResponse(date.val());
              } else {
                sendResponse("Unknown");
            }
          })
        } else if(request.name === "userInfo") {
          sendResponse(userInfo);
        }

      } else if (request.action === "set"){
        if(request.name === "scanner_status") {
          ref.child('users/' + userInfo.uid).update({scanner_status: request.value});
        }

      }
      else if(request.action === "upload_history") {
        console.log("Uplading all history.");
        getAllHistory();
      } else if(request.action === "switch_status") {
        switchStatus();
      }
    });




  function switchStatus() {
    ref.child('users/' + userInfo.uid + '/scanner_status').once("value", function(statusSnap) {
      console.log("changing to: " + !statusSnap.val());
      ref.child('users/' + userInfo.uid).update({scanner_status: !statusSnap.val()});
    });
  }

  // Updates the icon when the user turns it on or off
  function updateIcon(status) {
    if (status === true){
      currentIcon = "icon_on.png";
      // Turn listener on
      chrome.history.onVisited.addListener(updateLink);
    } else {
      currentIcon = "icon_off.png";
      // Turn listener off
      chrome.history.onVisited.removeListener(updateLink);
    }

    chrome.browserAction.setIcon({path: currentIcon});
    chrome.runtime.sendMessage({action: "set", name: "scanner_status", value: status});

  } // END switchStatus


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
  } // END getAllHistory


  // Updates the new page visited to database
  function updateLink(historyItem) {
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
  } // END getHistory


  // function renderStatus(statusText) {
    //document.getElementById('status').textContent = statusText;




  function uploadData(data) {

    // Check if the user already is logged on the server, and if not create it, then enter the data
    var userRef = ref.child('users/' + userInfo.uid);

    userRef.once('value', function(snapshot) {

      // if(!snapshot.exists()) {
      //   console.log('New User!');
      //   for(i in data) {
      //
      //     // Get the date and convert it to a string
      //     var theDate = new Date();
      //     var dateString = theDate.getUTCDate() + "-" + theDate.getUTCMonth() +  "-" + theDate.getUTCFullYear();
      //     ref.child('users').child(userInfo.uid).push({URL: data[i], date_joined: dateString, Processed: 'no', scan_status: true});
      //
      //   }
      // } else {
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
               ref.child('users').child(userInfo.uid + '/URLS').push({URL: data[i], Processed: 'no'});
            }
          }
        // }
          // If it doesnt already exist, lets push it to Firebase
          console.log("Data Uploaded!");

    });
  } // END uploadData



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

  } // END getCurrentTabTitle
}

function httpPOSTAsync(theUrl, uid, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback(xmlHttp.responseText);
    }
  }
  xmlHttp.open("POST", theUrl, true); // true for asynchronous
  xmlHttp.send(uid);
  console.log("Sending XMLHttpRequest");
} // END httpGetAsync
