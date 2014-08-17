(function() {
  var express, modules;

  express = require('express');

  modules = ['local-library'];

  module.exports = {
    setup: function(app, config) {
      var module, name, subapp, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = modules.length; _i < _len; _i++) {
        name = modules[_i];
        subapp = express();
        module = require('./' + name);
        module.setup(subapp, config[name], name);
        _results.push(app.use('/' + name, subapp));
      }
      return _results;
    }
  };

}).call(this);
