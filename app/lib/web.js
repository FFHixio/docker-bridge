'use strict'

let https = require('https')
let url = require('url')
let crypto = require('crypto')
let SSE = require('ngn-sse')
let WebSocket = require('./ws')
let time = (new Date()).getTime().toString()
let validTokenDuration = process.env.TOKEN_VALIDITY_DURATION || (3 * 60 * 60 * 1000) // 3 hours by default
let webinfo = {}

process.env.SSE_PATH = process.env.SSE_PATH || '/' + crypto.createHash('md5').update(time).digest('hex')
process.env.USERNAME = process.env.USERNAME || 'admin'
process.env.PASSWORD = process.env.PASSWORD || 'letmein'

module.exports = function (ssl, sub, location) {
  webinfo = location || {}
  let deny = function (req, res) {
    let origin = req.headers.referer !== undefined ? url.parse(req.headers.referer) : '*'

    origin = typeof origin === 'object' ? origin.protocol + '//' + origin.host : origin
    res.writeHead(401, {
      'Content-Type': 'text/plain',
      //        'WWW-Authenticate': 'Basic realm="NGN Bridge"',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true'
    })
    return res.end()
  }

  // Hold active tokens & SSE clients
  let tokens = []
  let clients = []

  // Create a web server
  let server = https.createServer(ssl || {}).listen(443)

  // Add websocket support
  WebSocket(server, sub)

  // Launch the web server and apply SSE
  server.listen(process.env.WEB_PORT, function () {
    let sse = new SSE(server, {
      path: process.env.SSE_PATH
    })

    sse.on('connection', function (client) {
      clients.push(client)
    })

    server.on('request', function (req, res) {
      if (req.headers.accept === 'text/event-stream') {
        return
      }

      let u = url.parse(req.url)
      let pathname = u.pathname.replace(/^\/{2,}/, '/')
      let authorized = false
      let credential = null
      let type = null
      let origin = req.headers.referer !== undefined ? url.parse(req.headers.referer) : '*'

      origin = typeof origin === 'object' ? origin.protocol + '//' + origin.host : origin

      if (req.method.trim().toUpperCase() === 'OPTIONS') {
        res.writeHead(200, {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, X-REQUESTED-WITH'
        })
        return res.end()
      }

      // Check for authorization
      if (req.headers.authorization) {
        try {
          let header = req.headers.authorization.split(/\s+/)
          type = header[0]

          credential = new Buffer(header[1], 'base64').toString()

          if (type.toLowerCase() === 'bearer') {
            credential = header[1]
            authorized = tokens.indexOf(credential) !== -1
          }
        } catch (e) {
          console.error(e)
        }
      }

      switch (pathname) {
        case '/oauth/token':
          credential = credential.split(':') // Get the basic auth credentials

          try {
            if (type.toLowerCase() === 'basic' && credential[0] === process.env.USERNAME && credential[1] === process.env.PASSWORD) {
              // Basic auth suceeded, generate a token
              let t = (new Date()).getTime() + crypto.randomBytes(243).toString('hex').trim()
              tokens.push(t)

              let out = {
                token: t,
                expires: (new Date()).getTime() + validTokenDuration
              }

              // Auto-remove tokens when they expire.
              setTimeout(function () {
                if (tokens.indexOf(t) >= 0) {
                  tokens = tokens.splice(tokens.indexOf(t), 1)
                }
              }, validTokenDuration)

              out = JSON.stringify(out)

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Content-Length': out.length,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true'
              })
              res.write(out)
            } else {
              throw new Error('Invalid Login')
            }
          } catch (e) {
            return deny(req, res)
          }
          break
        case '/info':
          if (!authorized) {
            return deny(req, res)
          }

          let out = JSON.stringify(webinfo)

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Content-Length': out.length,
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': origin
          })

          res.write(out)
          break
        case '/':
          res.writeHead(200, {
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': origin
          })
          res.write('<html><body style="text-align:center;padding:20px;"><script type="text/javascript">window.close()</script><a href="javascript: window.close();" style="font-family: Arial;color:#333333; font-weight: 100;font-size:22px;">Enable This NGN Bridge</a></body></html>')
          break
        case '/socket.io/':
          res.writeHead(200, {
            'Access-Control-Allow-Origin': origin
          })
          break
        default:
          res.writeHead(404)
          break
      }
      if (pathname !== '/socket.io/') {
        res.end()
      }
    })

    console.log('Publisher listening on port 443.')
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
    webinfo = loc
  }
}
