var xml = require("xml"),
    xml2js = require("xml2js");

var RPC = module.exports = function RPC(createStream) {
  this.createStream = createStream;
};

RPC.prototype.call = function call(method) {
  var args = [].slice.call(arguments, 1),
      cb = args.pop();

  var transport = this.createStream();

  var data = [];
  transport.on("readable", function() {
    var chunk;
    while (chunk = transport.read()) {
      data.push(chunk);
    }
  });

  transport.once("error", cb);

  transport.on("end", function() {
    data = Buffer.concat(data);

    xml2js.parseString(data, function(err, data) {
      if (err) {
        return cb(err);
      }

      if (data.methodResponse.fault) {
        return cb(valueFromXML(data.methodResponse.fault[0].value[0]));
      } else {
        return cb(null, valueFromXML(data.methodResponse.params[0].param[0].value[0]));
      }
    });
  });

  transport.end(makeRequest(method, args));
};

var makeRequest = function makeRequest(method, args) {
  return xml([
    {methodCall: [
      {methodName: method},
      {params: args.map(function(e) {
        return {param: [valueToXML(e)]};
      })},
    ]},
  ]);
};

var valueToXML = function valueToXML(param) {
  if (typeof param === "object" && Array.isArray(param)) {
    return {value: [{array: [{data: param.map(valueToXML)}]}]};
  }

  if (typeof param === "object" && Buffer.isBuffer(param)) {
    return {value: [{base64: param.toString("base64")}]};
  }

  if (typeof param === "boolean") {
    return {value: [{boolean: param ? 1 : 0}]};
  }

  if (typeof param === "object" && param instanceof Date) {
    return {value: [{"dateTime.iso8601": param.toISOString()}]};
  }

  if (typeof param === "number" && Math.round(param) === param) {
    return {value: [{int: param}]};
  }

  if (typeof param === "number") {
    return {value: [{double: param}]};
  }

  if (typeof param === "string") {
    return {value: [{string: param}]};
  }

  if (param === null) {
    return {value: [{nil: null}]};
  }
};

var valueFromXML = function valueFromXML(xml) {
  if (xml.array) {
    return (xml.array[0].data[0].value || []).map(valueFromXML);
  }

  if (xml.base64) {
    return Buffer(xml.base64[0], "base64");
  }

  if (xml.boolean) {
    return xml.boolean[0] === 1;
  }

  if (xml["dateTime.iso8601"]) {
    return new Date(xml["dateTime.iso8601"][0]);
  }

  if (xml.double) {
    return parseFloat(xml.double[0]);
  }

  if (xml.int || xml.i4 || xml.i8) {
    return parseInt(xml.int || xml.i4 || xml.i8, 10);
  }

  if (xml.string) {
    return xml.string[0];
  }

  if (xml.struct) {
    return xml.struct[0].member.map(function(e) {
      return [e.name[0], valueFromXML(e.value[0])];
    }).reduce(function(i, v) {
      i[v[0]] = v[1];
      return i;
    }, {});
  }

  if (xml.nil) {
    return null;
  }
};
