'use strict'

require('ngn')

// Create a socket
let zmq = require('zmq')

process.env.MQ_PORT = process.env.MQ_PORT || 54321
process.env.RPC_PORT = process.env.RPC_PORT || 5555

// Setup the message queue publisher/subscriber
let pub = zmq.socket('pub')
let sub = zmq.socket('sub')

// Connect the publisher
pub.bindSync('tcp://127.0.0.1:' + process.env.MQ_PORT)

// Connect the subscriber
sub.connect('tcp://127.0.0.1:' + process.env.MQ_PORT)

sub.subscribe('kitty cats');

// Setup the controller
let Controller = require('./lib/bus-controller')
let controller = new Controller(pub, sub)

// Setup the RPC server
let server = new NGN.rpc.Server({
  port: process.env.RPC_PORT,
  export: {
    emit: controller.send
  }
})

// Log when the RPC service is running
server.on('ready', function () {
  console.log('Accepting RPC requests on port', process.env.RPC_PORT)
})

setInterval(function () {
  console.log('sending a multipart message envelope')
  pub.send(['kitty cats', '{"cat says": "meow!"}'])
}, 1500)

let EventSource = require('eventsource')
let es = new EventSource('http://localhost:' + process.env.WEB_PORT + '/sse')

es.addEventListener('kitty cats', function(){
  console.log('KITTY KATS RULE!', arguments)
});

es.onmessage = function(e) {
  console.log("RECEIVED",e.data);
};
es.onerror = function() {
  console.log('ERROR!');
};