// Copyright 2014, Renasar Technologies Inc.
/* jshint node: true */

"use strict";

var di = require('di'),
    tftpd = require('tftp');

module.exports = TftpServerFactory;
di.annotate(TftpServerFactory, new di.Provide('Tftp.Server'));
di.annotate(TftpServerFactory, new di.Inject(
    'Logger',
    'Services.Configuration',
    'Protocol.Tftp'
  )
);


function TftpServerFactory(Logger, configuration, eventsProtocol){
  var logger = Logger.initialize(TftpServerFactory);
  var tftp = tftpd.createServer({
      host: configuration.get('server'),
      port: configuration.get('tftpport'),
      root: configuration.get('tftproot'),
  });

  tftp.on("listening", function() {
    logger.info("TFTP Server Listening " +
        configuration.get('server') + ":" + configuration.get('tftpport'));
  });

  tftp.on("error", function(err) {
    logger.emerg("TFTP main socket error: ", err);
    process.nextTick(function() {
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


      eventsProtocol.publishTftpSuccess({
            file: req.file,
            remoteAddress: req.stats.remoteAddress,
            remotePort: req.stats.remotePort,
            size: res._writer._size,
            time: ms.toFixed(3)
      });

      logger.silly(
        'tftp: ' + ms.toFixed(3) +
        ' ' + req.file, {
          ip: req.stats.remoteAddress
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
        // Don't use logger here, because in stop() we close the server
        // and close the message bus, so the logger will try to log on
        // the now closed bus.
        console.log("TFTP server closed.");
    });

    tftp.start = function(){
      this.listen();
    };

    tftp.stop = function(){
      this.close();
    };

    return tftp;
}

