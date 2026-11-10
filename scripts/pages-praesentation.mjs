#!/usr/bin/env node
/**
 * Veröffentlicht das Pitch-Deck auf der bestehenden GitHub-Pages-Seite,
 * ohne dass ein zweites Repository nötig ist.
 *
 *   npm run pages:praesentation            # Ordner /praesentation/ aktualisieren
 *   npm run pages:praesentation -- --dry-run
 *
 * Die Seite wird aus dem Branch `gh-pages` ausgeliefert (Pages: branch/root).
 * Dieses Skript legt dort nur den Unterordner `praesentation/` neu an und lässt
 * den restlichen Stand – also den gebauten Export der Demo – unangetastet.
 * Ergebnis: https://<user>.github.io/<repo>/praesentation/
 */
import { cp, mkdtemp, rm, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const source = join(repo, 'praesentation');
const remote = process.env.PAGES_REMOTE ?? 'origin';
const branch = process.env.PAGES_BRANCH ?? 'gh-pages';
const folder = process.env.PAGES_FOLDER ?? 'praesentation';
const dryRun = process.argv.includes('--dry-run');

function git(args, options = {}) {
  const result = spawnSync('git', args, { cwd: options.cwd ?? repo, encoding: 'utf8' });
  if (result.status !== 0) {
    const detail = `${result.stderr ?? ''}${result.stdout ?? ''}`.trim();
    throw new Error(`git ${args.join(' ')} fehlgeschlagen:\n${detail}`);
  }
  if (options.echo) process.stdout.write(result.stdout ?? '');
  return (result.stdout ?? '').trim();
}

async function main() {
  // Vorbedingung: Deck vorhanden und Arbeitsbaum sauber genug für einen Commit.
  await stat(join(source, 'index.html'));

  console.log(`Quelle:  ${source}`);
  console.log(`Ziel:    ${remote}/${branch} → ${folder}/`);

  git(['fetch', remote, branch, '--quiet']);

  const tree = await mkdtemp(join(tmpdir(), 'pages-deck-'));
  const worktree = join(tree, 'site');

  try {
    // Zweiter Arbeitsbaum: der eigene Arbeitsstand bleibt unberührt.
    git(['worktree', 'add', '--force', '-B', `pages-deck-${process.pid}`, worktree, `${remote}/${branch}`], { echo: true });

    const target = join(worktree, folder);
    await rm(target, { recursive: true, force: true });
    await cp(source, target, { recursive: true });

    // .nojekyll liegt bereits im Branch; ohne die Datei würde Jekyll Ordner mit
    // Unterstrich schlucken. Fehlt sie, hier nachziehen.
    const nojekyll = join(worktree, '.nojekyll');
    try {
      await stat(nojekyll);
    } catch {
      await cp(join(source, 'index.html'), nojekyll);
    }

    git(['add', '--all', '--', folder, '.nojekyll'], { cwd: worktree });
    const staged = git(['diff', '--cached', '--name-only'], { cwd: worktree });
    if (!staged) {
      console.log('Keine Änderungen – das Deck ist bereits aktuell.');
      return;
    }

    if (dryRun) {
      console.log(`Probelauf: ${staged.split('\n').length} Datei(en) würden veröffentlicht.`);
      return;
    }

    git(['commit', '--quiet', '-m', 'docs(pages): Pitch-Deck unter /praesentation/ veröffentlichen'], { cwd: worktree });
    // Ausdrücklich im Worktree pushen: dort liegt der neue Commit.
    git(['push', remote, `HEAD:${branch}`], { cwd: worktree, echo: true });

    const url = git(['config', '--get', `remote.${remote}.url`]);
    const slug = url.replace(/\.git$/, '').split(/[/:]/).slice(-2).join('/');
    const [owner, name] = slug.split('/');
    console.log(`\nVeröffentlicht: https://${owner.toLowerCase()}.github.io/${name}/${folder}/`);
    console.log('GitHub Pages braucht meist 30–60 Sekunden für den neuen Stand.');
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', worktree], { cwd: repo, stdio: 'ignore' });
    spawnSync('git', ['branch', '-D', `pages-deck-${process.pid}`], { cwd: repo, stdio: 'ignore' });
    await rm(tree, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`Veröffentlichung fehlgeschlagen: ${error.message}`);
  process.exitCode = 1;
});
