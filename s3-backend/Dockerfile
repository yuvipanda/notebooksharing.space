FROM golang:1.14.4-buster

# Install deps
RUN apt-get update && apt-get install -y \
  libssl-dev \
  ca-certificates \
    fuse

ENV GO111MODULE=on

RUN git clone https://github.com/ipfs/go-ipfs && \
    cd go-ipfs && \
    git checkout v0.8.0

RUN go get github.com/ipfs/go-ds-s3@v0.7.0

RUN echo "s3ds github.com/ipfs/go-ds-s3/plugin 0" >> go-ipfs/plugin/loader/preload_list

RUN cd go-ipfs && make install


FROM debian:buster

RUN apt-get update > /dev/null && \
    apt-get install -y  ca-certificates > /dev/null

COPY --from=0 /go/bin/ipfs /usr/local/bin/ipfs
COPY config.json config.json
COPY entrypoint.bash entrypoint.bash

ENTRYPOINT ["./entrypoint.bash"]
