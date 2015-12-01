'use strict'

let crypto = require('crypto')
let validTokenDuration = process.env.TOKEN_VALIDITY_DURATION || (3 * 60 * 60 * 1000) // 3 hours by default

module.exports = function (app) {
  return {
    token: function (req, res) {
      if (!req.credential) {
        return res.sendStatus(401)
      }

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
        console.log(e)
        res.sendStatus(401)
      }
    }
  }
}
