var util = require('util'),
    winston = require('winston');
var EventStore = require("nodejs-EventStore");


var Eventstore = exports.Eventstore = function(options) {
  winston.Transport.call(this, options);
  options = (options || {});
  this.options = options;
  //
  // Name this logger
  //
  this.name = 'Eventstore';

  //
  // Set the level from your options
  //
  this.level = options.level || 'info';

  //
  // Configure your storage backing as you see fit
  //
  this.options.host = options.host || "127.0.0.1";
  this.options.port = options.port || 2111;
  this.options.streamName = options.streamName || "log";
  this.options.metadata = {
    "$maxAge": options.maxAge || 86400
  };

  this.connectToEventStore();
};

/**
 * Inherit from `winston.Transport`.
 */
util.inherits(Eventstore, winston.Transport);
/**
 * Define a getter so that `winston.transports.Eventstore`
 * is available and thus backwards compatible.
 */
winston.transports.Eventstore = Eventstore;

Eventstore.prototype.connectToEventStore = function connectToEventStore(){
  var self = this;
  this.connection = EventStore.connect(this.options.host, this.options.port);
  this.connection._socket.on('error', function (err) {
    self.connection._socket.destroy();
    console.log("Error: " + err.message + " DESTROY SOCKET AND OPEN A NEW ONE!");
    setTimeout(function () {
      self.connectToEventStore();
    }, 2000);
  });
  this.connection._socket.on('end', function () {
    self.connection._socket.end();
    console.log('Disconnected lost connection');
    self.connectToEventStore();
  });
  // If you're also serving http, display a 503 error.
  this.connection._socket.on('close', function () {
    console.log('Socket Closed!');
  });
  //we don't need to wait for this!
  this.connection.pCreateEvent('$$' + this.options.streamName, "$metadata", this.options.metadata);
}

Eventstore.prototype.log = function (level, msg, meta, callback) {
  //
  // Store this message and metadata, maybe use some custom logic
  // then callback indicating success.
  //
  //no matter what happens!:)
  this.connection.pCreateEvent(this.options.streamName, level, msg, meta).then(
    function(esResponse){
      callback(null, true);
    }).catch(function(err){
      callback(null, true);
    });
};