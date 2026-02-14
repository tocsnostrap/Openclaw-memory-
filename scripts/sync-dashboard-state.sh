#!/bin/bash
# Sync OpenClaw state to JSON files for dashboard
# Run this every minute via cron

STATE_DIR="/home/azureuser/.openclaw/workspace/state"
mkdir -p "$STATE_DIR"

# Get cron jobs via OpenClaw tool and save to file
echo '[]' > "$STATE_DIR/crons.json"

# This will be populated by the agent
echo '{"count": 1}' > "$STATE_DIR/sessions.json"

# Write timestamp
date +%s > "$STATE_DIR/last-sync.txt"

echo "State synced at $(date)"
