'use strict'

let http = require('http')
let SSE = require('ngn-sse')

process.env.WEB_PORT = process.env.WEB_PORT || 55555

module.exports = function (pub, sub) {
  // Store the client connections
  let clients = []

  // Create a web server
  let server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('ok')
  })

  // Launch the web server and apply SSE
  server.listen(process.env.WEB_PORT, function () {
    let sse = new SSE(server)

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

  this.send = function (topic, payload) {
    if (typeof payload === 'object'){
      payload = JSON.stringify(payload)
    }
    pub.send([topic, payload])
  }

//  let emitter = new EventEmitter()
//  let topics = []
//
//  emitter.getListeners = function () {
//    return topics.filter(function (topic,i) {
//      return topics.indexOf(topic) === i
//    })
//  }
//
//  // Override the emit method
//  emitter.send = function (topic, payload) {
//    if (typeof payload === 'object'){
//      payload = JSON.stringify(payload)
//    }
//    pub.send([topic, payload])
//  }
//
//  // When a new listener is added, add it to the topics
//  // list so it is not filtered.
//  emitter.on('newListener', function (topic, listener) {
//    listener = listener || function () {}
//    topics.push(topic)
//    topics.push(checksum(listener.toString()))
//    sub.subscribe(topic)
//  })
//
//  // When a listener is removed, remove it from the topics
//  // list so it is filtered.
//  emitter.on('removeListener', function (topic, listener) {
//    listener = listener || function(){}
//    topics = topics.splice(topics.lastIndexOf(topic),1)
//    topics = topics.splice(topics.lastIndexOf(checksum(listener.toString())),1)
//  })
//
//  // When zeromq emits a message, send it to the client
//  // if the client is subscribed to the topic.
//  sub.on("message", function (topic, payload) {
//    if (topics.indexOf(topic.toString()) >= 0){
//      payload = payload.toString()
//      try {
//        payload = JSON.parse(payload)
//      } catch(e){}
//      emitter.emit(topic, payload)
//    }
//  })
//
//  return emitter
}
