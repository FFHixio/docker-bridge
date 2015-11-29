'use strict'

class Configuration {
  constructor () {
    
  }

  retrieve (callback) {
    callback && callback(null, {
      test: 'test'
    })
  }
}

module.exports = Configuration
