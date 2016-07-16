(function() {
  'use strict';

  var later = require('later');
  var config = require('config');
  var request = require('request');
  var rp = require('request-promise');
  var handlebars = require('handlebars');
  var htmlparser = require("htmlparser2");

  function ParseHtml(urlFound, parseEnded) {
    this._parser = new htmlparser.Parser({
      onopentag: function(tag, attrs) {
        var link;
        if (tag === 'script')
          link = attrs.src;
        else if (tag === 'link' && attrs.rel === 'stylesheet')
          link = attrs.href;
        if (typeof link !== 'undefined') {
          urlFound(link);
        }
      },
      onend: function() {
        parseEnded();
      }
    }, {
      lowerCaseTags: true,
      decodeEntities: true,
      lowerCaseAttributeNames: true
    });

    this.do = function(chunk) {
      this._parser.write(chunk);
      this._parser.end();
    };
  }

  function PingQueue(taskEnded, queueEnded) {
    this._queue = [];
    this._taskEnded = taskEnded;
    this._queueEnded = queueEnded;

    this.push = function(conf) {
      this._queue.push(conf);
    };

    this.getLength = function() {
      return this._queue.length;
    };
  }

  PingQueue.prototype.execNext = function() {
    var _this = this;

    var task = _this._queue[0];
    var start = new Date().getTime();

    rp(task).then(function(res) {
      _this._queue.shift();

      var end = new Date().getTime();

      _this._taskEnded(task.uri, start, end);

      if (_this._queue.length > 0) {
        _this.execNext.apply(_this);
      } else {
        _this._queueEnded();
      }
    }, function(err) {
      _this._queue.shift();

      console.log('Error: ' + task.uri + ' ' + err);

      if (_this._queue.length > 0) {
        _this.execNext.apply(_this);
      } else {
        _this._queueEnded();
      }
    });
  }

  function Ping(conf) {
    this._conf = conf;
  }
  Ping.prototype.do = function() {
    var externalUrls = [];
    var loadStats = {};
    var conf = this._conf;
    var startFirstPing = new Date().getTime();

    var pingQueue = new PingQueue(function(url, start, end) {
      var completed = end - start;
      loadStats[url] = {
        start: start,
        end: end,
        completed: completed
      };
    }, function() {
      console.log('\n\n');
      for (var prop in loadStats) {
        if (loadStats.hasOwnProperty(prop)) {
          console.log(prop + ': ' + loadStats[prop].start + ', ' + loadStats[prop].end + ', ' + loadStats[prop].completed);
        }
      }
    });

    request.get(conf.url, function(err, httpResponse, body) {
      if (err !== null) {
        return;
      }

      var endFirstPing = new Date().getTime();
      var completed = endFirstPing - startFirstPing;
      loadStats[conf.url] = {
        start: startFirstPing,
        end: endFirstPing,
        completed: completed
      };

      new ParseHtml(function(url) {
        externalUrls.push(url);
      }, function() {
        if (externalUrls.length > 0) {
          for (var i = 0; i < externalUrls.length; i++) {
            var urlToCheck = externalUrls[i];
            if (!(urlToCheck.indexOf('//') === 0 || urlToCheck.indexOf('http') === 0)) {
              if (urlToCheck.indexOf('/') !== 0) {
                urlToCheck = '/' + urlToCheck;
              }
              urlToCheck = conf.url + urlToCheck;
            } else if (urlToCheck.indexOf('//') === 0) {
              urlToCheck = 'http:' + urlToCheck;
            }
            pingQueue.push({
              method: 'GET',
              uri: urlToCheck
            });
            if (pingQueue.getLength() === 1) {
              pingQueue.execNext.apply(pingQueue);
            }
          }
        }
      }).do(body);
    });
  };
  Ping.prototype.schedule = function() {
    new Ping(this._conf).do();
    /*
    var count = 4;
    var sched = later.parse[this.conf.intervalFormat](this.conf.interval);
    var timer = later.setInterval(function() {
      pingUrl(urlToPing);

      count -= 1;
      if (count < 0) {
        timer.clear();
      }
    }, sched);*/
  };

  var urlsToPing = config.get('urlsToPing');
  for (var i = 0; i < urlsToPing.length; i++) {
    var ping = new Ping(urlsToPing[i]).schedule();
  }
}());