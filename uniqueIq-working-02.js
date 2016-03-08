// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var ref = new Firebase("https://unique-iq.firebaseio.com");


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



  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}
//
// function corsRequest(method, url) {
//   var xhr = new XMLHttpRequest();
//
//   // if("WithCredentials" in xhr) {
//   xhr.open(method, url, true);
//   // } else if(typeof XDomainRequesst != "undefined") {
//   //   xhr = new XDomainRequesst();
//   //   xhr.open(method, url);
//   // } else {
//   //   xhr = null;
//   // }
//   return xhr;
// }
//
//
//
// // Get all of the valuable content from the page
// function parsePage(pageHtml) {
//   var searchTags = ['title', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
//   var importantText = [];
//
//   for(i in searchTags) {
//     var newText = $(pageHtml).find(searchTags[i]).text();
//     importantText.push(newText);
//   }
//   //importantText = $(pageHtml).find(searchTags[1]).text()
//
//   // console.log("here: " + importantText);
//   var parsed = [];
//   for(i in importantText) {
//     var result = parseText(importantText[i]);
//     parsed = parsed.concat(result);
//
//   }
//   console.log(parsed);
//   // for(i in parsed) {
//   //  result.push({word: parsed[i]});
//   // }
//
//   var output = "";
//   for(i in parsed) {
//    parsed[i] = parsed[i].toLowerCase();
//    //output += parsed[i] + " ";
//   }
//
//   processResults(parsed);
// }
//

function getHistory(callback) {

  chrome.history.search({text: "", maxResults: 1000}, function(data) {
    var result = [];
    console.log(data.length);
    var totalCount = 0;

    for(i in data) {
      totalCount += data[i].visitCount;
    }

    console.log("Enties: " + data.length + "   totalCount: " + totalCount);

    var urls = [];

    for(i = 0; i < data.length; i++) {
      var page = data[i];

        urls.push(page.url);
        // console.log("Url2: " + page.url);
      };

      //  console.log("Url2: ");
      //   console.log(urls);
      uploadData(urls);

  });


};
//
// function processResults(input) {
//   var rank = [];
//   var wordList = [];
//
//   for(i in input) {
//     var word = input[i];
//     var duplicate = false;
//
//     // Check for duplicates
//     for (j in rank){
//
//       if(rank[j].word === word){
//         duplicate = true;
//         rank[j].count ++;
//       }
//     }
//
//     // If no duplicate found
//     if(!duplicate){
//       // New word
//       rank.push({word: word, count: 1});
//     }
//   }
//
//   for(var i = 0; i < rank.length; i++) {
//     var j = 0;
//     var temp = rank[i];
//     rank.splice(i, 1);
//
//     while(temp.count < rank[j].count && j < rank.length) {
//       j++;
//     }
//     rank.splice(j, 0, temp);
//   }
//
//   uploadData(rank);
//
//   var output = "";
//
//
//   for(i in rank) {
//     if(rank[i].count >= 1) {
//       output += rank[i].word + ": " + rank[i].count + " ; ";
//     }
//   }
//
//   return(output);
// }
//
// Displays text in the extention popup
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
  //console.log(statusText);


//
}

function uploadData(data) {
  var auth = ref.getAuth();

  // Check if the user already is logged on the server, and if not create it, then enter the data
  var userRef = ref.child('users/' + auth.uid);
  userRef.once('value', function(snapshot) {

    if(!snapshot.exists()) {
      console.log('New User!');
      for(i in data) {
        ref.child('users').child(auth.uid + '/URLS').push({URL: data[i], Processed: false});


      }
    } else {

      // ref.child('users').child(auth.uid + '/URLS')
      // check to see if everything is already logged
      // console.log('key: ' + snapshot.child('URLS').orderByValue().equalTo());

        var exists = false;
        for(i in data) {
          snapshot.child('URLS').forEach(function(value) {
            // If it is found..
            // console.log('Checking: ' + value.val().URL);
              if(value.val().URL === data[i]) {
                exists = true;
                console.log(data[i] + '  -- already exists!');
                return true;
              }
          });


          // If this url hasnt beeen logged already, a=log it to Firebase
          if(!exists) {
            console.log('Adding to existing user: ' + data[i]);
             ref.child('users').child(auth.uid + '/URLS').push({URL: data[i], Processed: false});
          }
        }
      }
        // If it doesnt already exist, lets push it to Firebase

        renderStatus("Data uploaded!");
        // chrome.tabs.create({url:'http://www.botnic.cc'});
        // history.back();
      // }

  });
}


// Fires as soon as all the content has loaded
document.addEventListener('DOMContentLoaded', function() {
  var ref = new Firebase("https://unique-iq.firebaseio.com");
  //ref.onAuth(authDataCallback);


  var authData = ref.getAuth();
  if (authData) {
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
  } else {
    console.log("User is logged out. Logging in now!");

    ref.authAnonymously(function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
      }
    });

  }

  ref.once("value", function(snapshot) {
    if(!snapshot.child('users').exists()) {
       var users = ref.child('users');
       var auth = ref.getAuth();
       //users.push({user: auth.uid});
    }
  });

  getHistory(function(history) {

  }, function(errorMessage) {
    renderStatus('Huston, we have a problem.');
  });
});
//
// function parseText(input) {
//   // Note the \ at the end of the first line
//   var words = new Lexer().lex(input);
//   var taggedWords = new POSTagger().tag(words);
//   var result = new Array();
//   // renderStatus(input);
//   for (i in taggedWords) {
//     var taggedWord = taggedWords[i];
//     var word = taggedWord[0];
//     var tag = taggedWord[1];
//     // Note the use of document.writeln instead of print
//     if(tag === "NN" || tag === "NNP" || tag === "NNPS" || tag === "NNS" ) {
//       result.push(word);
//       //renderStatus(word);
//     }
//   }
//   return result;
// }
