(function() {
  'use strict';

  var later = require('later');
  var config = require('config');
  var request = require('request');
  var rp = require('request-promise');
  var handlebars = require('handlebars');
  var htmlparser = require("htmlparser2");

  function Ping(conf) {
    this._conf = conf;
  }
  Ping.prototype.schedule = function() {
    var count = 4;
    console.log(this._conf);
    /*
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