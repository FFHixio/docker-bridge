'use strict'

let express = require('express')
let bodyParser = require('body-parser')
let helmet = require('helmet')
let compression = require('compression')
let https = require('https')
let crypto = require('crypto')
let SSE = require('ngn-sse')
let Security = require('./security')
let Router = require('./router')
let WebSocket = require('./ws')
let etcd = require('etcdjs')
let time = (new Date()).getTime().toString()

process.env.SSE_PATH = process.env.SSE_PATH || '/' + crypto.createHash('md5').update(time).digest('hex')
process.env.USERNAME = process.env.USERNAME || 'admin'
process.env.PASSWORD = process.env.PASSWORD || 'letmein'

// Hold active tokens & SSE clients
let clients = []

module.exports = function (ssl, sub, location) {
  let app = express()

  app.sub = sub
  app.webinfo = location || {}

  // Create a secure web server
  let server = https.createServer(ssl, app)

  app.tokens = []
  app.use(helmet())
  app.use(compression())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  // Apply Security
  Security(app)

  // Routing
  Router(app)

  // Add websocket support
  WebSocket(app, server)

  // Launch the web server and apply SSE
  server.listen(443, function () {
    let sse = new SSE(server, {
      path: process.env.SSE_PATH
    })

    sse.on('connection', function (client) {
      clients.push(client)
    })

    console.log('Publisher listening on port ' + server.address().port + '.')
    console.log('SSE available at https://<hostname>' + process.env.SSE_PATH)
  })

  // When the MQ receives a message, broadcast via SSE to other NGN services.
  sub.on('message', function (topic, payload) {
    topic = topic.toString()
    payload = payload.toString()

    clients.forEach(function (client) {
      client.send({
        event: topic,
        data: payload
      })
    })
  })

  this.updateLocation = function (loc) {
    app.webinfo = loc
  }
}
