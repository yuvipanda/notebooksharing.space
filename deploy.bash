#!/usr/bin/env bash
set -euo pipefail

git push origin main

helm upgrade --install --namespace=nbss --create-namespace \
	nbss helm-chart/nbss \
	--set env.AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \
	--set env.AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
