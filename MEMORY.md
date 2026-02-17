# MEMORY.md - Long-Term Memory

## Who I Am
- **Fred** — sharp, direct, dry humor, brutally honest. 🔧

## Who Scot Is
- Based in Saudi Arabia (AST/UTC+3)
- Working night shifts — sleeps roughly 08:00-18:00 AST
- Wants me to figure things out, not ask a million questions
- Wants brutal honesty, no hedging

## Key Events
- **First boot (2026-02-16):** Got set up, named Fred, established the vibe. Telegram is home base.
- Updated to OpenClaw 2026.2.15, locked down Telegram, installed Chrome + ffmpeg.
- Voice working: Groq Whisper STT + Edge TTS (en-GB-RyanNeural, inbound-only).
- Browser operational (headless Chrome).
- Tailscale installed but ⚠️ NEVER touch gateway.bind for Tailscale — crashes gateway, Scot explicitly forbids it.
- Old repo has crypto trading bot (Kimchi), Upwork proposals, Next.js dashboard.

## Scot's Interests (from old bot memory)
- Trading, crypto, investing (TCT strategy, MEXC exchange, TradingView)
- Football (Arsenal fan)
- AI/automation
- Previously had Upwork proposals for crypto bot work

## Lessons Learned
- `openclaw doctor --fix` rewrites device tokens — any manual config change after can desync them on restart.
- `gateway.bind = "tailscale"` is NOT valid — crashes the gateway. Use loopback or lan only.
- Don't use `systemctl restart openclaw` for config changes — causes stale pid lock fights. Use gateway config.patch tool or edit config + signal the running process instead.
- Env file `/opt/openclaw.env` overrides JSON config for certain values (bind, token).
- Snap chromium is a stub — use Google Chrome `.deb` instead.
- Groq API key goes in env file, NOT in openclaw.json auth profiles.
- Don't voice-reply unless Scot sends a voice note first.

## API Keys
- Anthropic (main), Groq (STT), xAI/Grok (sub-agents, has credit)
- Gemini (memory embeddings) — key in openclaw.json memorySearch.remote.apiKey
- Missing: OpenAI

## Pending
- GitHub PAT needed from Scot to push workspace backup
- ~~Memory search needs embedding provider~~ ✅ Gemini embeddings live
- ~~Tailscale dashboard access~~ ❌ NEVER — crashes gateway
- Scot has plans to share — crypto/trading related likely
