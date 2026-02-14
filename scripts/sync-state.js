#!/usr/bin/env node
// Script to sync OpenClaw state to JSON files for dashboard
const fs = require('fs');
const path = require('path');

const STATE_DIR = path.join(__dirname, '..', 'workspace', 'state');

// Since we can't easily import OpenClaw tools here, 
// we'll create a simple file that can be updated by the agent
const args = process.argv.slice(2);
const command = args[0];

if (command === 'write-crons') {
  // This will be called by the agent via cron
  const crons = args.slice(1).join(' ');
  fs.writeFileSync(path.join(STATE_DIR, 'crons.json'), crons || '[]');
  console.log('Wrote crons to state file');
} else if (command === 'write-sessions') {
  const sessions = args.slice(1).join(' ');
  fs.writeFileSync(path.join(STATE_DIR, 'sessions.json'), sessions || '{}');
  console.log('Wrote sessions to state file');
} else {
  console.log('Usage: node sync-state.js write-crons [json] or write-sessions [json]');
}
