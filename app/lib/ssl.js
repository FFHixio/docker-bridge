'use strict'

let pem = require('pem')

module.exports = function (options, callback) {
  console.log('Configuring SSL certificate...')
  options = options || {}

  let sslconfig = {
    country: process.env.COUNTRY || options.country || 'US',
    state: process.env.REGION || options.region || 'Texas',
    locality: process.env.CITY || options.city || 'Austin',
    organization: process.env.ORGANIZATION || 'NGN',
    organizationUnit: process.env.ORGANIZATIONUNIT || 'Bridge',
    commonName: process.env.COMMONNAME || 'ngnbridge',
    emailAddress: process.env.ADMINEMAIL || 'noreply@' + (options.ip || 'domain.com')
  }

  pem.createPrivateKey(2048, function (pkerr, pkoutput) {
    sslconfig.clientKey = pkoutput.key
    pem.createCSR(sslconfig, function (err, csroutput) {
      if (err) throw err
      pem.createCertificate({
        days: 3 * 365, // 3yr expiration
        selfSigned: true,
        serviceKey: sslconfig.clientKey,
        csr: csroutput.csr
      }, function(err, cert){
        if (err) throw err
        console.log('SSL certificate ready.')
        callback({
          key: sslconfig.clientKey,
          cert: cert.certificate
        })
      })  
    })
  })
}
