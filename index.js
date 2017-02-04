// Copyright 2015, EMC, Inc.

"use strict";

var di = require('di'),
    _ = require('lodash'),
    core = require('on-core')(di),
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
    logger.critical('Failure starting TFTP service' + err.stack);
    process.nextTick(function(){
        process.exit(1);
    });
});

process.on('SIGINT',function() {
    tftp.stop()
    .catch(function(err) {
        logger.critical('Failure cleaning up TFTP service' + err.stack);
    })
    .finally(function() {
        process.nextTick(function(){
            process.exit(1);
        });
    });
});
