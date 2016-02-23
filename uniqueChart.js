document.addEventListener('DOMContentLoaded', function() {
// var randomScalingFactor = function(){ return Math.round(Math.random()*100)};
// var randomColorFactor = function(){ return Math.round(Math.random()*255)};


var candidates = [];

d3.csv("/BarGraph/data/candidates.csv", function(data) {

  for(i in data) {
    candidates[i] = data[i];

    //console.log(candidates[i]);
  }

});

var barChartData = {
  labels : ["Jeb Bush","Ben Carson","Chris Christie","Ted Cruiz","Carly Fiorina","John Kasch","Marco Rubio", "Donald Trump"],
  datasets : [
    // {
    // 	fillColor : "rgba(51,51,102,0.5)",
    // 	strokeColor : "rgba(51,51,102,0.8)",
    // 	highlightFill: "rgba(220,220,220,0.75)",
    // 	highlightStroke: "rgba(220,220,220,1)",
    // 	data : [155.6, 64.2, 26.7, 89.9, 24.4, 22.9, 77.2, 19.4]
    // },
    {
      fillColor : "rgba(0,51,102,0.5)",
      strokeColor : "rgba(0,51,102,0.8)",
      highlightFill: "rgba(0,51,102,0.3)",
      highlightStroke: "rgba(0,51,102,0.6)",
      data : [31.9, 54, 7.2, 47.1, 11.3, 7.6, 29.7, 19.4]
    },
    {
      fillColor : "rgba(204,204,51,0.5)",
      strokeColor : "rgba(204,204,51,0.8)",
      highlightFill: "rgba(204,204,51,0.3)",
      highlightStroke: "rgba(204,204,51,0.6)",
      data : [123.7, 10.1, 19.5, 42.8, 13, 3.6, 31.7, 0]
    },
    // {
    // 	fillColor : "rgba(255,102,51,0.5)",
    // 	strokeColor : "rgba(255,102,51,0.8)",
    // 	highlightFill: "rgba(255,102,51,0.3)",
    // 	highlightStroke: "rgba(255,102,51,0.6)",
    // 	data : [24.3, 47.5, 6, 28.4, 6.9, 5, 22.6, 12.4]
    // }
  ]
};



function topicStats(topic) {
  var pro = [];
  var mixed = [];
  var against = [];

  // Sort candidates by issue stance
  for(i in candidates) {
    if (candidates[i][topic] === "Pro") {
      pro.push(candidates[i]);
    } else if (candidates[i][topic] === "Mixed") {
      mixed.push(candidates[i]);
    } else if (candidates[i][topic] === "Against") {
      against.push(candidates[i]);
    }
  }

  sortCandidates(pro);
  sortCandidates(mixed);
  sortCandidates(against);

  var allCandidates = pro.concat(mixed, against);

  //for(var i = 0; i < 2; i++) {
  // barChartData.datasets[0].data = [];
  // barChartData.datasets[1].data = [];
  var redC = "rgba(175,0,0,1)";
  var redD = "rgba(175,0,0,0.8)";
  var yellowC = "rgba(175,175,0,1)";
  var yellowD = "rgba(175,175,0,0.8)";
  var greenC = "rgba(0,175,0,1)";
  var greenD = "rgba(0,175,0,0.8)";

    for(j in allCandidates) {

      var fillC = "";
      var fillD = "";
      //Calulate Color
      if(allCandidates[j][topic] === "Pro") {
        fillC = greenC;
        fillD = greenD;
      } else if (allCandidates[j][topic] === "Mixed") {
        fillC = yellowC;
        fillD = yellowD;
      } else {
        fillC = redC;
        fillD = redD;
      }

      barChartData.labels[j] = allCandidates[j].Name;
      window.myBar.datasets[0].bars[j].label = allCandidates[j].Name + ": " + allCandidates[j][topic];
      window.myBar.datasets[0].bars[j].value = allCandidates[j].Candidate_Raised;

      window.myBar.datasets[0].bars[j].fillColor = fillC;
      window.myBar.datasets[0].bars[j].strokeColor = fillC;
      window.myBar.datasets[0].bars[j].highlightFill = fillD;
      window.myBar.datasets[0].bars[j].highlightStroke = fillD;

      window.myBar.datasets[1].bars[j].label = allCandidates[j].Name + ": " + allCandidates[j][topic];
      window.myBar.datasets[1].bars[j].value = allCandidates[j].Super_Pacs;

      window.myBar.datasets[1].bars[j].fillColor = fillC;
      window.myBar.datasets[1].bars[j].strokeColor = fillC;
      window.myBar.datasets[1].bars[j].highlightFill = fillD;
      window.myBar.datasets[1].bars[j].highlightStroke = fillD;


      console.log(	barChartData.datasets);

    }
    myBar.update();
    //barChartData.datasets[2] = [];
  //}


};

// var data = Csonv.fetch("https://docs.google.com/spreadsheets/d/1yw1QFFzr_w7-miDziizzSIeAM9I9yorhRp6ixgfiRj4/pub?output=csv");

/**
* Make a X-Domain request to url and callback.
*
* @param url {String}
* @param method {String} HTTP verb ('GET', 'POST', 'DELETE', etc.)
* @param data {String} request body
* @param callback {Function} to callback on completion
* @param errback {Function} to callback on error
*/


function xdr(url, method, data, callback, errback) {
  var req;

  if(XMLHttpRequest) {
      req = new XMLHttpRequest();

      if('withCredentials' in req) {
          req.open(method, url, true);
          req.open('POST', 'http://api.foo.com/products', true);
          req.setRequestHeader('Content-Type', 'application/json');
          req.setRequestHeader('Api-Key', 'foobar');

          req.onreadystatechange = handleResponse;
          req.onerror = errback;
          req.onreadystatechange = function() {
              if (req.readyState === 4) {
                  if (req.status >= 200 && req.status < 400) {
                      callback(req.responseText);
                  } else {
                      errback(new Error('Response returned with non-OK status'));
                  }
              }
          };
          req.send(data);
      }
  } else if(XDomainRequest) {
      req = new XDomainRequest();
      req.open(method, url);
      req.onerror = errback;
      req.onload = function() {
          callback(req.responseText);
      };
      req.send(data);
  } else {
      errback(new Error('CORS not supported'));
  }
}


var dataFile = "";

function parseCSV(dataFile) {
  console.log(dataFile);
}

function badReq() {
  alert("csv could not be aquired!")
}

window.onload = function(){
  xdr("https://docs.google.com/spreadsheets/d/1yw1QFFzr_w7-miDziizzSIeAM9I9yorhRp6ixgfiRj4/pub?output=csv", 'GET', dataFile, badReq);
  var ctx = document.getElementById("canvas").getContext("2d");
  window.myBar = new Chart(ctx).StackedBar(barChartData, {
    responsive : true
    //String - A legend template
//  legendTemplate : '<ul>'
//                 +'<% for (var i=0; i<datasets.length; i++) { %>'
//                   +'<li>'
//                   +'<span style=\"background-color:<%=datasets[i].lineColor%>\"></span>'
//                   +'<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>'
//                 +'</li>'
//               +'<% } %>'
//             +'</ul>'
  });

// 	//then you just need to generate the legend
// var legend = myBar.generateLegend();
//
// //and append it to your page somewhere
// $('#chart').append(legend);
// legend(document.getElementById("barLegend"), barChartData);
};

  // Sort from high to low
  function sortCandidates(input) {
    for(i in input) {
      var j = 0;
      var temp = input[i];
      input.splice(i, 1);


      while(j < input.length && temp.Raised_Overall < input[j].Raised_Overall) {
        //console.log("input[j].Raised_Overall: " + input[j].Raised_Overall + "		j: " + j + "		input.length: " + input.length);
        j++;
      }


      input.splice(j, 0, temp);

    }

    // for(i in input) {
    //
    // 	console.log(input[i]);
    // }
  }
});
