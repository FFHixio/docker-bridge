# NGN Bridge

The NGN Bridge acts as the glue between NGN microservices. It can be thought of
as an industrial-grade private message bus.

The Bridge is available as a [Docker image](https://hub.docker.com/r/ngnjs/bridge/).

## Features

1. **Pub/Sub & Message Queue**: The NGN Bridge provides a pub/sub event bus based 
   on [ZeroMQ](http://zeromq.org). The message queue capabilities of 0MQ are included too.

1. **RPC API**: NGN masks the complexity of TCP message handling by provisioning a
   remote procedure call "API". This provides "remote" functions for Node.js, allowing
   applications to seamlessly interact with the Bridge.
   
1. **Server-Sent Events**: It is possible to connect to the bridge through a read-only
   web interface, using [SSE](https://en.wikipedia.org/wiki/Server-sent_events). Details available in the _Basic Startup_ section.

## Usage

The NGN Bridge can be run on one or more servers, and bridges can be connected to
each other to create a network.

### Basic Startup

```
docker run -d --name ngn-bridge -p 5555:5555 -p 81:55555 ngnjs/bridge
```

This command will run the bridge as a daemon (`-d`), named _ngn-bridge_, available on
port 5555 (`-p 5555:5555`). It also makes a read-only web server available at [http://myserver.com:8181]() (`-p 81:555555`) by mapping public port `81` to the 
private `55555` container port. Web pages can use the browser's native [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) to listen to the Bridge. This is also how the [NGN.BUS]() "hears" events
from the server by default.

To use this in an application, use the [NGN SDK](http://github.com/ngnjs/ngn). Let's say this server's domain name is `myserver.com`. 

```js
require('ngn')

NGN.BUS.connect('myserver.com') // Port 5555 is used by default. Use myserver.com:port to customize.

NGN.BUS.on('connected', function () {
  console.log('Now listening to the enterprise service bus.')
})
```

Keep in mind that port `5555` must be open on your firewall for this to work (see security section for additional options).

### Security

The ports used by bridge are typically not open by default using most firewalls. 
If you prefer to keep it this way, the `NGN.BUS` is capable of
using SSH tunnels to establish connections to these ports. SSH tunnels can be established
using a standard Linux account (username/password) or RSA keys (`id_rsa`).

This is a feature of the [NGN SDK](http://github.com/ngnjs/ngn), which contains full details. The short version:

```js
NGN.BUS.connect({
  host: 'myserver.com', // or myserver.com:custom_port
  ssh: {
    port: 22,
    username: 'username',
    password: 'password'
  }
})

// ----- OR -----
NGN.BUS.connect({
  host: 'myserver.com', // or myserver.com:custom_port
  ssh: {
    port: 22,
    key: require('fs').readFileSync('/path/to/id_rsa')
  }
})
```