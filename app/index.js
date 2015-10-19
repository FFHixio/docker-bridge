// Create a socket
// var zmq = require('zmq');
// socket = zmq.socket('req');

// Register to monitoring events
// socket.on('connect', function(fd, ep) {console.log('connect, endpoint:', ep);});
// socket.on('connect_delay', function(fd, ep) {console.log('connect_delay, endpoint:', ep);});
// socket.on('connect_retry', function(fd, ep) {console.log('connect_retry, endpoint:', ep);});
// socket.on('listen', function(fd, ep) {console.log('listen, endpoint:', ep);});
// socket.on('bind_error', function(fd, ep) {console.log('bind_error, endpoint:', ep);});
// socket.on('accept', function(fd, ep) {console.log('accept, endpoint:', ep);});
// socket.on('accept_error', function(fd, ep) {console.log('accept_error, endpoint:', ep);});
// socket.on('close', function(fd, ep) {console.log('close, endpoint:', ep);});
// socket.on('close_error', function(fd, ep) {console.log('close_error, endpoint:', ep);});
// socket.on('disconnect', function(fd, ep) {console.log('disconnect, endpoint:', ep);});
//
// // Handle monitor error
// socket.on('monitor_error', function(err) {
//     console.log('Error in monitoring: %s, will restart monitoring in 5 seconds', err);
//     setTimeout(function() { socket.monitor(500, 0); }, 5000);
// });
//
// // Call monitor, check for events every 500ms and get all available events.
// console.log('Start monitoring...');
// socket.monitor(500, 0);
// socket.connect('tcp://127.0.0.1:5555');

// setTimeout(function() {
//     console.log('Stop the monitoring...');
//     socket.unmonitor();
// }, 20000);

var zmq = require('zmq')
  , pub = zmq.socket('pub')
  , sub = zmq.socket('sub');

pub.bindSync('tcp://127.0.0.1:5555');
console.log('Publisher bound to port 55555');

setInterval(function(){
  console.log('sending a multipart message envelope');
  pub.send(['kitty cats', 'meow!']);
}, 500);


sub.connect('tcp://127.0.0.1:5555');
sub.subscribe('kitty cats');
console.log('Subscriber connected to port 5555');

sub.on('message', function(topic, message) {
  console.log('received a message related to:', topic.toString(), 'containing message:', message.toString());
});

console.log('yo')
