// Copyright 2015, EMC, Inc.

"use strict";

var di = require('di');

module.exports = Runner;
di.annotate(Runner, new di.Provide('Tftp'));
di.annotate(Runner, new di.Inject(
   'Services.Core',
   'Tftp.Server',
   'Services.Messenger',
   'Promise'
  )
);

function Runner(core, server, messenger, Promise) {
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
            return Promise.reject(e);
        }
        return core.stop();
    }

    return {
        start: start,
        stop: stop
    };
}
