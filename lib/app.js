//Copyright 2014, Renasar Technologies Inc.
/* jshint node: true */

"use strict";

var di = require('di');

module.exports = Runner;
di.annotate(Runner, new di.Provide('Tftp'));
di.annotate(Runner, new di.Inject(
   'Services.Core',
   'Tftp.Server',
   'Services.Messenger',
   'Q'
  )
);

function Runner(core, server, messenger, Q) {
    function start(){
        return core.start()
        .then(function(){
            server.start();
        });
    }

    function stop(){
        try{
            server.stop();
        } catch (e) {
            return Q.reject(e);
        }
        return core.stop();
    }

    return {
        start: start,
        stop: stop
    };
}
