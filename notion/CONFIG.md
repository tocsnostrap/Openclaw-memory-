# Notion Integration Config

## API
- **Key**: stored in `/opt/openclaw.env` as `NOTION_API_KEY`
- **Integration name**: "Open claw"
- **Workspace**: Scot Paterson's Notion
- **API Version**: 2022-06-28

## Fred's Hub Page IDs
- **🔧 Fred's Hub** (root): `30a6384b-ca28-805c-97c1-d002daf0b5de`
- **💡 Ideas**: `30a6384b-ca28-81c1-9949-d9c53c912f26`
- **📈 Trading**: `30a6384b-ca28-813a-84ae-dd847fd44e6a`
- **💼 Work**: `30a6384b-ca28-81fd-a59a-e35d299bcead`
- **📌 Personal**: `30a6384b-ca28-8184-aca6-f19442d6f500`
- **✅ Lists**: `30a6384b-ca28-81ed-b009-d9ceb8fcb066`
- **🧠 Fred Log**: `30a6384b-ca28-8135-89f7-c5f850a1e929`

## Scot's Existing Pages (read-only reference)
- **Habit Tracker** (database): `2116384b-ca28-80a7-b7c2-e43ec4905eaf`
- **Monthly Budget**: `2116384b-ca28-8003-bc82-c344c85d2f89`
- **Project Planner**: `2116384b-ca28-80a8-bc7c-c984e3992896`
- **Investments Tracker**: `2186384b-ca28-800b-b71d-dcb8049d3e0d`
- **🎯 TCT Trading System**: `2186384b-ca28-80cf-a7b6-ef1f626876b4`
- **Gate.io 10x Scanner Setup**: `2176384b-ca28-802b-b5eb-d95273ee0d38`
- **Gate.io 10x Scanner** (database): `2176384b-ca28-807b-9d13-c0c8016c452f`
- **Token** (database): `2176384b-ca28-8095-91fa-d45a9e510590`

## Usage
To add content to a page, append blocks:
```bash
curl -s "https://api.notion.com/v1/blocks/<PAGE_ID>/children" \
  -X PATCH \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"children": [...]}'
```

## How It Works
- Scot tells Fred anything on Telegram
- Fred categorizes and adds it to the right Notion page
- Scot can browse/edit in Notion app anytime
- Fred can also log his own activity in "Fred Log"
