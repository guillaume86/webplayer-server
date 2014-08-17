express = require 'express'
modules = ['local-library']

module.exports =
  setup: (app, config) ->
    for name in modules
      subapp = express()
      module = require('./' + name)
      module.setup(subapp, config[name], name)
      app.use('/' + name, subapp)
