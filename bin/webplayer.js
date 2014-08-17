(function() {
  var applicationDataPath, argv, config, fs, getUserHome, ini, iniPath, joinPath, server, _base, _base1;

  fs = require('fs');

  ini = require('ini');

  joinPath = require('path').join;

  argv = require('minimist')(process.argv.slice(2));

  server = require('../lib/server');

  getUserHome = function() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  };

  applicationDataPath = joinPath(getUserHome(), '.webplayer');

  if (!fs.existsSync(applicationDataPath)) {
    fs.mkdir(applicationDataPath);
  }

  iniPath = joinPath(applicationDataPath, 'config.ini');

  config = {};

  if (fs.existsSync(iniPath)) {
    config = ini.parse(fs.readFileSync(iniPath, 'utf-8'));
  }

  config.port || (config.port = 8086);

  config['local-library'] || (config['local-library'] = {});

  (_base = config['local-library']).databasePath || (_base.databasePath = applicationDataPath);

  (_base1 = config['local-library']).paths || (_base1.paths = []);

  server.start(config);

}).call(this);
