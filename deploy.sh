#!/usr/bin/env bash
#
# Deploy maimai-update (SvelteKit) to Linux server
# - Builds locally
# - Rsyncs build/ to server
# - Installs Node.js deps on server (better-sqlite3 needs native compile on Linux)
# - Restarts PM2
#
# Prerequisites on server:
#   - Node.js, PM2 (npm i -g pm2)
#
# Usage: ./deploy.sh

set -euo pipefail

SERVER="saba"
REMOTE_DIR="/home/polariss/maimai-update"
SSH_PORT="2222"

# Shared SSH connection — enter password once
SOCKET="/tmp/ssh-deploy-$$.sock"
cleanup() { ssh -S "$SOCKET" -O exit "$SERVER" 2>/dev/null; rm -f "$SOCKET"; true; }
trap cleanup EXIT

SSH_OPTS="-p $SSH_PORT -o ControlPath=$SOCKET -o ControlMaster=auto -o ControlPersist=120"
RSYNC_RSH="ssh $SSH_OPTS"
SSH_CMD="ssh $SSH_OPTS $SERVER"

echo "=== Building locally ==="
bun run build

echo ""
echo "=== Syncing to $SERVER:$REMOTE_DIR ==="
$SSH_CMD "mkdir -p $REMOTE_DIR"

rsync -avz --delete \
  -e "$RSYNC_RSH" \
  build \
  package.json ecosystem.config.cjs .npmrc \
  "$SERVER:$REMOTE_DIR/"

echo ""
echo "=== Installing deps on server ==="
$SSH_CMD "cd $REMOTE_DIR && npm install --production"

echo ""
echo "=== Restarting PM2 ==="
$SSH_CMD "pm2 startOrGracefulReload $REMOTE_DIR/ecosystem.config.cjs && pm2 save"

echo ""
echo "=== Done! ==="
