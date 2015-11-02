'use strict'

let http = require('http')
let SSE = require('ngn-sse')
// let crypto = require('crypto')

process.env.WEB_PORT = process.env.WEB_PORT || 55555
process.env.SSE_PATH = process.env.SSE_PATH || '/sse'

module.exports = function (pub, sub) {
  // Store the client connections
  let clients = []
//  let tokens = []

  // Create a web server
  let server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('ok')
  })

  // Launch the web server and apply SSE
  server.listen(process.env.WEB_PORT, function () {
    let sse = new SSE(server, {
      path: process.env.SSE_PATH
    })

    sse.on('connection', function (client) {
      clients.push(client)
    })
  })
  
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

  this.send = function (topic, payload, callback) {
    if (!callback) {
      if (typeof payload === 'function') {
        console.warn('No callback specified in client initiated send() method.')
        callback = payload
        payload = null
      }
    }
    if (typeof payload === 'object'){
      payload = JSON.stringify(payload)
    }
    pub.send([topic, payload])
    callback && callback(null)
  }
  
  this.subscribe = function(callback) {
    // Generate a token
//    let token = crypto.createHash('md5').update((new Date()).getTime()).digest('hex')
//    tokens.push(token)
    callback && callback(null, {
      port: process.env.WEB_PORT,
      path: process.env.SSE_PATH
    })
  }
}
