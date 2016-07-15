(function() {
  'use strict';

  var later = require('later');
  var config = require('config');
  var request = require('request');
  var firebase = require("firebase");
  var rp = require('request-promise');
  var handlebars = require('handlebars');
  var htmlparser = require("htmlparser2");

  var urlToPing = config.get('urlToPing');

  var loadStats = {},
    externalUrls = [];

  var queue = [];

  function printLoadStats() {
    for (var prop in loadStats) {
      if (loadStats.hasOwnProperty(prop)) {
        console.log(prop + ': ' + loadStats[prop].start + ', ' + loadStats[prop].end + ', ' + loadStats[prop].completed);
      }
    }
  }

  function execNext() {
    var task = queue[0];
    var start = new Date().getTime();
    rp(task).then(function(res) {
      queue.shift();

      var end = new Date().getTime();

      loadStats[task.uri] = {
        start: start,
        end: end,
        completed: end - start
      };

      if (queue.length > 0) {
        execNext();
      } else {
        printLoadStats();
      }
    }, function(err) {
      queue.shift();

      console.log('Error: ' + task.uri + ' ' + err);

      if (queue.length > 0) {
        execNext();
      } else {
        printLoadStats();
      }
    });
  }

  var parser = new htmlparser.Parser({
    onopentag: function(tag, attrs) {
      var link;
      if (tag === 'script')
        link = attrs.src;
      else if (tag === 'link' && attrs.rel === 'stylesheet')
        link = attrs.href;
      if (typeof link !== 'undefined') {
        externalUrls.push(link);
      }
    },
    onend: function() {
      if (externalUrls.length > 0) {
        for (var i = 0; i < externalUrls.length; i++) {
          var urlToCheck = externalUrls[i];
          if (!(urlToCheck.indexOf('//') === 0 || urlToCheck.indexOf('http') === 0)) {
            urlToCheck = urlToPing + urlToCheck;
          } else if (urlToCheck.indexOf('//') === 0) {
            urlToCheck = 'http:' + urlToCheck;
          }
          queue.push({
            method: 'GET',
            uri: urlToCheck
          });
          if (queue.length === 1) {
            execNext();
          }
        }
      }
    }
  }, {
    lowerCaseTags: true,
    decodeEntities: true,
    lowerCaseAttributeNames: true
  });

  function pingUrl(url) {
    var startFirstPing = new Date().getTime();
    request.get(url, function(err, httpResponse, body) {
      if (err !== null) {
        return;
      }
      var endFirstPing = new Date().getTime();
      var completed = endFirstPing - startFirstPing;
      loadStats[urlToPing] = {
        start: startFirstPing,
        end: endFirstPing,
        completed: completed
      };
      parser.write(body);
      parser.end();
    });
  }

  // Initialize the app with a service account, granting admin privileges
  firebase.initializeApp(config.get('firebaseConfig'));

  var host = config.get('hostConf');

  // As an admin, the app has access to read and write all data, regardless of Security Rules
  var db = firebase.database();
  var ref = db.ref('ping-url/hosts');
  var aliveRef = ref.child('alive');
  aliveRef.push().set({
    ip: host.ip,
    hostName: host.name,
    date: new Date()
  });

  aliveRef.on('value', function(snapshot) {
    console.log(snapshot.val());
    aliveRef.off();
  }, function(errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });

  /*
  var count = 4;
  var sched = later.parse.text(config.get('interval'));
  var timer = later.setInterval(function () {
    pingUrl(urlToPing);
    
    count -= 1;
    if (count < 0) {
      timer.clear();
    }
  }, sched);
  */
}());