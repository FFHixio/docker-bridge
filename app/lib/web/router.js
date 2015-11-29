'use strict'
let crypto = require('crypto')
let validTokenDuration = process.env.TOKEN_VALIDITY_DURATION || (3 * 60 * 60 * 1000) // 3 hours by default

let authorize = function (req, res, next) {
  if (!req.authorized) {
    return res.sendStatus(401)
  }
  next()
}

module.exports = function (app) {
  // Token Exchange
  app.get('/oauth/token', function (req, res) {
    let credential = req.credential.split(':') // Get the basic auth apply

    try {
      if (req.type.toLowerCase() === 'basic' && credential[0] === process.env.USERNAME && credential[1] === process.env.PASSWORD) {
        // Basic auth suceeded, generate a token
        let t = (new Date()).getTime() + crypto.randomBytes(243).toString('hex').trim()

        app.tokens.push(t)

        let out = {
          token: t,
          expires: (new Date()).getTime() + validTokenDuration
        }

        // Auto-remove tokens when they expire.
        setTimeout(function () {
          if (app.tokens.indexOf(t) >= 0) {
            app.tokens = app.tokens.splice(app.tokens.indexOf(t), 1)
          }
        }, validTokenDuration)

        return res.json(out)
      }
      return res.sendStatus(401)
    } catch (e) {
      res.sendStatus(401)
    }
  })

  // Retrieve info about the Bridge
  app.get('/info', authorize, function (req, res) {
    res.json(app.webinfo)
  })

  // Fallback
  app.get('/', function (req, res) {
    res.set('Cache-Control', 'no-cache')
    res.set('Content-Type', 'text/html')
    res.send('<html><body style="text-align:center;padding:20px;"><script type="text/javascript">window.close()</script><a href="javascript: window.close();" style="font-family: Arial;color:#333333; font-weight: 100;font-size:22px;">Enable This NGN Bridge</a></body></html>')
  })
}
