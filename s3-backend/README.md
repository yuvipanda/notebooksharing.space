# go-ipfs + s3 backend

## Configuration

`config.json` is a templated copy of an `ipfs init -e --profile server`,
with a few things changed:

- PeerID and PrivKey are set by environment variables
- AWS credentials and S3 information is also set via env variables
- Default store for blocks is S3, everything else is levelds
- The server profile sets up DHT and Swarm properly to not advertise
  private IPs. https://github.com/ipfs/go-ipfs/issues/6932 has more
  information.
- API and Swarm are exposed publicly, but gateway is *not*.
