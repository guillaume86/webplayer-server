fs = require('fs')
ini = require('ini')
joinPath = require('path').join
argv = require('minimist')(process.argv[2..])
server = require('../lib/server')

getUserHome = ->
  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE

applicationDataPath = joinPath(getUserHome(), '.webplayer')

if !fs.existsSync(applicationDataPath)
  fs.mkdir(applicationDataPath)

iniPath = joinPath(applicationDataPath, 'config.ini')
config = {}
if fs.existsSync(iniPath)
  config = ini.parse(fs.readFileSync(iniPath, 'utf-8'))

config.port ||= 8086
config['local-library'] ||= {}
config['local-library'].databasePath ||= applicationDataPath
config['local-library'].paths ||= []

# can't write back because it messes up backslashes
# fs.writeFileSync(iniPath, ini.stringify(config))

server.start(config)
