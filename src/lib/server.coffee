fs = require "fs"
express = require "express"
logger = require 'morgan'
bodyParser = require 'body-parser'
errorhandler = require 'errorhandler'
cors = require 'cors'
modules = require './modules'
env = process.env.NODE_ENV || 'development'

app = express()

# configure
app.use(logger(':remote-addr :method :url'))
app.use(bodyParser.urlencoded(
  extended: true
))
app.use(bodyParser.json())
app.use(cors())
# app.use(express.methodOverride())
# app.use(express.static(__dirname + "/public"))

if true #'development' == env
   app.use(errorhandler(
     dumpExceptions: true
     showStack: true
   ))
else
  app.use(errorhandler())

start = (config) ->
  modules.setup(app, config)
  port = config.port || 8086
  app.listen(port)
  console.log("Express server listening on port %d in %s mode", port, app.settings.env)

exports.start = start
exports.app = app
