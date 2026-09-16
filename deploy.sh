#!/usr/bin/env bash
# Deploy the FREEDO project to Vercel using a provided token.
# Usage: VERCEL_TOKEN=<your-token> ./deploy.sh
set -e
if [[ -z "$VERCEL_TOKEN" ]]; then
  echo "Error: VERCEL_TOKEN environment variable not set."
  exit 1
fi
# Use npx to run Vercel CLI without a global install
npx vercel --prod --token "$VERCEL_TOKEN" --confirm
