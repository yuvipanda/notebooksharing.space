#!/usr/bin/env bash
set -euo pipefail

git push origin main
ssh root@159.203.84.207 'cd /srv/notebook-pastebin && git pull origin main && systemctl restart notebook-pastebin'
