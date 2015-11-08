# on-tftp [![Build Status](https://travis-ci.org/RackHD/on-tftp.svg?branch=master)](https://travis-ci.org/RackHD/on-tftp) [![Code Climate](https://codeclimate.com/github/RackHD/on-tftp/badges/gpa.svg)](https://codeclimate.com/github/RackHD/on-tftp) [![Coverage Status](https://coveralls.io/repos/RackHD/on-dhcp-proxy/badge.svg?branch=master&service=github)](https://coveralls.io/github/RackHD/on-dhcp-proxy?branch=master)


`on-tftp` provides a TFTP service integrated into the workflow engine for RackHD

Copyright 2015, EMC, Inc.

on-tftp
=======

On Tftp Server

## installation

    rm -rf node_modules
    npm install

## running

Note: requires MongoDB and RabbitMQ to be running to start correctly.

    sudo node index.js

## CI/testing

To run tests from a developer console:

    npm test

To run tests and get coverage for CI:

    # verify hint/style
    ./node_modules/.bin/jshint -c .jshintrc --reporter=checkstyle lib index.js > checkstyle-result.xml || true
    ./node_modules/.bin/istanbul cover -x "**/spec/**" _mocha -- $(find spec -name '*-spec.js') -R xunit-file --require spec/helper.js
    ./node_modules/.bin/istanbul report cobertura
    # if you want HTML reports locally
    ./node_modules/.bin/istanbul report html
