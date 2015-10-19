FROM mhart/alpine-node:4.2
MAINTAINER Corey Butler

# Add 0MQ
RUN apk add --update zeromq zeromq-dev bash pkgconfig python gcc g++ make

# Set the working directory
VOLUME ["app"]
WORKDIR /app
RUN mkdir -p /node_modules && cd /node_modules && npm i zmq && cd /app

RUN apk del zeromq-dev pkgconfig python gcc g++ make

EXPOSE 5555

CMD ["/bin/bash"]
#CMD ["node","index.js"]
