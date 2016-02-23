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

function corsRequest(method, url) {
  var xhr = new XMLHttpRequest();

  // if("WithCredentials" in xhr) {
  xhr.open(method, url, true);
  // } else if(typeof XDomainRequesst != "undefined") {
  //   xhr = new XDomainRequesst();
  //   xhr.open(method, url);
  // } else {
  //   xhr = null;
  // }
  return xhr;
}
// Create the XHR object.
// function createCORSRequest(method, url) {
//   url = url;
//   var xhr = new XMLHttpRequest();
//   console.log('blah');
//   if ("withCredentials" in xhr) {
//     // XHR for Chrome/Firefox/Opera/Safari.
//     xhr.open(method, url, true);
//   } else if (typeof XDomainRequest != "undefined") {
//     // XDomainRequest for IE.
//     xhr = new XDomainRequest();
//     xhr.open(method, url);
//   } else {
//     // CORS not supported.
//     xhr = null;
//
//   }
//   return xhr;
// }

function requesdUrl(url) {
  var xhr = corsRequest('GET', url);

  if(!xhr) {
    throw new Error('CORS not supported!');
  }

  xhr.onload = function() {
    var text = xhr.responseText;
    var title = getTitle(text);
    console.log('Response from CORS request to ' + url + ': ' + title);
    parsePage(text);
  }
  xhr.onerror = function() {
    console.log('Woops, there was an error making the request.');
  };

  xhr.setRequestHeader('Access-Control-Request_Meathod', 'GET');
  xhr.send();

}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

// Get all of the valuable content from the page
function parsePage(pageHtml) {
  var searchTags = ['title', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  var importantText = [];

  for(i in searchTags) {
    var newText = $(pageHtml).find(searchTags[i]).text();
    importantText.push(newText);
  }
  //importantText = $(pageHtml).find(searchTags[1]).text()

  // console.log("here: " + importantText);
  var parsed = [];
  for(i in importantText) {
    var result = parseText(importantText[i]);
    parsed = parsed.concat(result);

  }
console.log(parsed);
  // for(i in parsed) {
  //  result.push({word: parsed[i]});
  // }

  var output = "";
  for(i in parsed) {
   parsed[i] = parsed[i].toLowerCase();
   //output += parsed[i] + " ";
  }

  processResults(parsed);
}


function getHistory(callback) {

  chrome.history.search({text: "", maxResults: 1000}, function(data) {
    var result = [];
    console.log(data.length);
    var totalCount = 0;

    for(i in data) {
      totalCount += data[i].visitCount;
    }

    console.log("Enties: " + data.length + "   totalCount: " + totalCount);
    for(i = 0; i < 1; i++) {
      var page = data[i];
      //data.forEach(function(page) {
      // doit(data);

        // function doit(page) {
        var url = page.url;
        console.log("Url2: " + url);

        requesdUrl(page.url);
        // var xhr = new XMLHttpRequest();
        // xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
        // xhr.open("GET", chrome.extension.getURL(page.url), true);
        // xhr.send();

        // $.get(url, function(htmlPage) {
        //   console.log(htmlPage);
        // });


        //  var parsed = parseText(page.title);
        //  for(i in parsed) {
        //   result.push({word: parsed[i], count: page.visitCount, url: page.url});
        //  }
      };
      //
      // var output = "";
      // for(i in result) {
      //   result[i] = result[i].word.toLowerCase();
      //   output += result[i] + " ";
      // }

      //renderStatus(processResults(result));
  });


};

function processResults(input) {
  var rank = [];
  var wordList = [];

  for(i in input) {
    var word = input[i];
    var duplicate = false;

    // Check for duplicates
    for (j in rank){

      if(rank[j].word === word){
        duplicate = true;
        rank[j].count ++;
      }
    }

    // If no duplicate found
    if(!duplicate){
      // New word
      rank.push({word: word, count: 1});
    }
  }

  for(var i = 0; i < rank.length; i++) {
    var j = 0;
    var temp = rank[i];
    rank.splice(i, 1);

    while(temp.count < rank[j].count && j < rank.length) {
      j++;
    }
    rank.splice(j, 0, temp);
  }

  uploadData(rank);

  var output = "";


  for(i in rank) {
    if(rank[i].count >= 1) {
      output += rank[i].word + ": " + rank[i].count + " ; ";
    }
  }

  return(output);
}

// Displays text in the extention popup
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
  //console.log(statusText);


//
}

function uploadData(data) {
  var auth = ref.getAuth();

  // Check if the user already is logged on the server, and if not create it, then enter the data
  var userRef = ref.child('users').orderByValue().equalTo(auth.uid);
  userRef.once('value', function(snapshot) {

    if(!snapshot.exists()) {

      ref.child('users').set({[auth.uid]: {data: data}});

    } else {
      snapshot.ref().auth.uid.set({data: data});

   }
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

function parseText(input) {
  // Note the \ at the end of the first line
  var words = new Lexer().lex(input);
  var taggedWords = new POSTagger().tag(words);
  var result = new Array();
  // renderStatus(input);
  for (i in taggedWords) {
    var taggedWord = taggedWords[i];
    var word = taggedWord[0];
    var tag = taggedWord[1];
    // Note the use of document.writeln instead of print
    if(tag === "NN" || tag === "NNP" || tag === "NNPS" || tag === "NNS" ) {
      result.push(word);
      //renderStatus(word);
    }
  }
  return result;
}
