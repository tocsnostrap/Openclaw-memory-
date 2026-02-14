const fs = require('fs');
const path = require('path');

const stateDir = '/home/azureuser/.openclaw/workspace/state';
const cronsPath = path.join(stateDir, 'crons.json');
const sessionsPath = path.join(stateDir, 'sessions.json');

const crons = [
  {
    id: "9ae90e14-8900-4d20-9837-2e02ad48ca30",
    name: "GitHub Push Hourly",
    schedule: "0 * * * *",
    status: "idle",
    lastRun: new Date().toISOString(),
    lastStatus: "success",
    consecutiveErrors: 0
  },
  {
    id: "7458928d-4ad4-4119-9805-0ae7c316679e",
    name: "Polymarket Research Report",
    schedule: "0 6 * * *",
    status: "idle",
    lastRun: "2026-02-14T06:00:00Z",
    lastStatus: "success",
    consecutiveErrors: 0
  }
];

fs.mkdirSync(stateDir, { recursive: true });
fs.writeFileSync(cronsPath, JSON.stringify({ jobs: crons }, null, 2));
fs.writeFileSync(sessionsPath, JSON.stringify({ count: 2 }, null, 2));

console.log('State synced at', new Date().toISOString());
