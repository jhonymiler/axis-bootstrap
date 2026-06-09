import { text, multiselect, select, confirm, spinner, note, log, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { TEMPLATES, exists, read, write, ensureDir } from '../lib/paths.js';
import { detectLocale, t } from '../lib/i18n.js';
import { detectProject } from '../lib/detect.js';
import { copyDir } from '../lib/copy.js';

const IDES = [
  { value: 'claude', label: 'Claude Code', hint: '.claude/' },
  { value: 'cursor', label: 'Cursor', hint: '.cursor/' },
  { value: 'agents', label: 'Generic agents (Windsurf, etc.)', hint: '.agents/' },
  { value: 'github', label: 'GitHub Copilot', hint: '.github/' },
];

const SPDD_SKILLS = [
  { value: 'story-decompose', label: 'story-decompose', hint: 'fills R' },
  { value: 'alignment', label: 'alignment', hint: 'fills O + N + S₂' },
  { value: 'abstraction-first', label: 'abstraction-first', hint: 'fills E + A + S₁' },
  { value: 'iterative-review', label: 'iterative-review', hint: 'Track A/B' },
];

// Non-interactive presets — use with `axis init --preset <name>`.
// Each preset captures the answers that the quick path would otherwise ask interactively.
const PRESETS = {
  node: { stack: 'Node.js + TypeScript', ides: ['claude', 'agents'], spdd: ['story-decompose', 'alignment', 'abstraction-first', 'iterative-review'], constitutional: 'node' },
  python: { stack: 'Python', ides: ['claude', 'agents'], spdd: ['story-decompose', 'alignment', 'abstraction-first', 'iterative-review'], constitutional: 'python' },
  go: { stack: 'Go', ides: ['claude', 'agents'], spdd: ['story-decompose', 'alignment', 'abstraction-first', 'iterative-review'], constitutional: 'go' },
  docs: { stack: '(non-software / docs)', ides: ['claude', 'agents'], spdd: ['alignment', 'iterative-review'], constitutional: 'generic' },
  minimal: { stack: '', ides: ['claude'], spdd: [], constitutional: null },
};

// Heuristic: pick a constitutional file from a free-form stack string (used by
// the interactive quickBootstrap path). Returns 'node' | 'python' | 'go' | 'generic'.
function constitutionalForStack(stack) {
  const s = (stack || '').toLowerCase();
  if (/\b(node|typescript|javascript|\bts\b|\bjs\b|nest|next)\b/.test(s)) return 'node';
  if (/\b(python|django|flask|fastapi)\b/.test(s)) return 'python';
  if (/\b(go|golang)\b/.test(s)) return 'go';
  return 'generic';
}

function parseFlags(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { flags[key] = next; i++; }
      else flags[key] = true;
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

export async function init(argv) {
  const { positional, flags } = parseFlags(argv);
  const target = path.resolve(positional[0] || process.cwd());

  // --rebootstrap: install axis-rebootstrap skill into an existing bootstrapped project
  if (flags.rebootstrap) {
    return rebootstrapInstall(target);
  }

  // Non-interactive preset path — short-circuit prompts.
  if (flags.preset) {
    const preset = PRESETS[flags.preset];
    if (!preset) {
      log.error(`Unknown preset: ${pc.red(flags.preset)}. Available: ${Object.keys(PRESETS).join(', ')}`);
      process.exit(1);
    }
    const locale = flags.lang === 'pt' ? 'pt' : 'en';
    const name = flags.name || path.basename(target);
    const purpose = flags.purpose || `${name} project bootstrapped by axis preset ${flags.preset}`;
    return presetBootstrap(target, locale, { name, purpose, ...preset }, flags);
  }

  // 1. Pick language (auto-detect, ask once)
  const detected = detectLocale();
  let locale = detected;
  const langChoice = await select({
    message: t(detected, 'pickLang'),
    options: [
      { value: 'en', label: t(detected, 'langEN') },
      { value: 'pt', label: t(detected, 'langPT') },
    ],
    initialValue: detected,
  });
  if (isCancel(langChoice)) return cancel(t(detected, 'aborted'));
  locale = langChoice;
  const T = (k) => t(locale, k);

  // 2. Detect project state
  const detection = detectProject(target);
  log.info(`${T('target')}: ${pc.cyan(target)}`);

  if (detection.state === 'already-bootstrapped') {
    log.warn(T('detectedAlreadyBootstrapped'));
    const cont = await confirm({ message: T('overwrite'), initialValue: false });
    if (isCancel(cont) || !cont) return cancel(T('abortedAlready'));
  }

  if (detection.state === 'existing-software' || detection.state === 'existing-other') {
    const lines = [pc.bold(T('detectedExisting'))];
    if (detection.stackHints.length) {
      lines.push('', pc.dim(`Markers: ${detection.stackHints.join(', ')}`));
    }
    if (detection.topFiles.length) {
      lines.push(pc.dim(`Top files: ${detection.topFiles.slice(0, 8).join(', ')}`));
    }
    note(lines.join('\n'), T('bootstrapPlan'));
  } else {
    note(T('detectedEmpty'), T('bootstrapPlan'));
  }

  // 3. Pick mode (default: AI for existing projects, quick for empty)
  const defaultMode = detection.state === 'empty' ? 'quick' : 'ai';
  const mode = await select({
    message: T('pickMode'),
    options: [
      { value: 'ai', label: T('modeAI') },
      { value: 'quick', label: T('modeQuick') },
      { value: 'audit', label: T('modeAudit') },
    ],
    initialValue: defaultMode,
  });
  if (isCancel(mode)) return cancel(T('aborted'));

  if (mode === 'audit') {
    const { audit } = await import('./audit.js');
    return audit([target]);
  }

  if (mode === 'ai') {
    return aiBootstrap(target, locale);
  }

  return quickBootstrap(target, locale);
}

// Permanent skills shipped to every bootstrapped project. Flattened templates
// (cli/templates/skills/<name>.md) install as .ai/skills/<name>/SKILL.md;
// dir-form templates install as .ai/skills/<name>/.
const FLAT_SKILLS = ['alignment', 'abstraction-first', 'story-decompose', 'iterative-review', 'axis-remember', 'axis-evolve'];
const DIR_SKILLS = [['delta-skill', 'axis-delta'], ['specify-skill', 'axis-specify']];

function installPermanentSkills(target) {
  const skillsRoot = path.join(target, '.ai', 'skills');
  for (const name of FLAT_SKILLS) {
    const src = path.join(TEMPLATES, 'skills', `${name}.md`);
    if (!exists(src)) continue;
    const destDir = path.join(skillsRoot, name);
    ensureDir(destDir);
    fs.copyFileSync(src, path.join(destDir, 'SKILL.md'));
  }
  for (const [tpl, name] of DIR_SKILLS) {
    copyDir(path.join(TEMPLATES, tpl), path.join(skillsRoot, name));
  }
}

/**
 * AI-driven path: copy axis-bootstrap skill bundle, print trigger phrase.
 * The agent does the real discovery + generation.
 */
async function aiBootstrap(target, locale) {
  const T = (k) => t(locale, k);

  const s = spinner();
  s.start(T('aiInstalling'));

  // Create minimal scaffolding so the agent has a place to put .ai/
  ensureDir(path.join(target, '.ai', 'skills'));
  ensureDir(path.join(target, '.ai', 'docs'));

  // Copy bootstrap skill bundle (temporary — removed at cleanup)
  copyDir(path.join(TEMPLATES, 'bootstrap-skill'), path.join(target, '.ai', 'skills', 'axis-bootstrap'));

  // Install the permanent skills + persistent agents. These survive cleanup —
  // only axis-bootstrap (with its transient discoverers) is removed at the end.
  installPermanentSkills(target);
  copyDir(path.join(TEMPLATES, 'agents'), path.join(target, '.ai', 'agents'));

  // Drop minimal CLAUDE.md / AGENTS.md pointing the agent to the skill
  const stub = stubInstructions(locale);
  if (!exists(path.join(target, '.ai', 'INSTRUCTIONS.md'))) {
    write(path.join(target, '.ai', 'INSTRUCTIONS.md'), stub);
  }
  // Root entry points (actual files for now — symlinks come after Phase 3 of the bootstrap)
  if (!exists(path.join(target, 'CLAUDE.md'))) {
    write(path.join(target, 'CLAUDE.md'), stub);
  }
  if (!exists(path.join(target, 'AGENTS.md'))) {
    write(path.join(target, 'AGENTS.md'), stub);
  }

  s.stop(pc.green('✓ ' + T('aiInstalling').replace('…', ' ' + T('done'))));

  note(
    [
      pc.bold(T('aiOpenAgent')),
      '',
      pc.bold(T('aiTrigger')),
      '',
      pc.cyan('  ' + T('aiTriggerText')),
      '',
      pc.bold(T('aiCleanupAuto')),
    ].join('\n'),
    T('aiNextSteps')
  );
}

function stubInstructions(locale) {
  if (locale === 'pt') {
    return `# Instruções para o Agente — Bootstrap pendente

> Este projeto está usando o **AXIS Framework**. O scaffold mínimo já existe; o trabalho real (gerar skills, rules, docs customizados) cabe a você, agente de IA.

## Sua tarefa agora

1. Carregue a skill em [.ai/skills/axis-bootstrap/SKILL.md](.ai/skills/axis-bootstrap/SKILL.md)
2. Siga o [PLANNER.md](.ai/skills/axis-bootstrap/PLANNER.md) na ordem
3. **Antes de qualquer pergunta:** leia README, package.json (ou equivalente), e estrutura de arquivos do projeto
4. Pause e peça confirmação entre cada Phase

## Cleanup automático

Após a Phase 5 (Validação), remova automaticamente a skill axis-bootstrap:

\`\`\`bash
rm -rf .ai/skills/axis-bootstrap
\`\`\`

Isso é o Step 5.5 do PLANNER — a skill já cumpriu seu papel e o projeto fica autossuficiente. Se o CLI \`axis\` estiver disponível, rode \`axis cleanup\` (faz o mesmo com confirmação).

## Regras invioláveis

- Nunca invente: se faltar informação, pergunte
- Nunca pule fases: cada uma tem gate explícito
- Nunca duplique conteúdo entre arquivos: use links e symlinks
`;
  }
  return `# Agent Instructions — Bootstrap pending

> This project is using the **AXIS Framework**. Minimal scaffolding is in place; the real work (generating customized skills, rules, docs) is your job, AI agent.

## Your task now

1. Load the skill at [.ai/skills/axis-bootstrap/SKILL.md](.ai/skills/axis-bootstrap/SKILL.md)
2. Follow [PLANNER.md](.ai/skills/axis-bootstrap/PLANNER.md) in order
3. **Before any question:** read the README, package.json (or equivalent), and the project file tree
4. Pause for explicit confirmation between phases

## Auto-cleanup

After Phase 5 (Validation), automatically remove the axis-bootstrap skill:

\`\`\`bash
rm -rf .ai/skills/axis-bootstrap
\`\`\`

This is Step 5.5 of the PLANNER — the skill has done its job and the project becomes self-sufficient. If the \`axis\` CLI is available, run \`axis cleanup\` instead (same result, with confirmation).

## Inviolable rules

- Never fabricate: if information is missing, ask
- Never skip phases: each has an explicit gate
- Never duplicate content across files: use links and symlinks
`;
}

/**
 * --rebootstrap: installs axis-rebootstrap skill into an existing bootstrapped project.
 * The skill itself orchestrates the 5-phase upgrade; the CLI just drops the files.
 */
async function rebootstrapInstall(target) {
  const instructionsPath = path.join(target, '.ai', 'INSTRUCTIONS.md');
  if (!fs.existsSync(instructionsPath)) {
    log.error(`${pc.red('✗')} No .ai/INSTRUCTIONS.md found at ${target}`);
    log.error('  This target does not appear to be an AXIS-bootstrapped project.');
    log.error('  Run `axis init` first to bootstrap, then `axis init --rebootstrap` to upgrade.');
    process.exit(1);
  }

  const rebootstrapSrc = path.join(TEMPLATES, 'rebootstrap-skill');
  if (!fs.existsSync(rebootstrapSrc)) {
    log.error(`${pc.red('✗')} rebootstrap-skill template not found. CLI may be outdated.`);
    process.exit(1);
  }

  const s = spinner();
  s.start('Installing axis-rebootstrap skill…');

  ensureDir(path.join(target, '.ai', 'skills', 'axis-rebootstrap'));
  copyDir(rebootstrapSrc, path.join(target, '.ai', 'skills', 'axis-rebootstrap'));

  s.stop(pc.green('✓ axis-rebootstrap skill installed'));

  note(
    [
      pc.bold('Skill installed at .ai/skills/axis-rebootstrap/'),
      '',
      pc.bold('To start the upgrade, open your AI agent and say:'),
      '',
      pc.cyan('  "Load the skill at .ai/skills/axis-rebootstrap/SKILL.md and begin the re-bootstrap."'),
      '',
      pc.dim('The skill will guide you through 5 phases: backup → diff → apply → consolidate → validate.'),
    ].join('\n'),
    'AXIS Re-bootstrap ready'
  );
}

/**
 * Quick path: interactive scaffold without AI.
 * Good for new projects where the user already knows the stack.
 */
async function quickBootstrap(target, locale) {
  const T = (k) => t(locale, k);

  const name = await text({
    message: T('askName'),
    placeholder: path.basename(target),
    defaultValue: path.basename(target),
  });
  if (isCancel(name)) return cancel(T('aborted'));

  const purpose = await text({
    message: T('askPurpose'),
    placeholder: T('askPurposeHint'),
    validate: (v) => (v && v.length > 5 ? undefined : T('askPurposeShort')),
  });
  if (isCancel(purpose)) return cancel(T('aborted'));

  const stack = await text({
    message: T('askStack'),
    placeholder: T('askStackHint'),
    defaultValue: '',
  });
  if (isCancel(stack)) return cancel(T('aborted'));

  const ides = await multiselect({
    message: T('askIDEs'),
    options: IDES,
    initialValues: ['claude', 'agents'],
    required: true,
  });
  if (isCancel(ides)) return cancel(T('aborted'));

  const spddSkills = await multiselect({
    message: T('askSpdd') + ' ' + pc.dim('— ' + T('askSpddHint')),
    options: SPDD_SKILLS,
    initialValues: SPDD_SKILLS.map((s) => s.value),
    required: false,
  });
  if (isCancel(spddSkills)) return cancel(T('aborted'));

  const s = spinner();
  s.start(T('quickScaffolding'));

  ensureDir(path.join(target, '.ai', 'skills'));
  ensureDir(path.join(target, '.ai', 'rules'));
  ensureDir(path.join(target, '.ai', 'docs'));

  const replace = (content) =>
    content
      .replace(/{{PROJECT_NAME}}/g, name)
      .replace(/{{PROJECT_PURPOSE}}/g, purpose)
      .replace(/{{STACK}}/g, stack || (locale === 'pt' ? '(não-software)' : '(non-software)'));

  write(path.join(target, '.ai', 'INSTRUCTIONS.md'), replace(read(path.join(TEMPLATES, 'INSTRUCTIONS.md'))));
  write(path.join(target, '.ai', 'CONVENTIONS.md'), replace(read(path.join(TEMPLATES, 'CONVENTIONS.md'))));
  write(path.join(target, '.ai', 'docs', 'STATE.md'), replace(read(path.join(TEMPLATES, 'STATE.md'))));
  s.message(T('quickSpecReady'));

  // SPDD skills
  for (const skill of spddSkills) {
    const skillDir = path.join(target, '.ai', 'skills', skill);
    ensureDir(skillDir);
    const src = path.join(TEMPLATES, 'skills', `${skill}.md`);
    if (exists(src)) {
      fs.copyFileSync(src, path.join(skillDir, 'SKILL.md'));
    }
  }

  // documentation-guardian skill (always installed — self-maintenance kit)
  const guardianSrc = path.join(TEMPLATES, 'skills', 'documentation-guardian');
  if (fs.existsSync(guardianSrc)) {
    copyDir(guardianSrc, path.join(target, '.ai', 'skills', 'documentation-guardian'));
  }

  // F9 — axis-delta skill (always installed; activates on brownfield triggers)
  const deltaSrc = path.join(TEMPLATES, 'delta-skill');
  if (fs.existsSync(deltaSrc)) {
    copyDir(deltaSrc, path.join(target, '.ai', 'skills', 'axis-delta'));
  }

  // F12 — axis-specify skill (always installed; activates on greenfield triggers)
  const specifySrc = path.join(TEMPLATES, 'specify-skill');
  if (fs.existsSync(specifySrc)) {
    copyDir(specifySrc, path.join(target, '.ai', 'skills', 'axis-specify'));
  }

  // Persistent agents (challengers, specialist templates, debates scaffold) —
  // surfaced via the .claude/agents symlink created by setup-ide-links.sh.
  copyDir(path.join(TEMPLATES, 'agents'), path.join(target, '.ai', 'agents'));

  // F14 — axis.config.json (workflow policy read by the agent, not by CLI)
  const configSrc = path.join(TEMPLATES, 'axis.config.json');
  if (fs.existsSync(configSrc)) {
    fs.copyFileSync(configSrc, path.join(target, 'axis.config.json'));
  }

  // Default rule: session-start only (always-on baseline).
  // Other rules (engineering-discipline, context-economy, knowledge-verification) are opt-in:
  //   axis rules add <name>   (coming soon) or copy manually from the AXIS templates.
  const rulesSrc = path.join(TEMPLATES, 'rules');
  const defaultRules = ['session-start.md'];
  if (fs.existsSync(rulesSrc)) {
    for (const f of defaultRules) {
      const src = path.join(rulesSrc, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(target, '.ai', 'rules', f));
    }
    // F10 — constitutional rules: heuristic pick from the free-form stack string
    const cKind = constitutionalForStack(stack);
    const cSrc = path.join(rulesSrc, `constitutional-${cKind}.md`);
    if (fs.existsSync(cSrc)) {
      fs.copyFileSync(cSrc, path.join(target, '.ai', 'rules', 'constitutional.md'));
    }
  }

  // Self-maintenance scripts and hooks (F4B — zero axis dependency post-bootstrap)
  ensureDir(path.join(target, 'scripts'));
  const hooksSrc = path.join(TEMPLATES, 'hooks');
  if (fs.existsSync(hooksSrc)) {
    for (const f of ['_lib.sh', 'post-spec-edit.sh', 'post-code-change.sh', 'session-start.sh', 'stop.sh', 'constitutional-check.sh', 'validate-commit-msg.sh', 'sync-cursor-rules.sh']) {
      const hSrc = path.join(hooksSrc, f);
      if (fs.existsSync(hSrc)) {
        const hDst = path.join(target, 'scripts', f);
        fs.copyFileSync(hSrc, hDst);
        fs.chmodSync(hDst, 0o755);
      }
    }
  }

  // PR template (scaffolded for projects with git — agent customizes in Phase 3)
  const prTemplateSrc = path.join(TEMPLATES, 'github', 'PULL_REQUEST_TEMPLATE.md');
  if (fs.existsSync(prTemplateSrc)) {
    ensureDir(path.join(target, '.github'));
    const prDst = path.join(target, '.github', 'PULL_REQUEST_TEMPLATE.md');
    if (!fs.existsSync(prDst)) {
      fs.copyFileSync(prTemplateSrc, prDst);
    }
  }
  const selfMaintSrc = path.join(TEMPLATES, 'scripts-self-maint');
  if (fs.existsSync(selfMaintSrc)) {
    for (const f of fs.readdirSync(selfMaintSrc)) {
      if (f.endsWith('.sh')) {
        const sDst = path.join(target, 'scripts', f);
        fs.copyFileSync(path.join(selfMaintSrc, f), sDst);
        fs.chmodSync(sDst, 0o755);
      }
    }
  }

  // Harness
  if (ides.includes('claude')) {
    ensureDir(path.join(target, '.claude'));
    write(path.join(target, '.claude', 'settings.json'), read(path.join(TEMPLATES, 'settings.json')));
  }
  s.message(T('quickHarnessReady'));

  // setup-ide-links.sh
  write(path.join(target, 'setup-ide-links.sh'), read(path.join(TEMPLATES, 'setup-ide-links.sh')));
  fs.chmodSync(path.join(target, 'setup-ide-links.sh'), 0o755);

  // Stamp .axis-version for future rebootstrap operations
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const cliVersion = require(path.join(TEMPLATES, '..', 'package.json')).version;
  write(path.join(target, '.ai', '.axis-version'), cliVersion + '\n');

  s.message(T('quickInstallerReady'));

  if (process.platform === 'win32') {
    s.stop(T('quickDoneScaffolding'));
    log.warn(`${pc.yellow('⚠')} ${T('presetWindowsSkip')}`);
    log.warn(`  ${T('presetWindowsHint')}`);
  } else {
    try {
      execSync('bash setup-ide-links.sh', { cwd: target, stdio: 'pipe' });
      s.stop(T('quickSymlinksInstalled'));
    } catch {
      s.stop(T('quickDoneScaffolding'));
      log.warn(T('quickRunLink'));
    }
  }

  const created = [
    '.ai/INSTRUCTIONS.md',
    '.ai/CONVENTIONS.md',
    '.ai/docs/STATE.md',
    `.ai/skills/ (${spddSkills.length} SPDD + axis-delta + axis-specify + documentation-guardian)`,
    'scripts/ (hooks + self-maint + commit validation)',
    '.github/PULL_REQUEST_TEMPLATE.md',
    'axis.config.json',
    'setup-ide-links.sh',
    ...(ides.includes('claude') ? ['.claude/settings.json'] : []),
    'AGENTS.md → .ai/INSTRUCTIONS.md',
    'CLAUDE.md → .ai/INSTRUCTIONS.md',
  ];
  note(created.map((c) => pc.green('+ ') + c).join('\n'), T('quickCreated'));

  note(
    [
      `${pc.bold('1.')} ${T('quickNext1')}`,
      `${pc.bold('2.')} ${T('quickNext2')}`,
      `${pc.bold('3.')} ${T('quickNext3')}`,
      `${pc.bold('4.')} ${T('quickNext4')}`,
    ].join('\n'),
    locale === 'pt' ? 'Próximos passos' : 'Next steps'
  );
}

/**
 * Compute every file presetBootstrap intends to write, given the resolved cfg.
 * Used upfront to detect collisions with existing files before any disk write.
 */
function presetTargetFiles(target, cfg) {
  const files = [
    path.join(target, '.ai', 'INSTRUCTIONS.md'),
    path.join(target, '.ai', 'CONVENTIONS.md'),
    path.join(target, '.ai', 'docs', 'STATE.md'),
    path.join(target, 'setup-ide-links.sh'),
  ];
  for (const skill of cfg.spdd) {
    files.push(path.join(target, '.ai', 'skills', skill, 'SKILL.md'));
  }
  const rulesSrc = path.join(TEMPLATES, 'rules');
  if (fs.existsSync(rulesSrc)) {
    for (const f of fs.readdirSync(rulesSrc)) {
      // constitutional-<stack>.md are template variants picked one-of; the
      // landed file is always .ai/rules/constitutional.md (handled below).
      if (f.endsWith('.md') && !f.startsWith('constitutional-')) {
        files.push(path.join(target, '.ai', 'rules', f));
      }
    }
  }
  if (cfg.constitutional) {
    files.push(path.join(target, '.ai', 'rules', 'constitutional.md'));
  }
  // documentation-guardian skill
  const guardianSrc = path.join(TEMPLATES, 'skills', 'documentation-guardian');
  if (fs.existsSync(guardianSrc)) {
    for (const f of fs.readdirSync(guardianSrc)) {
      files.push(path.join(target, '.ai', 'skills', 'documentation-guardian', f));
    }
  }
  // F9 — axis-delta skill bundle (SKILL.md + references/)
  const deltaTplSrc = path.join(TEMPLATES, 'delta-skill');
  if (fs.existsSync(deltaTplSrc)) {
    files.push(path.join(target, '.ai', 'skills', 'axis-delta', 'SKILL.md'));
    const dRefs = path.join(deltaTplSrc, 'references');
    if (fs.existsSync(dRefs)) {
      for (const f of fs.readdirSync(dRefs)) {
        files.push(path.join(target, '.ai', 'skills', 'axis-delta', 'references', f));
      }
    }
  }
  // F12 — axis-specify skill bundle (SKILL.md + references/)
  const specifyTplSrc = path.join(TEMPLATES, 'specify-skill');
  if (fs.existsSync(specifyTplSrc)) {
    files.push(path.join(target, '.ai', 'skills', 'axis-specify', 'SKILL.md'));
    const sRefs = path.join(specifyTplSrc, 'references');
    if (fs.existsSync(sRefs)) {
      for (const f of fs.readdirSync(sRefs)) {
        files.push(path.join(target, '.ai', 'skills', 'axis-specify', 'references', f));
      }
    }
  }
  // Persistent agents (challengers, specialist templates, debates scaffold)
  const agentsTplSrc = path.join(TEMPLATES, 'agents');
  const walkAgents = (src, dest) => {
    if (!fs.existsSync(src)) return;
    for (const e of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, e.name);
      const d = path.join(dest, e.name);
      if (e.isDirectory()) walkAgents(s, d);
      else files.push(d);
    }
  };
  walkAgents(agentsTplSrc, path.join(target, '.ai', 'agents'));
  // hooks and self-maint scripts
  for (const f of ['post-spec-edit.sh', 'post-code-change.sh', '_lib.sh', 'session-start.sh', 'stop.sh', 'constitutional-check.sh', 'validate-commit-msg.sh', 'sync-cursor-rules.sh']) {
    if (fs.existsSync(path.join(TEMPLATES, 'hooks', f))) {
      files.push(path.join(target, 'scripts', f));
    }
  }
  // PR template
  if (fs.existsSync(path.join(TEMPLATES, 'github', 'PULL_REQUEST_TEMPLATE.md'))) {
    files.push(path.join(target, '.github', 'PULL_REQUEST_TEMPLATE.md'));
  }
  const selfMaintSrc = path.join(TEMPLATES, 'scripts-self-maint');
  if (fs.existsSync(selfMaintSrc)) {
    for (const f of fs.readdirSync(selfMaintSrc)) {
      if (f.endsWith('.sh')) files.push(path.join(target, 'scripts', f));
    }
  }
  if (cfg.ides.includes('claude')) {
    files.push(path.join(target, '.claude', 'settings.json'));
  }
  // F14 — axis.config.json (always landed; sits at project root)
  if (fs.existsSync(path.join(TEMPLATES, 'axis.config.json'))) {
    files.push(path.join(target, 'axis.config.json'));
  }
  return files;
}

function backupTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
}

/**
 * Non-interactive preset path — same artifacts as quickBootstrap but no prompts.
 * Used by `axis init --preset <name>` for CI, scripted bootstraps, and reproducibility.
 *
 * Defensive defaults (F1.1):
 *   - Aborts if existing files would be overwritten, unless --force or --backup is given
 *   - --backup creates `<file>.axis-bak-<ISO-timestamp>` copies before writing
 *   - --force overwrites with a loud warning (no backup)
 *   - --dry-run prints the plan without writing anything
 *
 * Platform guard (F1.4):
 *   - On win32, `bash setup-ide-links.sh` is skipped with manual-recovery hint
 */
async function presetBootstrap(target, locale, cfg, flags) {
  const T = (k) => t(locale, k);
  const { name, purpose, stack, ides, spdd } = cfg;

  // F2.4 — banner-level warning so the destructive nature of --preset is visible
  log.warn(`${pc.yellow('⚠')}  ${T('presetGreenfieldWarn')}`);

  // F1.2 — show detection result before any write
  const detection = detectProject(target);
  log.info(`${T('presetDetected')}: ${pc.cyan(detection.state)}` +
    (detection.stackHints.length ? pc.dim(` (${detection.stackHints.join(', ')})`) : ''));

  // F1.1 — compute collisions upfront
  const targetFiles = presetTargetFiles(target, cfg);
  const collisions = targetFiles.filter((p) => fs.existsSync(p));

  // --dry-run: list the plan and exit
  if (flags['dry-run']) {
    const fresh = targetFiles.filter((p) => !collisions.includes(p));
    note(
      [
        pc.bold(T('presetDryRunCreate') + `: ${fresh.length}`),
        ...fresh.map((p) => pc.green('  + ') + path.relative(target, p)),
        ...(collisions.length
          ? ['', pc.bold(pc.yellow(T('presetDryRunOverwrite') + `: ${collisions.length}`)),
            ...collisions.map((p) => pc.yellow('  ! ') + path.relative(target, p))]
          : []),
      ].join('\n'),
      T('presetDryRun')
    );
    if (collisions.length && !flags.force && !flags.backup) {
      log.warn(`${pc.yellow('⚠')}  ${T('presetCollision')}: use --backup or --force to proceed.`);
    }
    return;
  }

  // Collisions without explicit consent → abort with actionable guidance
  if (collisions.length > 0 && !flags.force && !flags.backup) {
    log.error(`${pc.red('✗')} ${T('presetCollision')} (${collisions.length}):`);
    for (const p of collisions) {
      console.error('  ' + pc.dim(path.relative(target, p)));
    }
    console.error('');
    console.error(pc.bold(T('presetOptionsHeader') + ':'));
    console.error(`  ${pc.cyan('--backup')}   ${T('presetOptBackup')}`);
    console.error(`  ${pc.cyan('--force')}    ${T('presetOptForce')}`);
    console.error(`  ${pc.cyan('--dry-run')}  ${T('presetOptDryRun')}`);
    console.error('');
    console.error(pc.dim(T('presetUseInteractive') + ': ') + pc.bold('axis init') + pc.dim(' (' + (locale === 'pt' ? 'sem' : 'without') + ' --preset)'));
    process.exit(1);
  }

  // Backups before any write
  if (flags.backup && collisions.length > 0) {
    const ts = backupTimestamp();
    const lines = [];
    for (const p of collisions) {
      const bak = `${p}.axis-bak-${ts}`;
      fs.copyFileSync(p, bak);
      lines.push(`  ${pc.dim('→')} ${path.relative(target, bak)}`);
    }
    log.success(`${T('presetBackupDone')} (${collisions.length}):`);
    console.log(lines.join('\n'));
  } else if (flags.force && collisions.length > 0) {
    log.warn(`${pc.yellow('⚠')}  ${T('presetForceWarn')} (${collisions.length})`);
  }

  const s = spinner();
  s.start(`Scaffolding preset → ${pc.cyan(target)}`);

  ensureDir(path.join(target, '.ai', 'skills'));
  ensureDir(path.join(target, '.ai', 'rules'));
  ensureDir(path.join(target, '.ai', 'docs'));

  const replace = (content) =>
    content
      .replace(/{{PROJECT_NAME}}/g, name)
      .replace(/{{PROJECT_PURPOSE}}/g, purpose)
      .replace(/{{STACK}}/g, stack || (locale === 'pt' ? '(não-software)' : '(non-software)'));

  write(path.join(target, '.ai', 'INSTRUCTIONS.md'), replace(read(path.join(TEMPLATES, 'INSTRUCTIONS.md'))));
  write(path.join(target, '.ai', 'CONVENTIONS.md'), replace(read(path.join(TEMPLATES, 'CONVENTIONS.md'))));
  write(path.join(target, '.ai', 'docs', 'STATE.md'), replace(read(path.join(TEMPLATES, 'STATE.md'))));

  for (const skill of spdd) {
    const skillDir = path.join(target, '.ai', 'skills', skill);
    ensureDir(skillDir);
    const src = path.join(TEMPLATES, 'skills', `${skill}.md`);
    if (exists(src)) fs.copyFileSync(src, path.join(skillDir, 'SKILL.md'));
  }

  // documentation-guardian skill (always installed — self-maintenance kit)
  const guardianSrcP = path.join(TEMPLATES, 'skills', 'documentation-guardian');
  if (fs.existsSync(guardianSrcP)) {
    copyDir(guardianSrcP, path.join(target, '.ai', 'skills', 'documentation-guardian'));
  }

  // F9 — axis-delta skill (always installed; activates on brownfield triggers)
  const deltaSrcP = path.join(TEMPLATES, 'delta-skill');
  if (fs.existsSync(deltaSrcP)) {
    copyDir(deltaSrcP, path.join(target, '.ai', 'skills', 'axis-delta'));
  }

  // F12 — axis-specify skill (always installed; activates on greenfield triggers)
  const specifySrcP = path.join(TEMPLATES, 'specify-skill');
  if (fs.existsSync(specifySrcP)) {
    copyDir(specifySrcP, path.join(target, '.ai', 'skills', 'axis-specify'));
  }

  // Persistent agents — surfaced via the .claude/agents symlink.
  copyDir(path.join(TEMPLATES, 'agents'), path.join(target, '.ai', 'agents'));

  // F14 — axis.config.json (workflow policy read by the agent, not by CLI)
  const configSrcP = path.join(TEMPLATES, 'axis.config.json');
  if (fs.existsSync(configSrcP)) {
    fs.copyFileSync(configSrcP, path.join(target, 'axis.config.json'));
  }

  const rulesSrc = path.join(TEMPLATES, 'rules');
  const defaultRules = ['session-start.md'];
  if (fs.existsSync(rulesSrc)) {
    // Default: session-start only. Others are opt-in via `axis rules add <name>`.
    for (const f of defaultRules) {
      const src = path.join(rulesSrc, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(target, '.ai', 'rules', f));
    }
    // F10 — constitutional rules: preset declares which file to pick; null skips
    if (cfg.constitutional) {
      const cSrc = path.join(rulesSrc, `constitutional-${cfg.constitutional}.md`);
      if (fs.existsSync(cSrc)) {
        fs.copyFileSync(cSrc, path.join(target, '.ai', 'rules', 'constitutional.md'));
      }
    }
  }

  // Self-maintenance scripts and hooks (F4B)
  ensureDir(path.join(target, 'scripts'));
  const hooksSrcP = path.join(TEMPLATES, 'hooks');
  if (fs.existsSync(hooksSrcP)) {
    for (const f of ['_lib.sh', 'post-spec-edit.sh', 'post-code-change.sh', 'session-start.sh', 'stop.sh', 'constitutional-check.sh', 'validate-commit-msg.sh', 'sync-cursor-rules.sh']) {
      const hSrc = path.join(hooksSrcP, f);
      if (fs.existsSync(hSrc)) {
        const hDst = path.join(target, 'scripts', f);
        fs.copyFileSync(hSrc, hDst);
        fs.chmodSync(hDst, 0o755);
      }
    }
  }

  // PR template
  const prTemplateSrcP = path.join(TEMPLATES, 'github', 'PULL_REQUEST_TEMPLATE.md');
  if (fs.existsSync(prTemplateSrcP)) {
    ensureDir(path.join(target, '.github'));
    const prDstP = path.join(target, '.github', 'PULL_REQUEST_TEMPLATE.md');
    if (!fs.existsSync(prDstP)) {
      fs.copyFileSync(prTemplateSrcP, prDstP);
    }
  }
  const selfMaintSrcP = path.join(TEMPLATES, 'scripts-self-maint');
  if (fs.existsSync(selfMaintSrcP)) {
    for (const f of fs.readdirSync(selfMaintSrcP)) {
      if (f.endsWith('.sh')) {
        const sDst = path.join(target, 'scripts', f);
        fs.copyFileSync(path.join(selfMaintSrcP, f), sDst);
        fs.chmodSync(sDst, 0o755);
      }
    }
  }

  if (ides.includes('claude')) {
    ensureDir(path.join(target, '.claude'));
    write(path.join(target, '.claude', 'settings.json'), read(path.join(TEMPLATES, 'settings.json')));
  }

  write(path.join(target, 'setup-ide-links.sh'), read(path.join(TEMPLATES, 'setup-ide-links.sh')));
  fs.chmodSync(path.join(target, 'setup-ide-links.sh'), 0o755);

  // Stamp .axis-version for future rebootstrap operations
  const { createRequire: createReq } = await import('node:module');
  const req = createReq(import.meta.url);
  const cliVer = req(path.join(TEMPLATES, '..', 'package.json')).version;
  write(path.join(target, '.ai', '.axis-version'), cliVer + '\n');

  if (process.platform === 'win32') {
    s.stop(pc.green('✓ Preset applied'));
    log.warn(`${pc.yellow('⚠')}  ${T('presetWindowsSkip')}`);
    log.warn(`  ${T('presetWindowsHint')}`);
  } else {
    try {
      execSync('bash setup-ide-links.sh', { cwd: target, stdio: 'pipe' });
      s.stop(pc.green('✓ Preset applied (symlinks installed)'));
    } catch {
      s.stop(pc.green('✓ Preset applied'));
      log.warn('Run `bash setup-ide-links.sh` manually to wire IDE symlinks.');
    }
  }

  const created = [
    '.ai/INSTRUCTIONS.md',
    '.ai/CONVENTIONS.md',
    '.ai/docs/STATE.md',
    `.ai/skills/ (${spdd.length} SPDD + axis-delta + axis-specify + documentation-guardian)`,
    `.ai/rules/ (${fs.existsSync(rulesSrc) ? fs.readdirSync(rulesSrc).filter(f => f.endsWith('.md') && !f.startsWith('constitutional-')).length : 0} always-on${cfg.constitutional ? ' + constitutional' : ''})`,
    'scripts/ (hooks + self-maint kit + constitutional-check)',
    'axis.config.json',
    'setup-ide-links.sh',
    ...(ides.includes('claude') ? ['.claude/settings.json (hooks wired)'] : []),
    'AGENTS.md → .ai/INSTRUCTIONS.md',
    'CLAUDE.md → .ai/INSTRUCTIONS.md',
  ];
  note(created.map((c) => pc.green('+ ') + c).join('\n'), `Preset bootstrap complete — ${pc.bold(name)}`);
}
