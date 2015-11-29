'use strict'

class Configuration {
  constructor () {
    
  }

  retrieve (user, password, callback) {
    callback && callback(null, {
      test: 'test'
    })
  }
}

module.exports = Configuration
