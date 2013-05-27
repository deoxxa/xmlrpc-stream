#!/usr/bin/env node

var scgi = require("scgi-stream"),
    RPC = require("./xmlrpc");

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
