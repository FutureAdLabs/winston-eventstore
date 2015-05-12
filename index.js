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

  this.connection = EventStore.connect(this.options.host, this.options.port);
  this.connection.pCreateEvent('$$' + this.options.streamName, "$metadata", this.options.metadata);
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


// Store this message and metadata, maybe use some custom logic
// then callback indicating success.
Eventstore.prototype.log = function (level, msg, meta, callback) {
  this.connection.pCreateEvent(this.options.streamName, level, msg, meta).then(
    function(esResponse){
      callback(null, true);
    }).catch(function(err){
      callback(null, true);
    });
};