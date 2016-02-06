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
RUN cp -a /tmp/node_modules /RackHD/on-tftp/

ADD https://bintray.com/artifact/download/rackhd/binary/ipxe/monorail-efi32-snponly.efi \
    /RackHD/on-tftp/static/tftp/monorail-efi32-snponly.efi
ADD https://bintray.com/artifact/download/rackhd/binary/ipxe/monorail-efi64-snponly.efi \
    /RackHD/on-tftp/static/tftp/monorail-efi64-snponly.efi
ADD https://bintray.com/artifact/download/rackhd/binary/ipxe/monorail.ipxe \
    /RackHD/on-tftp/static/tftp/monorail.ipxe
ADD https://bintray.com/artifact/download/rackhd/binary/ipxe/undionly.kpxe \
    /RackHD/on-tftp/static/tftp/undionly.kpxe

EXPOSE 69
EXPOSE 69/udp

CMD [ "node", "/RackHD/on-tftp/index.js" ]
