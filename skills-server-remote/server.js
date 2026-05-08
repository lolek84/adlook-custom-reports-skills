#!/usr/bin/env node
'use strict';

/**
 * Adlook Skills MCP Server — SSE transport
 *
 * Implements the MCP protocol over HTTP/SSE so Claude Desktop (and any MCP client)
 * can connect to it remotely via mcp-remote.
 *
 * MCP SSE transport:
 *   GET  /sse          — open SSE stream, receive endpoint URL
 *   POST /message      — send JSON-RPC requests
 *   GET  /health       — liveness check (for Render / health monitors)
 *
 * No external dependencies. Works on Node 14+.
 */

const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const crypto = require('crypto');
const url   = require('url');

const PORT       = process.env.PORT || 3000;
const SKILLS_DIR = path.resolve(__dirname, '..', 'skill');
const EN_DIR     = path.join(SKILLS_DIR, 'en');

// ─── Active sessions ──────────────────────────────────────────────────────────
// sessionId → { res: ServerResponse (SSE stream), queue: [] }
const sessions = new Map();

// ─── Skill helpers ─────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  return Object.fromEntries(
    m[1].split('\n')
      .filter(l => l.includes(':'))
      .map(l => { const [k, ...v] = l.split(':'); return [k.trim(), v.join(':').trim()]; })
  );
}

function getSkillList(lang) {
  const dir = lang === 'en' ? EN_DIR : SKILLS_DIR;
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.md') && fs.statSync(path.join(dir, f)).isFile())
      .map(f => {
        const content = fs.readFileSync(path.join(dir, f), 'utf8');
        const fm      = parseFrontmatter(content);
        return { id: f.replace('.md', ''), name: fm.name || f.replace('.md', ''), description: fm.description || '' };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  } catch (_) { return []; }
}

function readSkill(skillId, lang) {
  const dir = lang === 'en' ? EN_DIR : SKILLS_DIR;
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    const match = files.find(f =>
      f === skillId + '.md' || f.startsWith(skillId + '-') || f.replace('.md', '') === skillId
    );
    if (match) return fs.readFileSync(path.join(dir, match), 'utf8');
  } catch (_) {}
  return null;
}

function routeSkill(question) {
  const q = (question || '').toLowerCase();
  const rules = [
    [/underpac|nie dowozi|zero delivery|brak impr|not delivering|no impressions/, 'a02'],
    [/overpac|za szybko|spending too fast|budget.*run out/,                       'a16'],
    [/ctr anomal|ctr spike|fraud|bot|click.*suspicious/,                          'a03'],
    [/viewability.*low|widoczno|audit.*view|visibility.*below/,                   'a04'],
    [/brand.?safety|złe domen|bad domain|blacklist|unsafe/,                       'a06'],
    [/konwersj|roas|roi|conversion|return on ad/,                                 'k07'],
    [/prognoz|forecast|zdążymy|will.*deliver|projection|kiedy skończy/,           'k13'],
    [/optymalizuj budżet|optimize.*budget|realok|reallocat|which.*li.*scale/,     'a18'],
    [/segment odbiorc|audience.*(segment|analy)|które.*group/,                    'a17'],
    [/kreacj.*lepsza|creative.*compar|a\/b.*creative|który.*baner|which.*banner/, 'k11'],
    [/raport końcowy|end.of.campaign|final.*report|zamknij.*kampani/,             'k12'],
    [/prezentacj|deck|slajd|executive summary|bullet.*points/,                    'w05'],
    [/video|wideo|vcr|obejrzeni|completion rate|watch/,                           'k05'],
    [/geo.*perform|które.*miasto.*wynik|city.*efficiency/,                        'a14'],
    [/geo.*zasięg|geographic.*reach|jakie.*miasto|which.*cit/,                    'k10'],
    [/urządzen|device|mobile.*desktop|ctv.*break/,                                'k09'],
    [/tygodniowy|weekly|wow|week.over.week/,                                      'a11'],
    [/frequency|częstotliw|saturacj|frequency.*cap/,                              'a12'],
    [/supply source|ssp.*perform|inventory source/,                               'a08'],
    [/line item audit|li audit|który.*li.*problem/,                               'a13'],
    [/pełny raport|full.*report|campaign.*report|jak.*idzie.*kampani/,            'k01'],
    [/lista.*kampan|aktywne.*kampan|active.*campaign|które.*kampanie/,            'w03'],
    [/budżet.*raport|budget.*report|ile.*wydali|how.*much.*spent/,                'k03'],
    [/poranny|morning.*check|health.*check|daily.*review/,                        'a01'],
    [/co.*to.*jest|co.*znaczy|wyjaśnij|what.*is.*ctr|explain.*metric/,            'w04'],
    [/quick.*status|jak.*idzie|how.*going|one.*number|szybki.*status/,            'w01'],
    [/jaki.*ctr|ile.*impresj|jaki.*viewab|how.*much.*ctr|what.*impressions/,      'w02'],
  ];
  for (const [rx, skill] of rules) if (rx.test(q)) return skill;
  return 'w01';
}

// ─── MCP Tools ─────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'get_skill',
    description: 'Return the full instructions for an Adlook DSP skill. Read the returned text and follow it precisely before answering.',
    inputSchema: {
      type: 'object',
      properties: {
        skill_id: { type: 'string', description: 'Skill code (e.g. "k01", "a02", "w05") or slug (e.g. "k01-campaign-report")' },
        lang:     { type: 'string', enum: ['pl', 'en'], default: 'pl', description: '"pl" Polish (default), "en" English' }
      },
      required: ['skill_id']
    }
  },
  {
    name: 'list_skills',
    description: 'List all available Adlook DSP skills with codes and trigger descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['all', 'k', 'a', 'w'], default: 'all', description: '"k"=client, "a"=AdOps, "w"=shared, "all"=everything' },
        lang:     { type: 'string', enum: ['pl', 'en'], default: 'pl' }
      }
    }
  },
  {
    name: 'route_skill',
    description: 'Route a natural language question to the best Adlook skill and return its full instructions.',
    inputSchema: {
      type: 'object',
      properties: {
        question: { type: 'string', description: "User's question or request about a campaign" },
        lang:     { type: 'string', enum: ['pl', 'en'], default: 'pl' }
      },
      required: ['question']
    }
  }
];

function handleToolCall(name, args) {
  const lang = (args && args.lang) || 'pl';

  if (name === 'get_skill') {
    const content = readSkill(args.skill_id, lang);
    if (!content) return { content: [{ type: 'text', text: `Skill "${args.skill_id}" not found. Use list_skills to discover available skills.` }], isError: true };
    return { content: [{ type: 'text', text: content }] };
  }

  if (name === 'list_skills') {
    const cat    = (args && args.category) || 'all';
    const skills = getSkillList(lang).filter(s => cat === 'all' || s.id.startsWith(cat));
    const lines  = skills.map(s => `• **${s.id}** — ${(s.description || '').slice(0, 120)}`);
    return { content: [{ type: 'text', text: `Adlook skills (${skills.length}, lang=${lang}):\n\n${lines.join('\n')}` }] };
  }

  if (name === 'route_skill') {
    const skillId = routeSkill(args.question);
    const content = readSkill(skillId, lang);
    return {
      content: [{
        type: 'text',
        text: `**Matched skill: ${skillId}**\n\nFollow these instructions for the user's request:\n\n---\n\n${content || 'Skill not found.'}`
      }]
    };
  }

  return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
}

// ─── JSON-RPC dispatcher ───────────────────────────────────────────────────────

function dispatch(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize')
    return { jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'adlook-skills', version: '1.0.0' } } };

  if (method === 'notifications/initialized' || method === 'ping')
    return id != null ? { jsonrpc: '2.0', id, result: {} } : null;

  if (method === 'tools/list')
    return { jsonrpc: '2.0', id, result: { tools: TOOLS } };

  if (method === 'tools/call') {
    try {
      return { jsonrpc: '2.0', id, result: handleToolCall(params.name, params.arguments || {}) };
    } catch (e) {
      return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true } };
    }
  }

  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
}

// ─── SSE helpers ───────────────────────────────────────────────────────────────

function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function sendSSERaw(res, event, dataStr) {
  res.write(`event: ${event}\ndata: ${dataStr}\n\n`);
}

// ─── HTTP server ───────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS — allow all origins so mcp-remote works from any host
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── GET /health ─────────────────────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/health') {
    const skillCount = getSkillList('pl').length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', skills: skillCount, server: 'adlook-skills', version: '1.0.0' }));
    return;
  }

  // ── GET /sse — open SSE stream ───────────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/sse') {
    const sessionId = crypto.randomBytes(8).toString('hex');

    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no'   // needed for nginx proxies (Render)
    });

    sessions.set(sessionId, { res });

    // Send the message endpoint URL to the client (absolute URL required by mcp-remote)
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host  = req.headers['x-forwarded-host'] || req.headers.host;
    const messageUrl = `${proto}://${host}/message?sessionId=${sessionId}`;
    sendSSERaw(res, 'endpoint', messageUrl);

    // Keepalive ping every 25 seconds to prevent Render from closing idle connections
    const keepalive = setInterval(() => {
      try { res.write(': ping\n\n'); } catch (_) { clearInterval(keepalive); }
    }, 25000);

    req.on('close', () => {
      clearInterval(keepalive);
      sessions.delete(sessionId);
    });

    return;
  }

  // ── POST /message — receive JSON-RPC ─────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/message') {
    const sessionId = parsed.query.sessionId;
    const session   = sessions.get(sessionId);

    if (!session) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const msg      = JSON.parse(body);
        const response = dispatch(msg);

        // Acknowledge the POST immediately
        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end('{}');

        // Send response via SSE stream (if there is one)
        if (response) {
          try { sendSSERaw(session.res, 'message', JSON.stringify(response)); }
          catch (_) { sessions.delete(sessionId); }
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

    return;
  }

  // ── 404 ──────────────────────────────────────────────────────────────────────
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', paths: ['/sse', '/message', '/health'] }));
});

server.listen(PORT, () => {
  console.log(`Adlook Skills MCP server running on port ${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Skills loaded: ${getSkillList('pl').length} PL, ${getSkillList('en').length} EN`);
});
