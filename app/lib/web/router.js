'use strict'
let express = require('express')
let router = express.Router()

// Helper methods
let authorize = function (req, res, next) {
  if (!req.authorized) {
    return res.sendStatus(401)
  }
  next()
}

let configurationAvailable = function (app) {
  return function (req, res, next) {
    if (app.etcd) {
      return next()
    }
    res.status(400).send('Configuration database is not accessible.')
  }
}

// Main module
module.exports = function (app) {
  // Endpoints
  let oauth = require('./api/security')(app)
  let cfg = require('./api/configuration')(app)

  // Token Exchange
  app.get('/oauth/token', function (req, r, n) { console.log('breakpoint'); n() }, oauth.token)

  // Authorize all configuration endpoints
  let cfgAvail = configurationAvailable(app)
  router.use('/cfg/', authorize, cfgAvail)

  // Configuration Users
  app.post('/cfg/user', cfg.createUser) // Create
  app.get('/cfg/user/:id', cfg.readUser) // Read
  app.put('/cfg/user/:id', cfg.updateUser) // Update
  app.delete('/cfg/user/:id', cfg.deleteUser) // Delete
  app.get('/cfg/users', cfg.listUsers) // List

  // Configuration Roles
  app.post('/cfg/role', cfg.createRole) // Create
  app.get('/cfg/role/:id', cfg.readRole) // Read
  app.put('/cfg/role/:id', cfg.updateRole) // Update
  app.delete('/cfg/role/:id', cfg.deleteRole) // Delete
  app.get('/cfg/roles', cfg.listRoles) // List

  // Configuration Keys
  app.post('/cfg/key', cfg.createKey) // Create
  app.get('/cfg/key/:id', cfg.readKey) // Read
  app.put('/cfg/key/:id', cfg.updateKey) // Update
  app.delete('/cfg/key/:id', cfg.deleteKey) // Delete
  app.get('/cfg/keys', cfg.listKeys) // List

  // Retrieve info about the Bridge
  app.get('/info', authorize, function (req, res) {
    res.json(app.webinfo)
  })

  // Retrieve the version of the Bridge that's running.
  app.get('/version', authorize, function (req, res) {
    res.send(process.env.BRIDGE_VERSION)
  })

  // Fallback
  app.get('/', function (req, res) {
    if (req.authorized) {
      return res.sendStatus(404)
    }
    res.set('Cache-Control', 'no-cache')
    res.set('Content-Type', 'text/html')
    res.send('<html><body style="text-align:center;padding:20px;"><script type="text/javascript">window.close()</script><a href="javascript: window.close();" style="font-family: Arial;color:#333333; font-weight: 100;font-size:22px;">Access This NGN Bridge</a></body></html>')
  })
}
