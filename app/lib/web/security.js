'use strict'
let url = require('url')

module.exports = function (app) {
  app.use(function (req, res, next) {
    console.log('BP1')
    if (req.headers.accept === 'text/event-stream') {
      return next()
    }
    console.log('BP2')
    let origin = req.headers.referer !== undefined ? url.parse(req.headers.referer) : '*'

    origin = typeof origin === 'object' ? origin.protocol + '//' + origin.host : origin

    res.set('Access-Control-Allow-Origin', origin)
    res.set('Access-Control-Allow-Credentials', 'true')

    if (req.method.trim().toUpperCase() === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      res.set('Access-Control-Allow-Headers', 'Authorization, X-REQUESTED-WITH')
      return res.sendStatus(200)
    }

    console.log('BP3')
    // Check for authorization
    if (req.headers.authorization) {
      console.log('BP4')
      try {
        let header = req.headers.authorization.split(/\s+/)
        req.type = header[0]

        req.credential = new Buffer(header[1], 'base64').toString()
        console.log('BP4.5')
        if (req.type.toLowerCase() === 'bearer') {
          req.credential = header[1]
          req.authorized = app.tokens.indexOf(req.credential) !== -1
        }
        console.log('BP5')
        return next()
      } catch (e) {
        console.log('BPERROR')
        res.status(500).send(e.message)
      }
    }
    console.log('BP-NOAUTH')
    return next()
  })
}
