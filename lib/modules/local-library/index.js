(function() {
  var MediaLibary, basePath, handlers, library, mapTrack, send;

  send = require('send');

  MediaLibary = require('media-library');

  library = null;

  basePath = null;

  mapTrack = function(track, req) {
    var _ref;
    return {
      title: track.title,
      artist: (_ref = track.artist) != null ? _ref[0] : void 0,
      album: track.album,
      duration: track.duration,
      year: track.year,
      url: [req.protocol + '://' + req.get('host'), basePath, 'play', track._id].join('/')
    };
  };

  handlers = {
    status: function(req, res, next) {
      return res.send('online');
    },
    scan: function(req, res, next) {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      return library.scan().progress(function(track) {
        console.log('scan progress: %s', track.path);
        return res.write(track.path + '\n');
      }).then(function(count) {
        res.write('scanned tracks: ' + count);
        return res.end();
      }).fail(function(err) {
        console.error('scan error', err);
        return next(err);
      }).done();
    },
    tracks: function(req, res, next) {
      return library.tracks().then(function(tracks) {
        var track;
        return res.send((function() {
          var _i, _len, _ref, _results;
          _ref = tracks || [];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            track = _ref[_i];
            _results.push(mapTrack(track, req));
          }
          return _results;
        })());
      }).fail(next).done();
    },
    find: function(req, res, next) {
      return library.find({
        artist: req.query.artist,
        title: req.query.title
      }).then(function(tracks) {
        var track;
        return res.send((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = tracks.length; _i < _len; _i++) {
            track = tracks[_i];
            _results.push(mapTrack(track, req));
          }
          return _results;
        })());
      }).fail(next).done();
    },
    play: function(req, res, next) {
      return library.dbfind({
        _id: req.params.id
      }).then(function(results) {
        if (!results.length) {
          res.statusCode = 404;
          res.end();
          return;
        }
        return send(req, results[0].path).on('error', next).pipe(res);
      }).fail(next).done();
    }
  };

  module.exports = {
    setup: function(app, config, path) {
      basePath = path;
      library = new MediaLibary(config);
      app.get('/status', handlers.status);
      app.get('/scan', handlers.scan);
      app.get('/tracks', handlers.tracks);
      app.get('/play/:id', handlers.play);
      return app.get('/find', handlers.find);
    }
  };

}).call(this);
