const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const AUTH_TOKEN = process.env.DASH_TOKEN || 'fred-dashboard-2026';
const WORKSPACE = '/root/.openclaw/workspace';
const CONFIG_PATH = '/root/.openclaw/openclaw.json';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

function auth(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const tok = req.headers['authorization']?.replace('Bearer ', '') || url.searchParams.get('token');
  return tok === AUTH_TOKEN;
}

function cmd(c) {
  try { return execSync(c, { timeout: 10000, encoding: 'utf8' }).trim(); }
  catch (e) { return e.stdout?.trim() || ''; }
}

// ── Data collectors ──

function getSystem() {
  const uptimeSeconds = parseFloat(cmd("awk '{print $1}' /proc/uptime"));
  const loadParts = cmd("cat /proc/loadavg").split(' ');
  const memLines = cmd("free -b").split('\n');
  const memParts = memLines[1]?.split(/\s+/) || [];
  const swapParts = memLines[2]?.split(/\s+/) || [];
  const diskLine = cmd("df -B1 / | tail -1").split(/\s+/);
  const cpuCount = parseInt(cmd("nproc")) || 1;

  // Top processes by memory
  const procs = cmd("ps aux --sort=-%mem | head -8 | tail -7").split('\n').map(l => {
    const p = l.trim().split(/\s+/);
    return { user: p[0], pid: p[1], cpu: p[2], mem: p[3], command: p.slice(10).join(' ').substring(0, 40) };
  }).filter(p => p.pid);

  // Network interfaces
  const interfaces = cmd("ip -4 addr show | grep 'inet ' | awk '{print $NF, $2}'").split('\n').map(l => {
    const [iface, addr] = l.split(' ');
    return { iface, addr: addr?.split('/')[0] };
  }).filter(i => i.addr);

  return {
    uptimeSeconds,
    load: { m1: parseFloat(loadParts[0]), m5: parseFloat(loadParts[1]), m15: parseFloat(loadParts[2]) },
    memory: { total: parseInt(memParts[1]) || 0, used: parseInt(memParts[2]) || 0, available: parseInt(memParts[6]) || 0 },
    swap: { total: parseInt(swapParts[1]) || 0, used: parseInt(swapParts[2]) || 0 },
    disk: { total: parseInt(diskLine[1]) || 0, used: parseInt(diskLine[2]) || 0, available: parseInt(diskLine[3]) || 0 },
    hostname: cmd('hostname'),
    cpuCount,
    kernel: cmd('uname -r'),
    procs,
    interfaces,
  };
}

function getGateway() {
  const running = cmd('pgrep -f "openclaw-gatewa" >/dev/null 2>&1 && echo "1" || echo "0"') === '1';
  const pid = cmd('pgrep -f "openclaw-gatewa" 2>/dev/null | head -1');
  const listen = cmd("ss -tlnp | grep 18789 | awk '{print $4}' | head -1");
  let gwUptime = 0;
  if (pid) { gwUptime = parseInt(cmd(`ps -o etimes= -p ${pid} 2>/dev/null`).trim()) || 0; }
  const connections = cmd("ss -tnp | grep 18789 | wc -l").trim();
  return { running, pid, listen: listen || null, uptimeSeconds: gwUptime, connections: parseInt(connections) || 0 };
}

function getMemoryFiles() {
  const files = [];
  const memDir = path.join(WORKSPACE, 'memory');
  try {
    const entries = fs.readdirSync(memDir).filter(f => f.endsWith('.md')).sort().reverse();
    for (const f of entries) {
      const stat = fs.statSync(path.join(memDir, f));
      const content = fs.readFileSync(path.join(memDir, f), 'utf8');
      const lines = content.split('\n');
      const sections = content.match(/^## .+/gm)?.map(s => s.replace('## ', '')) || [];
      files.push({ name: f, size: stat.size, modified: stat.mtime, lineCount: lines.length, sections });
    }
  } catch {}

  const memoryMd = path.join(WORKSPACE, 'MEMORY.md');
  try {
    const stat = fs.statSync(memoryMd);
    const content = fs.readFileSync(memoryMd, 'utf8');
    const sections = content.match(/^## .+/gm)?.map(s => s.replace('## ', '')) || [];
    files.unshift({ name: 'MEMORY.md', size: stat.size, modified: stat.mtime, lineCount: content.split('\n').length, sections, type: 'longterm' });
  } catch {}
  return files;
}

function readMemoryFile(filename) {
  // Sanitize
  const safe = path.basename(filename);
  let fp;
  if (safe === 'MEMORY.md') fp = path.join(WORKSPACE, safe);
  else fp = path.join(WORKSPACE, 'memory', safe);
  try { return { name: safe, content: fs.readFileSync(fp, 'utf8') }; }
  catch { return { name: safe, content: 'File not found' }; }
}

function getActivity() {
  const memDir = path.join(WORKSPACE, 'memory');
  try {
    const entries = fs.readdirSync(memDir).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/)).sort().reverse();
    if (entries.length > 0) {
      const content = fs.readFileSync(path.join(memDir, entries[0]), 'utf8');
      const sections = [];
      let cur = null;
      for (const line of content.split('\n')) {
        if (line.startsWith('## ')) {
          if (cur) sections.push(cur);
          cur = { title: line.replace('## ', ''), items: [] };
        } else if (cur && line.startsWith('- ')) {
          cur.items.push(line.replace(/^- /, ''));
        }
      }
      if (cur) sections.push(cur);
      return { file: entries[0], sections };
    }
  } catch {}
  return { file: null, sections: [] };
}

function getConfig() {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const apiKeys = [];
    const envContent = cmd('cat /opt/openclaw.env 2>/dev/null');
    if (envContent.includes('ANTHROPIC_API_KEY=')) apiKeys.push({ name: 'Anthropic', status: 'active', use: 'Main model' });
    if (envContent.includes('GROQ_API_KEY=')) apiKeys.push({ name: 'Groq', status: 'active', use: 'STT (Whisper)' });
    if (envContent.includes('XAI_API_KEY=')) apiKeys.push({ name: 'xAI', status: 'active', use: 'Sub-agents' });
    if (envContent.includes('GEMINI_API_KEY=')) apiKeys.push({ name: 'Gemini', status: 'active', use: 'Memory embeddings' });
    if (envContent.includes('BRAVE_API_KEY=')) apiKeys.push({ name: 'Brave', status: 'active', use: 'Web search' });
    else apiKeys.push({ name: 'Brave', status: 'missing', use: 'Web search' });
    if (envContent.includes('OPENAI_API_KEY=')) apiKeys.push({ name: 'OpenAI', status: 'active', use: 'Fallback' });
    else apiKeys.push({ name: 'OpenAI', status: 'missing', use: 'Fallback' });

    return {
      model: 'Claude Opus 4',
      modelId: 'anthropic/claude-opus-4-6',
      ttsVoice: cfg.messages?.tts?.edge?.voice || 'unknown',
      ttsProvider: cfg.messages?.tts?.provider || 'unknown',
      ttsMode: cfg.messages?.tts?.auto || 'off',
      sttModel: cfg.tools?.media?.audio?.models?.[0]?.model || 'unknown',
      sttProvider: cfg.tools?.media?.audio?.models?.[0]?.provider || 'unknown',
      memoryProvider: cfg.agents?.defaults?.memorySearch?.provider || 'none',
      memoryModel: cfg.agents?.defaults?.memorySearch?.model || 'none',
      subagentModel: cfg.agents?.defaults?.subagents?.model || 'inherited',
      channels: Object.keys(cfg.channels || {}),
      gatewayBind: cfg.gateway?.bind || 'unknown',
      gatewayPort: 18789,
      browser: cfg.browser?.enabled ? 'enabled' : 'disabled',
      browserPath: cfg.browser?.executablePath || 'none',
      compaction: cfg.agents?.defaults?.compaction?.mode || 'off',
      dmPolicy: cfg.channels?.telegram?.dmPolicy || 'open',
      apiKeys,
    };
  } catch { return {}; }
}

function getProjects() {
  const archiveDir = path.join(WORKSPACE, 'archive/old-repo');
  const projects = [];
  try {
    const files = fs.readdirSync(archiveDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const content = fs.readFileSync(path.join(archiveDir, f), 'utf8');
      const title = content.split('\n').find(l => l.startsWith('# '))?.replace('# ', '') || f;
      const sections = content.match(/^## .+/gm)?.map(s => s.replace('## ', '')) || [];
      projects.push({ file: f, title, size: content.length, sections, lineCount: content.split('\n').length });
    }
  } catch {}
  return projects;
}

function readProject(filename) {
  const safe = path.basename(filename);
  const fp = path.join(WORKSPACE, 'archive/old-repo', safe);
  try { return { name: safe, content: fs.readFileSync(fp, 'utf8') }; }
  catch { return { name: safe, content: 'File not found' }; }
}

function getWorkspaceFiles() {
  const important = ['SOUL.md', 'IDENTITY.md', 'USER.md', 'MEMORY.md', 'AGENTS.md', 'TOOLS.md', 'HEARTBEAT.md'];
  return important.map(f => {
    try {
      const stat = fs.statSync(path.join(WORKSPACE, f));
      return { name: f, size: stat.size, modified: stat.mtime, exists: true };
    } catch { return { name: f, exists: false }; }
  });
}

// ── Server ──

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (url.pathname.startsWith('/api/')) {
    if (!auth(req)) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end('{"error":"unauthorized"}'); return; }
    res.setHeader('Content-Type', 'application/json');

    if (url.pathname === '/api/dashboard') {
      res.writeHead(200);
      res.end(JSON.stringify({
        timestamp: new Date().toISOString(),
        system: getSystem(),
        gateway: getGateway(),
        config: getConfig(),
        memory: getMemoryFiles(),
        activity: getActivity(),
        workspace: getWorkspaceFiles(),
        projects: getProjects(),
        identity: { name: 'Fred', emoji: '🔧' },
      }));
      return;
    }

    if (url.pathname === '/api/memory/read') {
      const file = url.searchParams.get('file');
      if (!file) { res.writeHead(400); res.end('{"error":"file param required"}'); return; }
      res.writeHead(200);
      res.end(JSON.stringify(readMemoryFile(file)));
      return;
    }

    if (url.pathname === '/api/project/read') {
      const file = url.searchParams.get('file');
      if (!file) { res.writeHead(400); res.end('{"error":"file param required"}'); return; }
      res.writeHead(200);
      res.end(JSON.stringify(readProject(file)));
      return;
    }

    res.writeHead(404);
    res.end('{"error":"not found"}');
    return;
  }

  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(__dirname, 'public', filePath);
  const ext = path.extname(filePath);
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600' });
    res.end(content);
  } catch {
    if (!ext || ext === '.html') {
      const index = fs.readFileSync(path.join(__dirname, 'public/index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(index);
    } else { res.writeHead(404); res.end('Not found'); }
  }
});

server.listen(PORT, '0.0.0.0', () => console.log(`Fred Dashboard · http://0.0.0.0:${PORT}`));
