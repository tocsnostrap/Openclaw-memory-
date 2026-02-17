#!/bin/bash
cd /root/.openclaw/workspace
git add -A
if git diff --cached --quiet; then
    echo "No changes to push"
    exit 0
fi
git commit -m "Auto-backup: $(date -u '+%Y-%m-%d %H:%M UTC')"
git push origin master 2>&1
echo "Pushed at $(date -u)"
