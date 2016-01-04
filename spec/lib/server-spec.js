// Copyright 2015, EMC, Inc.
/* jshint node:true */

'use strict';

describe('tftp server tests', function () {
    var TftpServer;
    var server;
    var LogListeningSpy;

    describe('initial values of properties', function(){
        before(function() {
            helper.setupInjector([
                require('../../lib/server.js'),
            ]);
            TftpServer = helper.injector.get('Tftp.Server');
        });

        beforeEach(function() {
            if (server) {
                server.stop();
            }
            server = TftpServer.create();
            sinon.stub(server, 'listen');
            sinon.stub(server._tftp, 'close');
            server.start();
        });

        // basic property tests
        it('server is an object',function(){
            expect(server).to.be.a('object');
        });

        it('server has a host property that is a string',function(){
            expect(server).to.have.property('host')
                .that.is.a('string');
        });
        it('server has a port property that is a number',function(){
            expect(server).to.have.property('port')
                .that.is.a('number');
        });
        it('server has a root property that is a string',function(){
            expect(server).to.have.property('root')
                .that.is.a('string');
        });
        it('server has a start function',function(){
            expect(server).to.have.property('start')
                .that.is.a('function');
        });
        it('server has a stop function',function(){
            expect(server).to.have.property('stop')
                .that.is.a('function');
        });

        // verify expected public functions exist
        it('server has a logListening function',function(){
            expect(server).to.have.property('logListening')
                .that.is.a('function');
        });
        it('server has a handleError function',function(){
            expect(server).to.have.property('handleError')
                .that.is.a('function');
        });
        it('server has a handleRequest function',function(){
            expect(server).to.have.property('handleRequest')
                .that.is.a('function');
        });
        it('server has a logClose function',function(){
            expect(server).to.have.property('logClose')
                .that.is.a('function');
        });

        // test function calls
        it('server calls listen function when started', function(){
            //server.start();
            expect(server.listen).to.have.been.called;
        });
        it('server calls close function when stopped', function(){
            server.stop();
            expect(server._tftp.close).to.have.been.called;
        });
        // not testing other function calls because that is just testing EventEmitter...

    });
});
