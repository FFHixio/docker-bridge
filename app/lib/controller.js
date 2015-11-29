'use strict'

let RequestLocation = require('./location')
let CreateSecuritySystem = require('./ssl')
let WebServer = require('./web/web')
let webinfo = {}
let server

// A helper method to capture geolocation (if it fails the firs ttime due to network/remote service issue)
let geoAttempts = 0
let retrieveGeoLocation = function () {
  geoAttempts++
  if (geoAttempts > 25) {
    console.error('Failed to acquire geolocation after 25 attempts. Aborting.')
    return
  }
  RequestLocation(function (location) {
    if (!location) {
      setTimeout(retrieveGeoLocation, 7000)
    } else {
      webinfo = location
      server.updateLocation(webinfo)
    }
  })
}

module.exports = function (pub, sub) {
  // 1. Attempt to identify server location for SSL cert
  RequestLocation(function (location) {
    if (location) {
      console.log('NGN Bridge Location:')
      Object.keys(location).forEach(function (attr) {
        console.info(' - ' + attr + ':', location[attr])
      })
    } else {
      console.warn('Server location could not be accurately determined at this time.')
    }
    // 2. Create a self-signed SSL certificate if appropriate.
    CreateSecuritySystem(location, function (ssl) {
      // 3. Launch a secure web server
      server = new WebServer(ssl, sub, location)
      webinfo = location || {}

      // If the geolocation data cannot be acquired immediately, try again.
      if (Object.keys(webinfo).length === 0) {
        setTimeout(retrieveGeoLocation, 7000) // Try again in 7 seconds
      }
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
    if (typeof payload === 'object') {
      payload = JSON.stringify(payload)
    }
    pub.send([topic, payload])
    callback && callback(null)
  }

  this.subscribe = function (callback) {
    // Generate a token
    //    let token = crypto.createHash('md5').update((new Date()).getTime()).digest('hex')
    //    tokens.push(token)
    callback && callback(null, webinfo)
  }
}
