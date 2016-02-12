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

function getHistory(callback) {

  chrome.history.search({text: '', maxResults: 100000}, function(data) {
    var result = [];
      data.forEach(function(page) {

        //result += (page.title + "<br/>");
        // renderStatus(page.title);
         var parsed = parseText(page.title);
         for(i in parsed) {
          result.push(parsed[i]);
         }
      });
      var output = "";
      for(i in result) {
        result[i] = result[i].toLowerCase();
        output += result[i] + " ";
      }
      //renderStatus(output);
      processResults(result);
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


// var out = 0;
  for(var i = 0; i < rank.length; i++) {
    var j = 0;
    var temp = rank[i];
    rank.splice(i, 1);


    while(temp.count < rank[j].count && j < rank.length) {

      j++;
    }

    rank.splice(j, 0, temp);


  }
//renderStatus("hello");
  var output = "";
  //rank[0] = {wordlist[0]: rank[wordlist[i]]};


  // for(i = 1 in wordList) {
  //   var index = rank[wordlist[i]];
  //
  //   while(j = i < rank.length) {
  //     if(index > rank[wordlist[j]]) {
  //       rank["ranking"] = rank[wordlist[j]];
  //     } else if (j === rank.length - 1) {
  //       //rank.push(index);
  //     }
  //     j++;
  //   }
  // }



  for(i in rank) {
    if(rank[i].count >= 30) {
    output += rank[i].word + ": " + rank[i].count + " ; ";
  }
  }
  renderStatus(output);
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;

}

document.addEventListener('DOMContentLoaded', function() {
  var ref = new Firebase("https://unique-iq.firebaseio.com");




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

//
// document.addEventListener('DOMContentLoaded', function() {
//
//   getCurrentTabTitle(function(title) {
//     // Put the image URL in Google search.
//     renderStatus('Getting Info...');
//     console.log(title);
//
//     // Note the \ at the end of the first line
//     var words = new Lexer().lex(title);
//     var taggedWords = new POSTagger().tag(words);
//     var result = "";
//     for (i in taggedWords) {
//       var taggedWord = taggedWords[i];
//       var word = taggedWord[0];
//       var tag = taggedWord[1];
//       // Note the use of document.writeln instead of print
//       result += (word + " /" + tag + "<br/>");
//     }
//     renderStatus(result);
//     //console.log(result);
//     // document.getElementById("tagged_text").innerHTML = result;
//
//
//   }, function(errorMessage) {
//     renderStatus('Huston, we have a problem.');
//   });
// });
