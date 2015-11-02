FROM mhart/alpine-node:4.2
MAINTAINER Corey Butler

# Set the working directory
VOLUME ["/app"]
WORKDIR /app
ADD ./app /app

# Add Dependencies
RUN apk add --update zeromq zeromq-dev pkgconfig python gcc g++ make bash \
    && mkdir -p /node_modules \
    && cd /node_modules \
    && npm install zmq ngn@0.2.81 ngn-sse \
    && cd /app \
    && npm install \
    && apk del zeromq-dev pkgconfig python gcc g++ make bash


EXPOSE 5555 55555

#CMD ["/bin/bash"]
CMD ["node","index.js"]

#ADD gnatsd /gnatsd
#ADD gnatsd.conf /gnatsd.conf
#
## Expose client, management, and routing/cluster ports
#EXPOSE 4222 8222 6222
#
#ENTRYPOINT ["/gnatsd", "-c", "/gnatsd.conf"]
