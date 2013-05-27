xmlrpc-stream
=============

Perform XML-RPC using any kind of stream!

Overview
--------

xmlrpc-stream implements the XML and RPC bits of XML-RPC without the implied
transport portion. Any duplex stream can be used as a transport.

Installation
------------

Available via [npm](http://npmjs.org/):

> $ npm install xmlrpc-stream

Or via git:

> $ git clone git://github.com/deoxxa/xmlrpc-stream.git node_modules/xmlrpc-stream

API
---

**constructor**

Creates a new RPC object. Expects a stream factory function as an argument. This
factory function will be called whenever a transport is required (read: every
single time you call a remote method).

```javascript
new RPC(fn);
```

```javascript
var rpc = new RPC(function() {
  return net.connect(3000, "127.0.0.1");
});
```

**call**

Calls a remote method by name, optionally with some parameters, then calls your
callback with the result (or an error! woo!).

```javascript
rpc.call(method, [arg1, [arg2, [argN ...]]], cb);
```

```javascript
rpc.call("system.listMethods", function(err, res) {
  console.log(err, res);
});

// OR

rpc.call("system.methodSignature", "system.listMethods", function(err, res) {
  console.log(err, res);
});
```

Arguments

* _method_ - a string, naming the remote method to call.
* _argN_ - the parameters for the remote method.
* _cb_ - a callback to be called when the response comes in.

Example
-------

Also see [example.js](https://github.com/deoxxa/xmlrpc-stream/blob/master/example.js).
This uses [scgi-stream](http://github.com/deoxxa/scgi-stream) as well, but you
could just as easily replace that with `net.connect` or something if you had a
remote server that supported XML-RPC over regular TCP sockets.

```javascript
var scgi = require("scgi-stream"),
    RPC = require("xmlrpc-stream");

var rpc = new RPC(function() {
  return scgi.duplex({
    host: "127.0.0.1",
    port: 17199,
    path: "/",
  });
});

rpc.call("d.multicall", "default", "d.get_creation_date=", "d.get_bytes_done=", "d.get_directory=", "d.get_down_rate=", "d.get_up_rate=", "d.get_down_total=", "d.get_up_total=", function(err, res) {
  console.log(err, res);
});
```

License
-------

3-clause BSD. A copy is included with the source.

Contact
-------

* GitHub ([deoxxa](http://github.com/deoxxa))
* Twitter ([@deoxxa](http://twitter.com/deoxxa))
* ADN ([@deoxxa](https://alpha.app.net/deoxxa))
* Email ([deoxxa@fknsrs.biz](mailto:deoxxa@fknsrs.biz))
