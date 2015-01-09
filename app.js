//Copyright 2014, Renasar Technologies Inc.
/* jshint node: true */

"use strict";

var di = require('di');

module.exports = Runner;

di.annotate(Runner, new di.Provide('Tftp'));
di.annotate(Runner, new di.Inject(
        'Tftp.Server',
        'Services.Messenger'
    )
);

function Runner (server, messenger) {
    function start(){
        return messenger.start()
            .then(function () {
                server.start();
            });
    }

    function stop () {
        server.stop();
        messenger.stop();
    }

    return {
        start: start,
        stop: stop
    };
}