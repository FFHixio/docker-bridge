'use strict'

module.exports = function (app, server) {
  let users = {}

  app.io = require('socket.io').listen(server)

  app.io.on('connection', function (socket) {
    socket.on('disconnect', function () {
      //      console.log('Client ' + socket.id + ' disconnected.')
      app.io.emit('user.disconnect', socket.user)
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
  app.sub.on('message', function (topic, payload) {
    topic = topic.toString()
    payload = payload.toString()

    try {
      payload = JSON.parse(payload)
    } catch (e) {}

    app.io.emit('broadcast', {
      event: topic,
      data: payload
    })
  })

  console.log('Websocket upgrades enabled.')
}
