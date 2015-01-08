
var di = require('di'), 
    tftpd = require('tftp');

module.exports = TftpServerFactory;
di.annotate(TftpServerFactory, new di.Provide('Tftp.Server'));
di.annotate(TftpServerFactory, new di.Inject(
    'Logger',
    'Services.Configuration'
  )
);
  
 
function TftpServerFactory(Logger,configuration){
  var logger = Logger.initialize(TftpServerFactory); 
  tftp = tftpd.createServer({
      host: configuration.get('server'),
      port: configuration.get('tftpport'),
      root: configuration.get('tftproot'),
  });
      
  tftp.on("listening", function() {
    logger.info("TFTP Server Listening " + configuration.get('server') + ":" + configuration.get('tftpport'));
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
      tftpProtocol.publishError({
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


      tftpProtocol.publishFinish({
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
            tftpProtocol.publishAbort({
                file: req.file,
                remoteAddress: req.stats.remoteAddress,
                remotePort: req.stats.remotePost,
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
      this.close() 
    }

    return tftp;
};

