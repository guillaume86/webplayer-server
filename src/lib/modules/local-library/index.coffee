send = require 'send'
MediaLibary = require 'media-library'

library = null
basePath = null

mapTrack = (track, req) ->
  return (
    title: track.title
    artist: track.artist?[0]
    album: track.album
    duration: track.duration
    year: track.year
    url: [req.protocol + '://' + req.get('host'), basePath, 'play', track._id].join('/')
  )

handlers =
  status: (req, res, next) ->
    res.send('online')

  scan: (req, res, next) ->
    res.writeHead(200, {'Content-Type': 'text/plain'})
    library.scan()
      .progress((track) ->
        console.log('scan progress: %s', track.path)
        res.write(track.path + '\n')
      )
      .then((count) ->
        res.write('scanned tracks: ' + count)
        res.end()
      )
      .fail((err) ->
        console.error('scan error', err)
        next(err)
      )
      .done()

  tracks: (req, res, next) ->
    library.tracks()
      .then((tracks) ->
        res.send(mapTrack(track, req) for track in (tracks || []))
      )
      .fail(next)
      .done()

  find: (req, res, next) ->
    library.find({ artist: req.query.artist, title: req.query.title })
      .then((tracks) ->
        res.send(mapTrack(track, req) for track in tracks)
      )
      .fail(next)
      .done()

  play: (req, res, next) ->
    library.dbfind({ _id: req.params.id })
      .then((results) ->
        if !results.length
          res.statusCode = 404
          res.end()
          return

        send(req, results[0].path)
        .on('error', next)
        .pipe(res)
      )
      .fail(next)
      .done()


module.exports =
  setup: (app, config, path) ->
    basePath = path
    library = new MediaLibary(config)
    app.get('/status', handlers.status)
    app.get('/scan', handlers.scan)
    app.get('/tracks', handlers.tracks)
    app.get('/play/:id', handlers.play)
    app.get('/find', handlers.find)
