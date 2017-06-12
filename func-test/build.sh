#!/bin/sh

echo "hello world"
docker daemon  

cd  $(pwd)/source-code 
docker build -t rackhd/on-tftp .
docker tag rackhd/on-tftp 10.240.16.225:5000
docker push 10.240.16.225:5000:rckhd/on-tftp
