# HEARTBEAT.md — Fred's Periodic Checks

## Every Heartbeat
- Check `/workspace/jobs/` for new Scout results that haven't been evaluated yet
- If new jobs found: evaluate, draft proposals, push to Notion under Fred's Hub

## Rotate Through (pick 1-2 per heartbeat, don't repeat within 2 hours)

### 💰 Money — Priority #1
- **Job evaluation**: New Scout results? Evaluate, draft proposals, push to Notion
- **Opportunity research**: Search for new ways to make money with AI. What are other AI bots/agents doing commercially? Search Twitter/X, Reddit, Hacker News for "AI agent making money", "AI freelance", "AI bot business", "AI SaaS". Log findings to Notion Ideas page.
- **Twitter/X scan**: Search for trending AI agent projects, bot-as-a-service ideas, automation businesses people are building. Look for gaps we could fill.
- **Competitor scan**: What are top Freelancer/Upwork sellers offering? What services are in demand? What's underserved?
- **Passive income ideas**: Research recurring revenue models — SaaS tools, bot subscriptions, API services, templates/boilerplates we could sell.

### 📋 Operations
- **Client replies**: Check Notion Work page for any active bids that need follow-up
- **Notion sync**: Anything in local notes/ or memory/ that should be pushed to Notion?
- **Build progress**: Any active projects being built? Check status, push updates.

### 🔧 Maintenance (once daily max)
- **Memory maintenance**: Review recent memory/*.md files, update MEMORY.md if needed
- **System health**: Quick `df -h` and `free -m` — flag if disk >85% or RAM critically low

## Research Log
When you find interesting money-making ideas or trends, add them to:
- Notion: Fred's Hub → Ideas (for Scot to browse)
- Local: `/workspace/notes/ideas.md` (backup)
Include: what it is, why it's viable, estimated effort, potential revenue.

## State Tracking
- Check `/workspace/memory/heartbeat-state.json` before running checks
- Update it after each check to avoid repeats
