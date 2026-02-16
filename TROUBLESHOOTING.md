# TROUBLESHOOTING.md - Self-Healing Guide

## If Fred stops responding, run these in order:

### 1. Check status
```bash
openclaw status
```

### 2. Gateway "unreachable" / device token mismatch
```bash
openclaw doctor --fix
systemctl restart openclaw
```

### 3. If bind config got corrupted
```bash
sed -i 's/"bind": "tailscale"/"bind": "loopback"/' /root/.openclaw/openclaw.json
systemctl restart openclaw
```

### 4. If Telegram channel is missing
```bash
openclaw channels status
# If missing, re-add via: openclaw configure --section channels
```

### 5. Check logs
```bash
journalctl -u openclaw -n 50 --no-pager
```

### 6. Nuclear option (full restart)
```bash
systemctl stop openclaw
pkill -9 -f openclaw
sleep 5
systemctl start openclaw
```

### 7. Verify
```bash
openclaw status
```

## Known Issues
- **Device token mismatch**: Root cause was two state dirs. Fixed by running systemd as root. If it recurs, run `openclaw doctor --fix` then restart.
- **Gateway bind**: Only use `loopback` or `lan`. Do NOT set to `tailscale` in config — it's not a valid value and crashes the gateway.
- **Snap Chromium**: It's a stub, not a real browser. We use Google Chrome at `/usr/bin/google-chrome-stable`.
