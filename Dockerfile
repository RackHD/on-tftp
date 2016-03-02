# Copyright 2016, EMC, Inc.

FROM rackhd/on-core

RUN mkdir -p /RackHD/on-tftp
WORKDIR /RackHD/on-tftp

COPY ./package.json /tmp/
RUN cd /tmp \
  && ln -s /RackHD/on-core /tmp/node_modules/on-core \
  && ln -s /RackHD/on-core/node_modules/di /tmp/node_modules/di \
  && npm install --ignore-scripts --production

COPY . /RackHD/on-tftp/
RUN cp -a -f /tmp/node_modules /RackHD/on-tftp/

EXPOSE 69/udp

VOLUME /RackHD/on-tftp/static/tftp

CMD [ "node", "/RackHD/on-tftp/index.js" ]
