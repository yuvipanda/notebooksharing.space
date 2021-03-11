#!/usr/bin/env bash

set -euo pipefail

ipfs version

# THESE VALUES CAN HAVE / IN THEM
# FIXME: UGH
sed -i "s|IPFS_PEER_ID|${IPFS_PEER_ID}|" config.json
sed -i "s|IPFS_PRIV_KEY|${IPFS_PRIV_KEY}|" config.json
sed -i "s|AWS_REGION|${AWS_REGION}|" config.json
sed -i "s|AWS_S3_BUCKET|${AWS_S3_BUCKET}|" config.json
sed -i "s|AWS_S3_ENDPOINT_URL|${AWS_S3_ENDPOINT_URL}|" config.json
sed -i "s|AWS_ACCESS_KEY_ID|${AWS_ACCESS_KEY_ID}|" config.json
sed -i "s|AWS_SECRET_ACCESS_KEY|${AWS_SECRET_ACCESS_KEY}|" config.json

ipfs init --empty-repo config.json

exec ipfs daemon "$@"
