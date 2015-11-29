'use strict'

let Socket = require('socket.io')

module.exports = function (http, sub) {

  let io = Socket(http)
  let users = {}

  io.on('connection', function (socket) {
    socket.on('disconnect', function () {
//      console.log('Client ' + socket.id + ' disconnected.')
      io.emit('user.disconnect', socket.user)
      delete users[socket.id]
    })

    // Add user to list & broadcast
    socket.user = {
      id: socket.id
    }
    users[socket.id] = socket
    socket.broadcast.emit('user.connect', socket.id)

//    console.log('New client connected as ' + socket.id)

    socket.emit('welcome')
  })
  
  // When a new message is received from 0MQ, broadcast it.
  sub.on('message', function (topic, payload) {
    topic = topic.toString()
    payload = payload.toString()
    
    try {
      payload = JSON.parse(payload)
    } catch (e) {}

    io.emit('broadcast', {
      event: topic,
      data: payload
    })
  })

  console.log('Websocket upgrades enabled.')
}
