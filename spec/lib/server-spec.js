// Copyright 2015, EMC, Inc.
/* jshint node:true */

'use strict';

describe('tftp server tests', function (done) {
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
            sinon.spy(server, 'listen');
            sinon.spy(server._tftp, 'close');
            server.start();
        });

        // basic property tests
        it('server is an object',function(done){
            expect(server).to.be.a('object');
            done();
        });

        it('server has a host property that is a string',function(done){
            expect(server).to.have.property('host')
                .that.is.a('string');
            done();
        });
        it('server has a port property that is a number',function(done){
            expect(server).to.have.property('port')
                .that.is.a('number');
            done();
        });
        it('server has a root property that is a string',function(done){
            expect(server).to.have.property('root')
                .that.is.a('string');
            done();
        });
        it('server has a start function',function(done){
            expect(server).to.have.property('start')
                .that.is.a('function');
            done();
        });
        it('server has a stop function',function(done){
            expect(server).to.have.property('stop')
                .that.is.a('function');
            done();
        });

        // verify expected public functions exist
        it('server has a logListening function',function(done){
            expect(server).to.have.property('logListening')
                .that.is.a('function');
            done();
        });
        it('server has a handleError function',function(done){
            expect(server).to.have.property('handleError')
                .that.is.a('function');
            done();
        });
        it('server has a handleRequest function',function(done){
            expect(server).to.have.property('handleRequest')
                .that.is.a('function');
            done();
        });
        it('server has a logClose function',function(done){
            expect(server).to.have.property('logClose')
                .that.is.a('function');
            done();
        });

        // test function calls
        it('server calls listen function when started', function(done){
            server.start();
            expect(server.listen).to.have.been.called;
            done();
        });
        it('server calls close function when stopped', function(done){
            server.stop();
            expect(server._tftp.close).to.have.been.called;
            done();
        });
        // not testing other function calls because that is just testing EventEmitter...


        // verify events list point to corisponding functions
        it('listening event, is pointing to correct function', function() {
            expect(server._tftp._events.listening).to.equal(TftpServer.prototype.logListening);
        });
        it('error event, is pointing to correct function', function() {
            expect(server._tftp._events.error).to.equal(TftpServer.prototype.handleError);
        });
        it('close event, is pointing to correct function', function() {
            expect(server._tftp._events.close).to.equal(TftpServer.prototype.logClose);
        });
        it('request event, is pointing to correct function', function() {
            expect( _.contains( server._tftp._events.request, TftpServer.prototype.handleRequest )).to.be.ok;
        });
    });
});
