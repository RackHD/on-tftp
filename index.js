// Copyright 2014, Renasar Technologies Inc.
/* jshint node: true */
"use strict";

var di = require('di'),
    _ = require('lodash'),
    core = require('renasar-core')(di),
    injector = new di.Injector(
      _.flatten([
        core.injectables,
        require('./lib/app'),
        require('./lib/server')
      ])
    ),
    logger = injector.get('Logger').initialize('Tftp'),
    tftp = injector.get('Tftp');

tftp.start()
.catch(function(err) {
    logger.error('Failure starting TFTP service' + err.stack);
    process.nextTick(function(){
        process.exit(1);
    });
});

process.on('SIGINT',function() {
    tftp.stop()
    .catch(function(err) {
        logger.error('Failure cleaning up TFTP service' + err.stack);
    })
    .fin(function() {
        process.nextTick(function(){
            process.exit(1);
        });
    });
});

