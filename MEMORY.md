# MEMORY.md - Long-Term Memory

## Who I Am
- **Fred** — sharp, direct, dry humor, brutally honest. 🔧

## Who Scot Is
- 38, chef, based in Saudi Arabia (AST/UTC+3)
- Working night shifts — sleeps roughly 08:00-18:00 AST
- Wants me to figure things out, not ask a million questions
- Wants brutal honesty, no hedging
- Newcastle United fan
- **Primary goal: make money.** That's why I exist.
- Trader/investor — crypto, markets. Got liquidated early 2026, lost $14k. Hungry to recover and grow.
- Built a pump fade crypto bot, Polymarket copy trading project
- Invested in BlockDAG (pre-launch)
- Interested in AI freelancing on Upwork
- Has old Upwork proposal templates for crypto bot work

## Key Events
- **First boot (2026-02-16):** Got set up, named Fred, established the vibe. Telegram is home base.
- Updated to OpenClaw 2026.2.15, locked down Telegram, installed Chrome + ffmpeg.
- Voice working: Groq Whisper STT + Edge TTS (en-GB-RyanNeural, inbound-only).
- Browser operational (headless Chrome).
- Tailscale installed but ⚠️ NEVER touch gateway.bind for Tailscale — crashes gateway, Scot explicitly forbids it.
- Old repo has crypto trading bot (Kimchi), Upwork proposals, Next.js dashboard.

## Scot's Interests
- Trading, crypto, investing (TCT strategy, MEXC exchange, TradingView)
- Football (Newcastle United fan — old bot said Arsenal, that was WRONG)
- AI/automation
- Making money — this is the primary directive
- Upwork/Freelancer freelancing with Fred doing the building

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

## Active Infrastructure
- Custom dashboard: http://159.89.170.115:3000 (token: fred-scot-2026)
- Job Hunter cron: morning 04:00 UTC + evening 16:00 UTC on Grok
- Brave web search: key in tools.web.search.apiKey in config JSON (env var alone not enough)
- Freelancer credentials in /workspace/.credentials (gitignored)

## Notion Integration
- Connected to "Scot Paterson's Notion" via API (internal integration "Open claw")
- API key in `/opt/openclaw.env` as `NOTION_API_KEY`
- **Fred's Hub** root page: `30a6384b-ca28-805c-97c1-d002daf0b5de`
- Sub-pages: Ideas, Trading, Work, Personal, Lists, Fred Log
- Full page ID mapping in `/workspace/notion/CONFIG.md`
- Scot's existing pages visible: Habit Tracker, Monthly Budget, Investments Tracker, TCT Trading System, Gate.io 10x Scanner
- Limitation: internal integrations can't create workspace-level pages (must nest under existing)

## Pending
- GitHub PAT needed from Scot to push workspace backup (low priority — VPS is temporary)
- ~~Memory search needs embedding provider~~ ✅ Gemini embeddings live
- ~~Tailscale dashboard access~~ ❌ NEVER — crashes gateway
- ~~Scot's plans~~ ✅ Revealed: make money via Upwork freelancing + trading
- Job Hunter agent needs to save ACTUAL URLs not "assumed from fetch"
- Upwork blocked by Cloudflare — workaround: Brave search for indexed listings + Scot forwards links
- Freelancer login blocked by reCAPTCHA — can browse but can't auto-submit
