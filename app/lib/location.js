'use strict'

let https = require('https')

class GeoRequest {
  constructor (callback) {
    let iddata = ''
    let timer = null
    let idreq
    let me = this
    
    Object.defineProperty(this, '_timedout', {
      enumerable: false,
      writable: true,
      configurable: false,
      value: false
    })

    this.country = process.env.COUNTRY || null
    this.region = process.env.REGION || null
    this.city = process.env.CITY || null
    this.ip = null
    this.latitude = null
    this.longitude = null
    
    idreq = https.request({
      hostname: 'freegeoip.net',
      port: 443,
      path: '/json/',
      method: 'GET'
    }, function (res) {
      res.on('data', function (chunk) {
        iddata += chunk
      })

      res.on('end', function () {
        clearTimeout(timer)
        let data = typeof iddata === 'string' ? JSON.parse(iddata) : iddata

        me.country = data.country_code
        me.region = data.region_name
        me.city = data.city
        me.ip = data.ip
        me.latitude = data.latitude
        me.longitude = data.longitude

        !me._timedout && callback(me)
      })
    })

    idreq.on('error', function (err) {
      console.warn('Request error: ' + err.message)
      clearTimeout(timer)
      !me._timedout && callback()
    })

    idreq.end()

    timer = setTimeout(function () {
      console.warn('Location information request timed out. Using defaults.')
      me._timedout = true
      callback()
    }, 5000)
  }
  
  get timedout () {
    return this._timedout
  }
}

module.exports = function (callback) {
  let geo = new GeoRequest(callback)
}
