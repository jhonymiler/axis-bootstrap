/**
 * Minimal i18n. Detects locale from env; user can override.
 */

export function detectLocale() {
  const lang = (process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || '').toLowerCase();
  if (lang.startsWith('pt')) return 'pt';
  return 'en';
}

const STRINGS = {
  en: {
    // language picker
    pickLang: 'Language / Idioma?',
    langEN: 'English',
    langPT: 'Português',

    // detection messages
    detectingProject: 'Inspecting target directory…',
    detectedEmpty: 'Empty directory detected — new project flow.',
    detectedExisting: 'Existing project detected. AXIS will let an AI agent analyze it before generating skills.',
    detectedAlreadyBootstrapped: '.ai/INSTRUCTIONS.md already exists.',

    // mode picker
    pickMode: 'How do you want to bootstrap?',
    modeQuick: 'Quick scaffold (no AI) — good for new projects, fills templates from your answers',
    modeAI: 'AI-driven bootstrap (recommended for existing projects) — installs the axis-bootstrap skill so an AI agent reads your code and generates customized skills/rules/docs',
    modeAudit: 'Audit only — report what is missing without writing',

    // project meta
    askName: 'Project name?',
    askPurpose: 'One-sentence purpose of the project?',
    askPurposeHint: 'e.g. "Pricing engine for marketplace plans"',
    askPurposeShort: 'Please write at least one sentence',
    askStack: 'Stack / tools (comma-separated)?',
    askStackHint: 'e.g. "TypeScript, Node 20, PostgreSQL" — leave empty for non-software',
    askIDEs: 'Which IDEs / agents will read this project?',
    askSpdd: 'Which SPDD skills should be installed?',
    askSpddHint: 'These power the per-feature workflow: story → align → design → review',

    // ai-driven flow
    aiInstalling: 'Installing axis-bootstrap skill bundle…',
    aiNextSteps: 'Next steps',
    aiOpenAgent: '1. Open this project in Claude Code, Cursor, Windsurf, or any IDE with AI',
    aiTrigger: '2. Send this prompt to the agent:',
    aiTriggerText:
      'Load the axis-bootstrap skill (.ai/skills/axis-bootstrap/SKILL.md) and execute it on this project. Read the codebase first, then run all 5 phases with gates. Stop and ask between phases.',
    aiCleanup: '3. After the agent finishes Phase 5, run `axis cleanup` to remove the bootstrap skill (it is no longer needed — your project is now self-sufficient).',
    aiCleanupAuto: '3. The agent will auto-remove the bootstrap skill after Phase 5 validation (Step 5.5). No manual cleanup needed.',

    // quick flow
    quickScaffolding: 'Scaffolding .ai/ structure',
    quickSpecReady: 'Spec layer ready',
    quickHarnessReady: 'Harness layer ready',
    quickInstallerReady: 'Symlink installer ready',
    quickSymlinksInstalled: 'Symlinks installed',
    quickDoneScaffolding: 'Scaffolding done (symlinks not auto-installed)',
    quickRunLink: 'Run `axis link` manually after reviewing setup-ide-links.sh',
    quickCreated: 'Created',
    quickNext1: 'Open .ai/INSTRUCTIONS.md and refine the architecture table',
    quickNext2: 'Add your first skill: $EDITOR .ai/skills/<name>/SKILL.md',
    quickNext3: 'Run `axis doctor` to verify limits and symlinks',
    quickNext4: 'Per feature: `axis spdd canvas <slug>` → fill REASONS Canvas',

    // cleanup
    cleanupConfirm:
      'This will remove .ai/skills/axis-bootstrap/ (the meta bootstrap skill). Your generated skills, rules, docs, and STATE.md stay intact. Continue?',
    cleanupRemoved: 'Bootstrap skill removed. Project is fully self-sufficient now.',
    cleanupNotFound: 'No axis-bootstrap skill found in .ai/skills/. Nothing to remove.',
    cleanupAborted: 'Aborted — no changes made.',

    // preset safety (F1.1, F1.4, F2.4)
    presetGreenfieldWarn: '`--preset` is for greenfield projects. For existing projects, use `axis init` (interactive).',
    presetDryRun: 'Dry run — no files written',
    presetDryRunCreate: 'Files that would be created',
    presetDryRunOverwrite: 'Files that would be OVERWRITTEN',
    presetCollision: 'Refusing to overwrite existing file(s)',
    presetOptionsHeader: 'Options',
    presetOptBackup: 'Save .axis-bak-<timestamp> copies before overwriting (recommended)',
    presetOptForce: 'Overwrite without backup (destructive)',
    presetOptDryRun: 'Show what would happen without writing',
    presetUseInteractive: 'Or use interactive mode',
    presetBackupDone: 'Backed up existing file(s)',
    presetForceWarn: '--force: overwriting file(s) without backup',
    presetWindowsSkip: 'Windows detected: skipping `bash setup-ide-links.sh`',
    presetWindowsHint: 'Run from WSL, or use `mklink /D` in an elevated terminal to create symlinks manually',
    presetDetected: 'Detected',

    // common
    abortedAlready: 'Aborted. Run `axis audit` to inspect existing structure instead.',
    overwrite: 'Overwrite?',
    aborted: 'Aborted.',
    done: 'done',
    bootstrapPlan: 'Bootstrap plan',
    target: 'Target',
  },
  pt: {
    pickLang: 'Idioma / Language?',
    langEN: 'English',
    langPT: 'Português',

    detectingProject: 'Inspecionando o diretório-alvo…',
    detectedEmpty: 'Diretório vazio detectado — fluxo de projeto novo.',
    detectedExisting:
      'Projeto existente detectado. O AXIS vai deixar um agente de IA analisar o código antes de gerar skills.',
    detectedAlreadyBootstrapped: '.ai/INSTRUCTIONS.md já existe.',

    pickMode: 'Como deseja inicializar?',
    modeQuick:
      'Scaffold rápido (sem IA) — bom para projetos novos; preenche templates com suas respostas',
    modeAI:
      'Bootstrap guiado por IA (recomendado para projetos existentes) — instala a skill axis-bootstrap para que um agente leia seu código e gere skills/rules/docs customizadas',
    modeAudit: 'Apenas auditar — relata o que falta sem escrever',

    askName: 'Nome do projeto?',
    askPurpose: 'Em uma frase: para que serve o projeto?',
    askPurposeHint: 'ex.: "Motor de preços para planos de marketplace"',
    askPurposeShort: 'Escreva ao menos uma frase',
    askStack: 'Stack / ferramentas (separadas por vírgula)?',
    askStackHint: 'ex.: "TypeScript, Node 20, PostgreSQL" — deixe vazio se não for software',
    askIDEs: 'Quais IDEs / agentes vão ler este projeto?',
    askSpdd: 'Quais skills SPDD instalar?',
    askSpddHint: 'Compõem o pipeline por feature: story → align → design → review',

    aiInstalling: 'Instalando bundle da skill axis-bootstrap…',
    aiNextSteps: 'Próximos passos',
    aiOpenAgent:
      '1. Abra este projeto no Claude Code, Cursor, Windsurf ou qualquer IDE com IA',
    aiTrigger: '2. Envie este prompt para o agente:',
    aiTriggerText:
      'Carregue a skill axis-bootstrap (.ai/skills/axis-bootstrap/SKILL.md) e execute neste projeto. Leia o código primeiro, depois rode as 5 fases com gates. Pause e pergunte entre cada fase.',
    aiCleanup:
      '3. Quando o agente terminar a Phase 5, rode `axis cleanup` para remover a skill bootstrap (não é mais necessária — seu projeto agora é autossuficiente).',
    aiCleanupAuto:
      '3. O agente vai remover automaticamente a skill bootstrap após a validação da Phase 5 (Step 5.5). Nenhum cleanup manual necessário.',

    quickScaffolding: 'Criando estrutura .ai/',
    quickSpecReady: 'Spec layer pronta',
    quickHarnessReady: 'Harness layer pronta',
    quickInstallerReady: 'Instalador de symlinks pronto',
    quickSymlinksInstalled: 'Symlinks instalados',
    quickDoneScaffolding: 'Scaffold concluído (symlinks não foram instalados)',
    quickRunLink: 'Rode `axis link` manualmente após revisar setup-ide-links.sh',
    quickCreated: 'Criado',
    quickNext1: 'Abra .ai/INSTRUCTIONS.md e refine a tabela de arquitetura',
    quickNext2: 'Adicione sua primeira skill: $EDITOR .ai/skills/<nome>/SKILL.md',
    quickNext3: 'Rode `axis doctor` para validar limites e symlinks',
    quickNext4: 'Por feature: `axis spdd canvas <slug>` → preencha o Canvas REASONS',

    cleanupConfirm:
      'Isso remove .ai/skills/axis-bootstrap/ (a meta-skill do bootstrap). Suas skills, rules, docs e STATE.md geradas permanecem. Continuar?',
    cleanupRemoved: 'Skill bootstrap removida. O projeto agora é autossuficiente.',
    cleanupNotFound: 'Nenhuma skill axis-bootstrap encontrada em .ai/skills/. Nada a remover.',
    cleanupAborted: 'Cancelado — nada foi alterado.',

    // preset safety (F1.1, F1.4, F2.4)
    presetGreenfieldWarn: '`--preset` é para projetos greenfield. Para projetos existentes use `axis init` (interativo).',
    presetDryRun: 'Dry run — nenhum arquivo escrito',
    presetDryRunCreate: 'Arquivos que seriam criados',
    presetDryRunOverwrite: 'Arquivos que seriam SOBRESCRITOS',
    presetCollision: 'Recusando sobrescrever arquivo(s) existente(s)',
    presetOptionsHeader: 'Opções',
    presetOptBackup: 'Salvar cópias .axis-bak-<timestamp> antes de sobrescrever (recomendado)',
    presetOptForce: 'Sobrescrever sem backup (destrutivo)',
    presetOptDryRun: 'Mostrar o que aconteceria sem escrever',
    presetUseInteractive: 'Ou use o modo interativo',
    presetBackupDone: 'Backup feito de arquivo(s) existente(s)',
    presetForceWarn: '--force: sobrescrevendo arquivo(s) sem backup',
    presetWindowsSkip: 'Windows detectado: pulando `bash setup-ide-links.sh`',
    presetWindowsHint: 'Rode via WSL, ou use `mklink /D` num terminal elevado para criar symlinks manualmente',
    presetDetected: 'Detectado',

    abortedAlready: 'Cancelado. Rode `axis audit` para inspecionar a estrutura existente.',
    overwrite: 'Sobrescrever?',
    aborted: 'Cancelado.',
    done: 'concluído',
    bootstrapPlan: 'Plano de bootstrap',
    target: 'Destino',
  },
};

export function t(locale, key) {
  return (STRINGS[locale] && STRINGS[locale][key]) || STRINGS.en[key] || key;
}
