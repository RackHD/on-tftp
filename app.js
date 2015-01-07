//Copyright 2014, Renasar Technologies Inc.
/* jshint node: true */

"use strict";

var di = require('di');
  
module.exports = Runner;
di.annotate(Runner, new di.Provide('Tftp'));
di.annotate(Runner, new di.Inject(
   'Tftp.Server',
   'Services.Messenger',
   'Q'
  )
);

function Runner(server,messenger,Q) {
  function start(){
    return messenger.start()
    .then(function(){
      server.start();
    });         
  }

  function stop(){
    try{
      server.stop();
      messenger.stop();
    } catch (e) {
      return Q.reject(e);
    }
    return Q.resolve()
  }

  return {
    start: start,
    stop: stop
  };
}
