// Copyright 2015, EMC, Inc.

"use strict";

var di = require('di'),
    tftpd = require('tftp');

module.exports = TftpServerFactory;
di.annotate(TftpServerFactory, new di.Provide('Tftp.Server'));
di.annotate(TftpServerFactory, new di.Inject(
        'Logger',
        'Services.Configuration',
        'Protocol.Events',
        'Services.Lookup'
    )
);


function TftpServerFactory(Logger, configuration, eventsProtocol, lookupService) {
    var logger = Logger.initialize(TftpServerFactory);
    var host = configuration.get('tftpBindAddress', '0.0.0.0');
    var port = configuration.get('tftpBindPort', 69);
    var root = configuration.get('tftpRoot', './static/tftp');

    var tftp = tftpd.createServer({
        host: host,
        port: port,
        root: root
    });

    tftp.on("listening", function() {
        logger.info("TFTP Server Listening %s:%s".format(host, port));
    });

    tftp.on("error", function(err) {
      logger.critical("TFTP main socket error: ", err);
      setImmediate(function() {
          process.exit(-1); // exit the program entirely if we can't listen for TFTP requests
      });
    });

    tftp.on("request", function(req, res){
        req._startAt = process.hrtime();

        req.on("error", function() {
            logger.warning("Tftp error", {
                file: req.file,
                remoteAddress: req.stats.remoteAddress,
                remotePort: req.stats.remotePort,
                size: req.size
            });
        });

        res.on("finish", function() {
            if (!req._startAt) {
                return '';
            }

            var diff = process.hrtime(req._startAt);
            var ms = diff[0] * 1e3 + diff[1] * 1e-6;

            logger.debug('tftp: ' + ms.toFixed(3) + ' ' + req.file, {
                ip: req.stats.remoteAddress
            });

            lookupService.ipAddressToNodeId(req.stats.remoteAddress)
            .then(function(nodeId) {
                nodeId = nodeId || 'external';
                eventsProtocol.publishTftpSuccess(nodeId, {
                    file: req.file,
                    remoteAddress: req.stats.remoteAddress,
                    remotePort: req.stats.remotePort,
                    size: res._writer._size,
                    time: ms.toFixed(3)
                });
            })
            .catch(function(error) {
                logger.error("Error publishing TFTP success message: ", {
                    error: error
                });
            });
        });

        req.on("abort", function() {
            logger.warning("Tftp abort", {
                file: req.file,
                remoteAddress: req.stats.remoteAddress,
                remotePort: req.stats.remotePort,
                size: req.size
            });
        });
    });

    tftp.on("close", function() {
        logger.info("TFTP server closed.");
    });

    tftp.start = function(){
        this.listen();
    };

    tftp.stop = function(){
        this.close();
    };

    return tftp;
}
