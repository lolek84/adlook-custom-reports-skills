#!/usr/bin/env node
'use strict';

/**
 * Adlook Skills MCP Server
 * Exposes skill prompts from skill/ directory as MCP tools.
 * Runs over stdio — compatible with Claude Desktop (Node 14+, no external deps).
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BASE_DIR = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(BASE_DIR, 'skill');
const SKILLS_EN_DIR = path.join(BASE_DIR, 'skill', 'en');

// ─── Skill helpers ────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) fm[key.trim()] = rest.join(':').trim();
  });
  return fm;
}

function getSkillList(lang) {
  const dir = lang === 'en' ? SKILLS_EN_DIR : SKILLS_DIR;
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.md') && !fs.statSync(path.join(dir, f)).isDirectory())
      .map(f => {
        const content = fs.readFileSync(path.join(dir, f), 'utf8');
        const fm = parseFrontmatter(content);
        return { id: f.replace('.md', ''), name: fm.name || f.replace('.md', ''), description: fm.description || '', file: f };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  } catch (e) {
    return [];
  }
}

function readSkill(skillId, lang) {
  const dir = lang === 'en' ? SKILLS_EN_DIR : SKILLS_DIR;
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    const match = files.find(f =>
      f === skillId + '.md' ||
      f.startsWith(skillId + '-') ||
      f.replace('.md', '') === skillId
    );
    if (match) return fs.readFileSync(path.join(dir, match), 'utf8');
  } catch (e) { /* dir missing */ }
  return null;
}

function routeSkill(question) {
  const q = question.toLowerCase();
  if (/underpac|nie dowozi|zero delivery|brak impr|not delivering|no impressions/.test(q)) return 'a02';
  if (/overpac|za szybko|spending too fast|budget.*run out/.test(q)) return 'a16';
  if (/ctr anomal|ctr spike|fraud|bot|click.*suspicious/.test(q)) return 'a03';
  if (/viewability.*low|widoczno|audit.*view|visibility.*below/.test(q)) return 'a04';
  if (/brand.?safety|złe domen|bad domain|blacklist|unsafe/.test(q)) return 'a06';
  if (/konwersj|roas|roi|conversion|return on ad/.test(q)) return 'k07';
  if (/prognoz|forecast|zdążymy|will.*deliver|projection|kiedy skończy/.test(q)) return 'k13';
  if (/optymalizuj budżet|optimize.*budget|realok|reallocat|which.*li.*scale/.test(q)) return 'a18';
  if (/segment odbiorc|audience.*(segment|analy)|które.*group/.test(q)) return 'a17';
  if (/kreacj.*lepsza|creative.*compar|a\/b.*creative|który.*baner|which.*banner/.test(q)) return 'k11';
  if (/raport końcowy|end.of.campaign|final.*report|zamknij.*kampani/.test(q)) return 'k12';
  if (/prezentacj|deck|slajd|executive summary|bullet.*points/.test(q)) return 'w05';
  if (/video|wideo|vcr|obejrzeni|completion rate|watch/.test(q)) return 'k05';
  if (/geo.*zasięg|geographic.*reach|jakie.*miasto|which.*cit|gdzie.*polska/.test(q)) return 'k10';
  if (/geo.*perform|które.*miasto.*wynik|city.*efficiency|budget.*miasto/.test(q)) return 'a14';
  if (/urządzen|device|mobile.*desktop|ctvbreak/.test(q)) return 'k09';
  if (/tygodniowy|weekly|wow|week.over.week/.test(q)) return 'a11';
  if (/frequency|częstotliw|saturacj|frequency.*cap/.test(q)) return 'a12';
  if (/supply source|ssp.*perform|inventory source/.test(q)) return 'a08';
  if (/line item audit|li audit|który.*li.*problem/.test(q)) return 'a13';
  if (/pełny raport|full.*report|campaign.*report|jak.*idzie.*kampani/.test(q)) return 'k01';
  if (/lista.*kampan|aktywne.*kampan|active.*campaign|które.*kampanie/.test(q)) return 'w03';
  if (/budżet.*raport|budget.*report|ile.*wydali|how.*much.*spent/.test(q)) return 'k03';
  if (/poranny|morning.*check|health.*check|daily.*review/.test(q)) return 'a01';
  if (/co.*to.*jest|co.*znaczy|wyjaśnij|what.*is.*ctr|explain.*metric/.test(q)) return 'w04';
  if (/quick.*status|jak.*idzie|how.*going|one.*number|szybki.*status/.test(q)) return 'w01';
  if (/jaki.*ctr|ile.*impresj|jaki.*viewab|how.*much.*ctr|what.*impressions/.test(q)) return 'w02';
  return 'w01'; // default: quick status
}

// ─── MCP Tools definition ─────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'get_skill',
    description:
      'Retrieve the full instructions for an Adlook DSP skill. ' +
      'Returns the complete skill prompt — read it and follow it precisely. ' +
      'Use skill codes like "k01", "a02", "w01" or full names like "k01-campaign-report".',
    inputSchema: {
      type: 'object',
      properties: {
        skill_id: {
          type: 'string',
          description: 'Skill code (e.g. "k01", "a02", "w05") or full slug (e.g. "k01-raport-z-kampanii")'
        },
        lang: {
          type: 'string',
          enum: ['pl', 'en'],
          description: 'Language: "pl" Polish (default), "en" English',
          default: 'pl'
        }
      },
      required: ['skill_id']
    }
  },
  {
    name: 'list_skills',
    description:
      'List all available Adlook DSP skills with codes, names and trigger descriptions. ' +
      'Use to discover which skill handles a given user request.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['all', 'k', 'a', 'w'],
          description: '"k" = client reports, "a" = AdOps tools, "w" = shared, "all" = everything (default)',
          default: 'all'
        },
        lang: {
          type: 'string',
          enum: ['pl', 'en'],
          default: 'pl'
        }
      }
    }
  },
  {
    name: 'route_skill',
    description:
      'Determine which skill best matches a user question and return its full instructions. ' +
      'Handles routing automatically — no need to know skill codes.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: "The user's question or request about a campaign"
        },
        lang: {
          type: 'string',
          enum: ['pl', 'en'],
          default: 'pl'
        }
      },
      required: ['question']
    }
  }
];

// ─── Request handlers ─────────────────────────────────────────────────────────

function handleToolCall(name, args) {
  if (name === 'get_skill') {
    const lang = args.lang || 'pl';
    const content = readSkill(args.skill_id, lang);
    if (!content) {
      return {
        content: [{
          type: 'text',
          text: `Skill "${args.skill_id}" not found.\n\nUse list_skills to see available skills.`
        }],
        isError: true
      };
    }
    return { content: [{ type: 'text', text: content }] };
  }

  if (name === 'list_skills') {
    const lang = args && args.lang || 'pl';
    const cat  = args && args.category || 'all';
    const skills = getSkillList(lang).filter(s => cat === 'all' || s.id.startsWith(cat));
    const lines  = skills.map(s => `• **${s.id}** — ${(s.description || '').slice(0, 120)}`);
    return {
      content: [{
        type: 'text',
        text: `Adlook skills (${skills.length}, lang=${lang}):\n\n${lines.join('\n')}`
      }]
    };
  }

  if (name === 'route_skill') {
    const lang    = args.lang || 'pl';
    const skillId = routeSkill(args.question || '');
    const content = readSkill(skillId, lang);
    return {
      content: [{
        type: 'text',
        text: `**Skill: ${skillId}**\n\nRead the instructions below and follow them for the user's request.\n\n---\n\n${content || 'Skill not found.'}`
      }]
    };
  }

  return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
}

function handleMessage(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0', id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'adlook-skills', version: '1.0.0' }
      }
    };
  }

  if (method === 'notifications/initialized') return null;
  if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };

  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
  }

  if (method === 'tools/call') {
    try {
      const result = handleToolCall(params.name, params.arguments || {});
      return { jsonrpc: '2.0', id, result };
    } catch (e) {
      return {
        jsonrpc: '2.0', id,
        result: { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true }
      };
    }
  }

  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
}

// ─── Stdio loop ───────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', line => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const msg      = JSON.parse(trimmed);
    const response = handleMessage(msg);
    if (response) process.stdout.write(JSON.stringify(response) + '\n');
  } catch (_) {
    // ignore malformed JSON
  }
});

process.on('SIGINT', () => process.exit(0));
