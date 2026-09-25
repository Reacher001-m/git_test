// =====================================================================
// git コマンド本体 (シミュレーション)
//   - init / status / add / commit / branch / checkout / switch
//   - merge / reset / tag / log
//   - remote / push / fetch / pull / peer-commit (GitHub 連携)
//   - コミット祖先・追跡状態ヘルパー
// =====================================================================

// ---------------------------------------------------------------------
// 追跡・ヘッダ状態ヘルパー
// ---------------------------------------------------------------------
function headCommitedFiles() {
    const tip = state.initialized && state.currentBranch ? state.branches[state.currentBranch].tip : null;
    return tip ? [...state.commits[tip].files] : [];
}

function hasTracked(f) {
    const tip = state.initialized && state.currentBranch ? state.branches[state.currentBranch].tip : null;
    return tip ? state.commits[tip].files.includes(f) : false;
}

function hasUntracked() {
    const headFiles = headCommitedFiles();
    return state.workingFiles.some(f => !headFiles.includes(f));
}

// ---------------------------------------------------------------------
// リモート状態ヘルパー
// ---------------------------------------------------------------------
const DEFAULT_REMOTE_URL = 'https://github.com/you/git-sandbox.git';

function reachableSet(tip) {
    const set = new Set();
    if (!state.commits[tip]) return set;
    const stack = [tip];
    while (stack.length) {
        const id = stack.pop();
        if (set.has(id)) continue;
        set.add(id);
        const c = state.commits[id];
        for (const p of c.parents) {
            if (!set.has(p) && state.commits[p]) stack.push(p);
        }
    }
    return set;
}

// ローカルブランチ tip と origin の同じ名前のブランチの ahead/behind を数える
function aheadBehind(branch) {
    if (!state.remote || !state.remote.branches[branch]) return { ahead: 0, behind: 0 };
    const localTip = state.branches[branch].tip;
    const remoteTip = state.remote.branches[branch];
    if (!localTip) return { ahead: 0, behind: 1 };
    const ls = reachableSet(localTip);
    const rs = reachableSet(remoteTip);
    let ahead = 0, behind = 0;
    for (const id of rs) if (!ls.has(id)) behind++;
    for (const id of ls) if (!rs.has(id)) ahead++;
    return { ahead, behind };
}

function remoteDesc() {
    return state.remote ? state.remote.name + '\t' + state.remote.url : '';
}

// ---------------------------------------------------------------------
// git init
// ---------------------------------------------------------------------
function gitInit() {
    if (state.initialized) {
        out('Reinitialized existing Git repository');
        return;
    }
    state.initialized = true;
    state.currentBranch = 'main';
    state.branches['main'] = { tip: null, color: nextBranchColor() };
    out('Initialized empty Git repository in C:/git_sandbox/.git/');
    out('ブランチを「main」から始めます。「touch ファイル名」でファイルを作成できます。', 'gray');
    refreshPrompt();
}

// ---------------------------------------------------------------------
// git status
// ---------------------------------------------------------------------
function gitStatus() {
    if (!guardInit()) return;

    const tip = state.branches[state.currentBranch].tip;
    const headFiles = headCommitedFiles();
    const staged = state.stagedFiles;
    const deletions = state.stagedDeletions;
    const untrackedFiles = state.workingFiles.filter(f => !headFiles.includes(f) && !staged.includes(f));
    const modified = state.modified.filter(f => !staged.includes(f) && !untrackedFiles.includes(f) && !deletions.includes(f));

    out(`On branch ${state.currentBranch}`, 'white');

    if (state.remote && state.remote.branches[state.currentBranch]) {
        const { ahead, behind } = aheadBehind(state.currentBranch);
        const ref = `origin/${state.currentBranch}`;
        if (ahead === 0 && behind === 0) {
            out(`Your branch is up to date with '${ref}'.`);
        } else if (behind === 0) {
            out(`Your branch is ahead of '${ref}' by ${ahead} commit${ahead > 1 ? 's' : ''}.`, 'white');
            out('  (use "git push" to publish your local commits)', 'dim');
        } else if (ahead === 0) {
            out(`Your branch is behind '${ref}' by ${behind} commit${behind > 1 ? 's' : ''}, and can be fast-forwarded.`, 'white');
            out('  (use "git pull" to update your local branch)', 'dim');
        } else {
            out(`Your branch and '${ref}' have diverged, and have ${ahead} and ${behind} different commits each, respectively.`, 'white');
            out('  (use "git pull" to merge the remote branch into yours)', 'dim');
        }
    }

    if (!tip) out('No commits yet', 'yellow');
    if (staged.length || deletions.length) {
        out('');
        out('Changes to be committed:');
        out('  (use "git reset" to unstage)', 'dim');
        out('');
        for (const f of staged) out(`\tnew file:   ${relPath(f)}`, 'green');
        for (const f of deletions) out(`\tdeleted:    ${relPath(f)}`, 'red');
    }
    if (modified.length) {
        out('');
        out('Changes not staged for commit:');
        out('  (use "git add <file>..." to update what will be committed)', 'dim');
        out('');
        for (const f of modified) out(`\tmodified:   ${relPath(f)}`, 'red');
    }
    if (untrackedFiles.length) {
        out('');
        out('Untracked files:');
        out('  (use "git add <file>..." to include in what will be committed)', 'dim');
        out('');
        for (const f of untrackedFiles) out(`\t${relPath(f)}`, 'red');
    }

    out('');
    if (!staged.length && !modified.length && !untrackedFiles.length && !deletions.length) {
        if (!tip) {
            out('nothing to commit (create/copy files and use "git add" to track)', 'gray');
        } else {
            out('nothing to commit, working tree clean', 'green');
        }
    }
}

// ---------------------------------------------------------------------
// git add
// ---------------------------------------------------------------------
function gitAdd(pattern) {
    if (!guardInit()) return;
    let tokens = (pattern || '').trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) tokens = ['.'];

    const allFlags = tokens.some(t => ['-A', '--all', '-u', '--update'].includes(t));
    if (allFlags) {
        for (const f of state.workingFiles) {
            if (!state.stagedFiles.includes(f)) state.stagedFiles.push(f);
        }
        return;
    }

    const targets = [];
    let failed = false;
    for (const t of tokens) {
        if (t === '.' || t === './' || t === '*') {
            for (const f of workingFilesUnder(fsState.cwd)) targets.push(f);
            continue;
        }
        const want = resolvePath(t);
        let matched;
        if (fsState.dirs.has(want)) {
            matched = state.workingFiles.filter(f => f.startsWith(want + '/'));
        } else {
            matched = state.workingFiles.filter(f => f === want);
        }
        if (matched.length === 0) {
            out(`fatal: pathspec '${t}' did not match any files`, 'red');
            failed = true;
            continue;
        }
        for (const f of matched) targets.push(f);
    }
    if (failed) return;
    for (const f of targets) {
        if (!state.stagedFiles.includes(f)) state.stagedFiles.push(f);
    }
}

// ---------------------------------------------------------------------
// git branch
// ---------------------------------------------------------------------
function gitBranch(args) {
    if (!guardInit()) return;
    const words = (args || '').trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        const cur = state.currentBranch;
        const ordered = Object.keys(state.branches).sort((a, b) => a.localeCompare(b));
        ordered.sort((a, b) => (a === cur ? -1 : 0) - (b === cur ? -1 : 0));
        for (const name of ordered) {
            const line = (name === cur ? '* ' : '  ') + name;
            if (state.remote && state.remote.branches[name]) {
                const { ahead, behind } = aheadBehind(name);
                const ref = 'origin/' + name;
                let track;
                if (!state.branches[name].tip) track = `[${ref}: gone]`;
                else if (ahead === 0 && behind === 0) track = `[${ref}]`;
                else if (behind === 0) track = `[${ref}: ahead ${ahead}]`;
                else if (ahead === 0) track = `[${ref}: behind ${behind}]`;
                else track = `[${ref}: ahead ${ahead}, behind ${behind}]`;
                out(line + '  ' + track, name === cur ? 'green' : 'white');
            } else {
                out(line, name === cur ? 'green' : 'white');
            }
        }
        return;
    }

    const flag = words[0];
    const name = words[1];

    if (flag === '-d' || flag === '-D') {
        if (!name) {
            out('error: branch name required', 'red');
            return;
        }
        if (name === state.currentBranch) {
            out(`error: Cannot delete branch '${name}' checked out at 'C:/git_sandbox'`, 'red');
            return;
        }
        if (!state.branches[name]) {
            out(`error: branch '${name}' not found.`, 'red');
            return;
        }
        const curTip = state.branches[state.currentBranch].tip;
        const tip = state.branches[name].tip;
        if (flag === '-d' && tip && !isAncestor(tip, curTip)) {
            out(`error: The branch '${name}' is not fully merged.`, 'red');
            out(`If you are sure you want to delete it, run 'git branch -D ${name}'.`, 'gray');
            return;
        }
        delete state.branches[name];
        out(`Deleted branch ${name}${tip ? ' (was ' + tip.substring(0, 7) + ')' : ''}.`);
        return;
    }

    if (flag !== '-' && flag.startsWith('-')) {
        out(`error: unknown switch '${flag}'`, 'red');
        return;
    }

    const newName = flag;
    if (!newName) {
        out('error: missing branch name', 'red');
        return;
    }
    if (state.branches[newName]) {
        out(`fatal: a branch named '${newName}' already exists`, 'red');
        return;
    }
    if (!state.branches[state.currentBranch].tip) {
        out(`fatal: not a valid object name: 'HEAD'`, 'red');
        return;
    }

    const tip = state.branches[state.currentBranch].tip;
    state.branches[newName] = { tip, color: nextBranchColor() };
    out(`Created branch '${newName}' (at ${tip.substring(0, 7)}).`, 'green');
}

// ---------------------------------------------------------------------
// git checkout / git switch
// ---------------------------------------------------------------------
function gitCheckout(args) {
    if (!guardInit()) return;
    let words = (args || '').trim().split(/\s+/).filter(Boolean);
    let create = false;

    if (words[0] === '-b' || words[0] === '--') {
        if (words[0] === '-b') create = true;
        words = words.slice(1);
    }

    const branch = words[0];
    if (!branch) {
        out('fatal: missing branch name', 'red');
        return;
    }

    if (create) {
        if (!state.branches[branch]) {
            const tip = state.branches[state.currentBranch].tip;
            state.branches[branch] = { tip, color: nextBranchColor() };
            out('Note: switching to a new branch \'' + branch + "'", 'cyan');
        } else {
            out(`fatal: a branch named '${branch}' already exists`, 'red');
            return;
        }
        state.currentBranch = branch;
        out(`Switched to a new branch '${branch}'`, 'green');
        refreshPrompt();
        return;
    }

    if (state.branches[branch]) {
        state.currentBranch = branch;
        out(`Switched to branch '${branch}'`, 'green');
        refreshPrompt();
        return;
    }

    out(`fatal: pathspec '${branch}' did not match any file(s) known to git`, 'red');
}

function gitSwitch(args) {
    if (!guardInit()) return;
    let words = (args || '').trim().split(/\s+/).filter(Boolean);
    let create = false;
    if (words[0] === '-c' || words[0] === '--create') {
        create = true;
        words = words.slice(1);
    }
    if (create) return gitCheckout('-b ' + words.join(' '));
    return gitCheckout(words.join(' '));
}

// ---------------------------------------------------------------------
// git merge
// ---------------------------------------------------------------------
function gitMerge(args) {
    if (!guardInit()) return;
    const words = (args || '').trim().split(/\s+/).filter(Boolean);
    const target = words[0];
    if (!target) {
        out('fatal: Not a valid object name', 'red');
        return;
    }
    if (!state.branches[target]) {
        out(`fatal: '${target}' does not appear to be a git repository`, 'red');
        out('fatal: Could not read from remote repository.', 'red');
        return;
    }
    if (target === state.currentBranch) {
        out('Already up to date.');
        return;
    }

    const curTip = state.branches[state.currentBranch].tip;
    const targetTip = state.branches[target].tip;

    if (!targetTip || !curTip) {
        out('Already up to date.');
        return;
    }
    if (curTip === targetTip) {
        out('Already up to date.');
        return;
    }

    if (isAncestor(curTip, targetTip)) {
        state.branches[state.currentBranch].tip = targetTip;
        out('Updating ' + curTip.substring(0, 7) + '..' + targetTip.substring(0, 7), 'green');
        out('Fast-forward', 'yellow');
        const moved = historyIdList(curTip, targetTip);
        for (const id of moved.reverse()) {
            const c = state.commits[id];
            out('  ' + id.substring(0, 7) + ' ' + c.message, 'cyan');
        }
        return;
    }

    if (isAncestor(targetTip, curTip)) {
        out('Already up to date.');
        return;
    }

    const curFiles = state.commits[curTip].files;
    const targetFiles = state.commits[targetTip].files;
    const files = [...new Set([...curFiles, ...targetFiles])];

    const id = genId();
    state.seq += 1;
    state.commits[id] = {
        id,
        message: `Merge branch '${target}' into ${state.currentBranch}`,
        parents: [curTip, targetTip],
        files,
        date: fmtDate(),
        seq: state.seq,
    };
    state.branches[state.currentBranch].tip = id;
    out('Merge made by the \'ort\' strategy.', 'green');
    out('  ' + id.substring(0, 7) + ' Merge branch \'' + target + `' into ${state.currentBranch}`, 'cyan');
}

function historyIdList(fromTip, toTip) {
    const list = [];
    let c = toTip;
    while (c && c !== fromTip) {
        list.push(c);
        c = state.commits[c].parents[0];
    }
    return list;
}

// ---------------------------------------------------------------------
// git reset (ステージ取り消し / コミットの取り消し)
//   git reset                       → ステージ登録を取り消す
//   git reset --soft HEAD~N        → N 個前へ戻し、戻した変更はステージ済みのまま
//   git reset --hard HEAD~N        → N 個前へ戻し、戻した変更は破棄
// ---------------------------------------------------------------------
function gitReset(args) {
    if (!guardInit()) return;
    const words = (args || '').trim().split(/\s+/).filter(Boolean);

    const flags = words.filter(w => ['--soft', '--hard', '--mixed'].includes(w));
    const ref = words.find(w => !flags.includes(w)) || null;
    const soft = flags.includes('--soft');
    const hard = flags.includes('--hard');

    if (!ref) {
        if (soft || hard) {
            out('usage: git reset --soft/--hard HEAD~N', 'red');
            return;
        }
        if (state.stagedFiles.length === 0 && state.stagedDeletions.length === 0) return;
        state.stagedFiles = [];
        state.stagedDeletions = [];
        out('Unstaged changes after reset:', 'green');
        return;
    }

    if (ref !== 'HEAD' && !/^HEAD~(\d+)$/.test(ref)) {
        out(`fatal: ambiguous argument '${ref}'`, 'red');
        return;
    }
    const nMatch = ref.match(/^HEAD~(\d+)$/);
    const n = nMatch ? Number(nMatch[1]) : 0;
    const mode = hard ? 'hard' : soft ? 'soft' : 'mixed';

    const curTip = state.branches[state.currentBranch].tip;
    if (!curTip) {
        out('fatal: Failed to resolve HEAD as a valid ref.', 'red');
        return;
    }

    if (mode === 'hard' && n === 0) {
        state.stagedFiles = [];
        state.modified = [];
        out(`HEAD is now at ${curTip.substring(0, 7)} ${state.commits[curTip].message}`, 'yellow');
        return;
    }

    let newTip = curTip;
    for (let i = 0; i < n; i++) {
        if (!newTip || !state.commits[newTip] || state.commits[newTip].parents.length === 0) {
            out(`fatal: Failed to resolve '${ref}'`, 'red');
            return;
        }
        newTip = state.commits[newTip].parents[0];
    }
    if (newTip === curTip) {
        out('Nothing to reset.');
        return;
    }

    const undone = state.commits[curTip].files.filter(f => !state.commits[newTip].files.includes(f));
    state.branches[state.currentBranch].tip = newTip;
    state.stagedDeletions = [];

    if (mode === 'hard') {
        state.stagedFiles = [];
        state.modified = [];
        state.workingFiles = state.workingFiles.filter(f => !undone.includes(f));
        out(`HEAD is now at ${newTip.substring(0, 7)} ${state.commits[newTip].message}`, 'yellow');
    } else {
        state.stagedFiles = [];
        for (const f of undone) if (!state.stagedFiles.includes(f)) state.stagedFiles.push(f);
        state.modified = state.modified.filter(f => !undone.includes(f));
        out(`HEAD is now at ${newTip.substring(0, 7)} ${state.commits[newTip].message}`, 'yellow');
        if (undone.length) {
            out('Changes to be committed: (git reset で取り消せる)', 'dim');
            for (const f of undone) out(`\tnew file:   ${relPath(f)}`, 'green');
        }
    }
}

// ---------------------------------------------------------------------
// git rm (ファイルの削除 / 追跡から外す)
//   git rm <file>              → ファイルを削除して「削除」をステージする
//   git rm --cached <file>     → 手元のファイルは残したまま、Gitの追跡から外す
// ---------------------------------------------------------------------
function gitRm(args) {
    if (!guardInit()) return;
    const words = (args || '').trim().split(/\s+/).filter(Boolean);
    const cached = words.includes('--cached');
    const tokens = words.filter(w => w !== '--cached' && w !== '--staged' && w !== '-r' && w !== '-f');
    if (tokens.length === 0) {
        out('usage: git rm [--cached] <file>...', 'red');
        return;
    }
    const tip = state.branches[state.currentBranch].tip;
    const headFiles = tip ? state.commits[tip].files : [];

    const targets = [];
    for (const t of tokens) {
        const want = resolvePath(t);
        let matched;
        if (fsState.dirs.has(want)) matched = state.workingFiles.filter(f => f.startsWith(want + '/'));
        else matched = state.workingFiles.filter(f => f === want);
        if (matched.length === 0) {
            out(`fatal: pathspec '${t}' did not match any files`, 'red');
            continue;
        }
        for (const f of matched) if (!targets.includes(f)) targets.push(f);
    }
    if (targets.length === 0) return;

    for (const f of targets) {
        const tracked = headFiles.includes(f);
        if (!cached) {
            state.workingFiles = state.workingFiles.filter(x => x !== f);
        }
        if (tracked) {
            if (!state.stagedDeletions.includes(f)) state.stagedDeletions.push(f);
        }
        const i = state.stagedFiles.indexOf(f);
        if (i !== -1) state.stagedFiles.splice(i, 1);
        state.modified = state.modified.filter(x => x !== f);
        out(`rm '${relPath(f)}'`, 'red');
    }
}

// ---------------------------------------------------------------------
// git restore (作業ツリーの変更を取り消す / ステージ取り消し)
//   git restore <file>            → 変更を破棄して元の状態に戻す
//   git restore --staged <file>   → ステージ登録だけを取り消す
// ---------------------------------------------------------------------
function gitRestore(args) {
    if (!guardInit()) return;
    let words = (args || '').trim().split(/\s+/).filter(Boolean);
    let stagedOnly = false;
    if (words[0] === '--staged' || words[0] === '--cached') {
        stagedOnly = true;
        words = words.slice(1);
    }
    if (words.length === 0) {
        out('usage: git restore <file>', 'red');
        out('       または git restore --staged <file>', 'dim');
        return;
    }

    for (const t of words) {
        const w = resolvePath(t);
        if (fsState.dirs.has(w)) {
            if (stagedOnly) {
                const subs = state.stagedFiles.filter(f => f.startsWith(w + '/'));
                state.stagedFiles = state.stagedFiles.filter(f => !f.startsWith(w + '/'));
                state.stagedDeletions = state.stagedDeletions.filter(f => !f.startsWith(w + '/'));
                for (const s of subs) out(`Unstaged: ${relPath(s)}`, 'green');
            } else {
                const subs = state.modified.filter(f => f.startsWith(w + '/'));
                state.modified = state.modified.filter(f => !f.startsWith(w + '/'));
                if (subs.length === 0) out(`pathspec '${t}' did not match any tracked files`, 'red');
                for (const s of subs) out(`Restored: ${relPath(s)}`, 'green');
            }
            continue;
        }

        if (stagedOnly) {
            if (state.stagedFiles.includes(w) || state.stagedDeletions.includes(w)) {
                state.stagedFiles = state.stagedFiles.filter(f => f !== w);
                state.stagedDeletions = state.stagedDeletions.filter(f => f !== w);
                if (state.workingFiles.includes(w)) state.modified.push(w);
                out(`Unstaged: ${relPath(w)}`, 'green');
            } else {
                out(`pathspec '${t}' did not match any tracked files`, 'red');
            }
        } else {
            if (state.modified.includes(w)) {
                state.modified = state.modified.filter(f => f !== w);
                out(`Restored: ${relPath(w)}`, 'green');
            } else {
                out(`pathspec '${t}' did not match any tracked files`, 'red');
            }
        }
    }
}

// ---------------------------------------------------------------------
// git revert (安全にコミットを打ち消す新しいコミットを作る)
//   git revert HEAD      → 最新コミットを打ち消すコミットを追加
//   git revert <hash>    → 指定コミットを打ち消すコミットを追加
// ---------------------------------------------------------------------
function gitRevert(args) {
    if (!guardInit()) return;
    const words = (args || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
        out('usage: git revert HEAD', 'red');
        out('       あるいは git revert <hash>', 'dim');
        return;
    }
    const tip = state.branches[state.currentBranch].tip;
    if (!tip) {
        out('fatal: Failed to resolve HEAD as a valid ref.', 'red');
        return;
    }

    let target = null;
    if (words[0] === 'HEAD') {
        target = tip;
    } else {
        const hits = Object.keys(state.commits).filter(id => id.startsWith(words[0]));
        if (hits.length === 1) target = hits[0];
    }
    if (!target || !state.commits[target]) {
        out(`error: bad revision '${words[0]}'`, 'red');
        return;
    }
    if (state.commits[target].parents.length === 0) {
        out('error: cannot revert the initial commit', 'red');
        return;
    }

    const revertFiles = state.commits[state.commits[target].parents[0]].files;
    const id = genId();
    state.seq += 1;
    const msg = 'Revert "' + state.commits[target].message + '"';
    state.commits[id] = {
        id,
        message: msg,
        parents: tip ? [tip] : [],
        files: [...revertFiles],
        date: fmtDate(),
        seq: state.seq,
    };
    state.branches[state.currentBranch].tip = id;
    state.stagedFiles = [];
    state.modified = state.modified.filter(f => !revertFiles.includes(f));
    out(`[${state.currentBranch} ${id.substring(0, 7)}] ${msg}`, 'green');
    out('This reverts commit ' + target.substring(0, 7) + '.', 'dim');
    out('git graph で見ると、取り消しコミットが新しいコミットとして追加されます。', 'dim');
}

// ---------------------------------------------------------------------
// git commit (amend 対応)
// ---------------------------------------------------------------------
function gitCommit(message, amend) {
    if (!guardInit()) return;
    if (!message) {
        out('error: switch `m\' requires a value', 'red');
        out('usage: git commit -m "<message>"', 'red');
        return;
    }

    const tip = state.branches[state.currentBranch].tip;

    if (amend) {
        if (!tip) {
            out('error: there is no commit yet so nothing to amend', 'red');
            return;
        }
        state.commits[tip].message = message;
        const files = new Set(state.commits[tip].files);
        for (const f of state.stagedFiles) files.add(f);
        for (const f of state.stagedDeletions) files.delete(f);
        state.commits[tip].files = [...files];
        state.stagedFiles = [];
        state.stagedDeletions = [];
        state.modified = state.modified.filter(f => !state.commits[tip].files.includes(f));
        out(`[${state.currentBranch} ${tip.substring(0, 7)}] ${message}`, 'green');
        return;
    }

    const staged = state.stagedFiles;
    if (staged.length === 0 && state.stagedDeletions.length === 0) {
        if (hasUntracked()) {
            out('nothing added to commit but untracked files present (use "git add" to track)', 'red');
        } else {
            out('nothing to commit, working tree clean', 'green');
        }
        return;
    }

    const prevFiles = tip ? state.commits[tip].files : [];
    const files = new Set(prevFiles);
    for (const f of staged) files.add(f);
    for (const f of state.stagedDeletions) files.delete(f);
    const deletedCount = state.stagedDeletions.length;

    const id = genId();
    state.seq += 1;
    state.commits[id] = {
        id,
        message,
        parents: tip ? [tip] : [],
        files: [...files],
        date: fmtDate(),
        seq: state.seq,
    };
    state.branches[state.currentBranch].tip = id;
    state.stagedFiles = [];
    state.stagedDeletions = [];
    state.modified = state.modified.filter(f => !staged.includes(f));

    const added = files.size - prevFiles.length;
    out(`[${state.currentBranch} ${id.substring(0, 7)}] ${message}`, 'green');
    if (added > 0) {
        out(` ${added} file${added === 1 ? '' : 's'} changed`, 'green');
    }
    if (deletedCount > 0) {
        out(` ${deletedCount} file${deletedCount === 1 ? '' : 's'} deleted`, 'green');
    }
}

// ---------------------------------------------------------------------
// git tag
// ---------------------------------------------------------------------
function gitTag(args) {
    if (!guardInit()) return;
    const words = (args || '').trim().split(/\s+/).filter(Boolean);

    if (words.length === 0 || words[0] === '-l' || words[0] === '--list' || words[0] === '-n') {
        const names = Object.keys(state.tags).sort();
        if (names.length === 0) {
            out('(no tags)', 'gray');
            return;
        }
        for (const name of names) {
            const tag = state.tags[name];
            if (tag.annotated && (words[0] === '-n')) {
                out(`  ${name}\t${tag.message}`, 'yellow');
            } else {
                out(`  ${name}`, 'yellow');
            }
        }
        return;
    }

    if (words[0] === '-d' || words[0] === '--delete') {
        const name = words[1];
        if (!name || !state.tags[name]) {
            out(`error: tag '${name || ''}' not found.`, 'red');
            return;
        }
        delete state.tags[name];
        out(`Deleted tag '${name}'`);
        return;
    }

    let name;
    let annotated = false;
    let message = null;
    let idx = 0;
    if (words[idx] === '-a' || words[idx] === '--annotate') {
        annotated = true;
        idx += 1;
        name = words[idx];
        idx += 1;
        const rest = words.slice(idx).join(' ');
        const m = rest.match(/^-m\s+"?([\s\S]*?)"?\s*$/) || rest.match(/^-m\s+([\s\S]+)$/);
        if (m) message = m[1];
    } else {
        name = words[idx];
    }

    if (!name) {
        out('error: tag name required', 'red');
        return;
    }
    if (state.tags[name]) {
        out(`fatal: tag '${name}' already exists`, 'red');
        return;
    }
    const tip = state.branches[state.currentBranch].tip;
    if (!tip) {
        out("fatal: Failed to resolve 'HEAD' as a valid ref.", 'red');
        return;
    }
    state.tags[name] = {
        commit: tip,
        annotated,
        message: message || (annotated ? '' : ''),
        date: fmtDate(),
    };
    out(`tag '${name}' created`, 'green');
}

// ---------------------------------------------------------------------
// git remote (GitHub 連携の起点)
// ---------------------------------------------------------------------
function gitRemote(args) {
    const words = (args || '').trim().split(/\s+/).filter(Boolean);

    if (words.length === 0 || words[0] === '-v' || words[0] === '--verbose') {
        if (!state.remote) {
            out('(no remote)  ', 'gray');
            return;
        }
        out(state.remote.name + '\t' + state.remote.url + ' (fetch)');
        out(state.remote.name + '\t' + state.remote.url + ' (push)');
        return;
    }

    const sub = words[0];

    if (sub === 'add') {
        const name = words[1];
        if (!name) {
            out('usage: git remote add <name> <url>', 'red');
            return;
        }
        if (state.remote) {
            out(`error: remote ${state.remote.name} already exists.`, 'red');
            return;
        }
        const url = words[2] || DEFAULT_REMOTE_URL;
        state.remote = { name, url, branches: {}, synced: {} };
        return;
    }

    if (sub === 'rm' || sub === 'remove') {
        if (!state.remote) {
            out(`error: No such remote: '${words[1] || ''}'`, 'red');
            return;
        }
        state.remote = null;
        return;
    }

    if (sub === 'set-url') {
        if (!state.remote) {
            out(`error: No such remote: '${words[1] || ''}'`, 'red');
            return;
        }
        const name = words[1];
        const url = words[2];
        if (name && name !== state.remote.name) {
            out(`error: No such remote: '${name}'`, 'red');
            return;
        }
        if (!url) {
            out('usage: git remote set-url <name> <newurl>', 'red');
            return;
        }
        state.remote.url = url;
        out(`Updated remote ${name || state.remote.name}`, 'green');
        return;
    }

    out(`error: Unknown subcommand: ${sub}`, 'red');
}

// ---------------------------------------------------------------------
// git push
// ---------------------------------------------------------------------
function gitPush(args) {
    if (!guardInit()) return;
    let words = [];
    let setUpstream = false;
    for (const w of (args || '').trim().split(/\s+/).filter(Boolean)) {
        if (w === '-u' || w === '--set-upstream') setUpstream = true;
        else words.push(w);
    }

    if (!state.remote) {
        if (words.length === 0) {
            out('fatal: No configured push destination.', 'red');
            out('hint: Use "git remote add origin <url>" first.', 'gray');
            return;
        }
        out(`fatal: '${words[0]}' does not appear to be a git repository`, 'red');
        out('fatal: Could not read from remote repository.', 'red');
        return;
    }

    let branch = words[1] || state.currentBranch;
    if (branch === 'HEAD') branch = state.currentBranch;

    if (!state.branches[branch]) {
        out(`error: src refspec ${branch} does not match any`, 'red');
        out(`error: failed to push some refs to '${state.remote.url}'`, 'red');
        return;
    }

    const localTip = state.branches[branch].tip;
    const remoteTip = state.remote.branches[branch];

    if (!localTip && !remoteTip) {
        out(`error: src refspec ${branch} does not match any`, 'red');
        out(`error: failed to push some refs to '${state.remote.url}'`, 'red');
        return;
    }
    if (localTip && remoteTip === localTip) {
        out('Everything up-to-date');
        return;
    }
    if (remoteTip && !isAncestor(remoteTip, localTip)) {
        out(` ! [rejected]        ${branch} -> ${branch} (non-fast-forward)`, 'red');
        out(`error: failed to push some refs to '${state.remote.url}'`, 'red');
        out('hint: Updates were rejected because the tip of your current branch is behind', 'gray');
        out('hint: its remote counterpart. Integrate the remote changes (e.g.', 'gray');
        out("hint: 'git pull ...') before pushing again.", 'gray');
        state.lastPushRejected = true;
        return;
    }

    // 転送するコミット数を数える
    const localSet = reachableSet(localTip);
    const remoteSet = remoteTip ? reachableSet(remoteTip) : new Set();
    let count = 0;
    for (const id of localSet) if (!remoteSet.has(id)) count++;
    if (count === 0) count = 1;

    out('Enumerating objects: ' + count + ', done.');
    out('Counting objects: 100% (' + count + '/' + count + '), done.');
    out('Writing objects: 100% (' + count + '/' + count + '), 1.50 KiB | 1.50 MiB/s, done.');
    out('Total ' + count + ' (delta 0), reused 0 (delta 0), pack-reused 0');
    out(`To ${state.remote.url}`);

    if (!remoteTip) {
        out(` * [new branch]      ${branch} -> ${branch}`, 'green');
        if (branch !== state.currentBranch) {
            out('remote:');
            out("remote: Create a pull request for '" + branch + "' on GitHub by visiting:");
            out('remote:      ' + state.remote.url.replace(/\.git$/, '/pull/new/' + branch), 'cyan');
            out('remote:');
        }
    } else {
        out(`   ${remoteTip.substring(0, 7)}..${localTip.substring(0, 7)}  ${branch} -> ${branch}`, 'green');
    }
    if (setUpstream) {
        out(`Branch '${branch}' set up to track 'origin/${branch}'.`, 'green');
    }

    state.remote.branches[branch] = localTip;
    state.remote.synced[branch] = localTip;
    state.lastPushRejected = false;
}

// ---------------------------------------------------------------------
// git fetch
// ---------------------------------------------------------------------
function gitFetch(args) {
    if (!guardInit()) return;
    const words = (args || '').trim().split(/\s+/).filter(Boolean);
    const remote = words[0] || 'origin';

    if (!state.remote || state.remote.name !== remote) {
        out(`fatal: '${remote}' does not appear to be a git repository`, 'red');
        out('fatal: Could not read from remote repository.', 'red');
        return;
    }

    out(`From ${state.remote.url}`);
    const names = Object.keys(state.remote.branches).sort();
    if (names.length === 0) {
        for (const b of Object.keys(state.branches)) {
            out(` * [new branch]      ${b} -> origin/${b}`, 'green');
        }
    } else {
        for (const name of names) {
            const curTip = state.remote.branches[name];
            const lastTip = state.remote.synced[name];
            state.remote.synced[name] = curTip;
            if (lastTip && lastTip !== curTip) {
                out(`   ${lastTip.substring(0, 7)}..${curTip.substring(0, 7)}  ${name} -> origin/${name}`, 'green');
            } else {
                out(` = [up to date]      ${name} -> origin/${name}`);
            }
        }
    }
}

// ---------------------------------------------------------------------
// git pull
// ---------------------------------------------------------------------
function gitPull(args) {
    if (!guardInit()) return;
    const words = (args || '').trim().split(/\s+/).filter(Boolean);
    const remote = words[0] || 'origin';
    let branch = words[1] || state.currentBranch;
    if (branch === 'HEAD') branch = state.currentBranch;

    if (!state.remote || state.remote.name !== remote) {
        out(`fatal: '${remote}' does not appear to be a git repository`, 'red');
        out('fatal: Could not read from remote repository.', 'red');
        return;
    }

    const localTip = state.branches[state.currentBranch].tip;
    const remoteTip = state.remote.branches[branch];

    if (!remoteTip) {
        out(`fatal: couldn't find remote ref ${branch}`, 'red');
        return;
    }
    if (!localTip) {
        out('fatal: couldn\'t read HEAD', 'red');
        return;
    }

    if (remoteTip === localTip || isAncestor(remoteTip, localTip)) {
        out('Already up to date.');
        state.remote.synced[branch] = remoteTip;
        return;
    }

    out(`From ${state.remote.url}`);
    if (isAncestor(localTip, remoteTip)) {
        // fast-forward
        out(`   ${localTip.substring(0, 7)}..${remoteTip.substring(0, 7)}  ${branch} -> origin/${branch}`, 'green');
        out('Updating ' + localTip.substring(0, 7) + '..' + remoteTip.substring(0, 7), 'green');
        out('Fast-forward', 'yellow');
        const moved = historyIdList(localTip, remoteTip);
        for (const id of moved.reverse()) {
            const c = state.commits[id];
            out('  ' + id.substring(0, 7) + ' ' + c.message, 'cyan');
        }
        state.branches[state.currentBranch].tip = remoteTip;
        state.remote.synced[branch] = remoteTip;
        return;
    }

    // 分岐 → マージコミットを作る
    const curFiles = state.commits[localTip].files;
    const targetFiles = state.commits[remoteTip].files;
    const files = [...new Set([...curFiles, ...targetFiles])];

    const id = genId();
    state.seq += 1;
    state.commits[id] = {
        id,
        message: `Merge remote-tracking branch 'origin/${branch}' into ${state.currentBranch}`,
        parents: [localTip, remoteTip],
        files,
        date: fmtDate(),
        seq: state.seq,
    };
    out(`   ${localTip.substring(0, 7)}..${remoteTip.substring(0, 7)}  ${branch} -> origin/${branch}`, 'green');
    out('Merge made by the \'ort\' strategy.', 'green');
    out('  ' + id.substring(0, 7) + " Merge remote-tracking branch 'origin/" + branch +
        `' into ${state.currentBranch}`, 'cyan');
    state.branches[state.currentBranch].tip = id;
    state.remote.synced[branch] = remoteTip;
}

// ---------------------------------------------------------------------
// git peer-commit (開発相手の GitHub 操作をシミュレートする独自コマンド)
// ---------------------------------------------------------------------
// リモート側にだけコミットを追加します (ローカルには影響しない)。
function peerCommitTip(branch, message) {
    if (!state.remote || !branch) return null;
    const remoteTip = state.remote.branches[branch];
    if (!remoteTip) return null;
    const prevFiles = state.commits[remoteTip].files;
    const id = genId();
    state.seq += 1;
    state.commits[id] = {
        id,
        message,
        parents: [remoteTip],
        files: [...prevFiles],
        date: fmtDate(),
        seq: state.seq,
    };
    state.remote.branches[branch] = id;
    return id;
}

function gitPeerCommit(args) {
    if (!guardInit()) return;
    const matched = (args || '').match(/^(\S+)\s+-m\s+"([\s\S]*?)"$/);
    const branch = matched ? matched[1] : ((args || '').split(/\s+/)[0] || '');
    const message = matched ? matched[2] : 'Update via GitHub';

    if (!state.remote) {
        out("(peer-commit はリモートがありません。まず 'git remote add origin' を実行してください)", 'red');
        return;
    }
    const remoteTip = state.remote.branches[branch];
    if (!remoteTip) {
        out(`fatal: couldn't find remote ref ${branch}`, 'red');
        return;
    }

    const id = peerCommitTip(branch, message);

    out('(開発相手が GitHub 上で直接コミットしました)  ', 'dim');
    out('From ' + state.remote.url);
    out(`   ${remoteTip.substring(0, 7)}..${id.substring(0, 7)}  ${branch} -> origin/${branch}`, 'green');
    out('  ' + id.substring(0, 7) + ' ' + message, 'cyan');
    out('「git status」で自分のブランチが behind になっているのを確認できます。', 'gray');
}
// ---------------------------------------------------------------------
// git log
// ---------------------------------------------------------------------
function gitLog(args) {
    if (!guardInit()) return;
    const tips = mapHeadTips(args);
    const layout = computeLayout(tips);
    if (!layout) {
        out('fatal: your current branch \'' + state.currentBranch + "' does not have any commits yet", 'red');
        return;
    }

    const ids = [...layout.ids].reverse();

    if (args.includes('--oneline') || args.includes('--graph')) {
        const lines = buildTextGraph(layout, state.currentBranch);
        for (const row of lines) out(row, 'white');
        return;
    }

    for (let i = 0; i < ids.length; i++) {
        const c = state.commits[ids[i]];
        out('commit ' + c.id, 'yellow');
        out('Author: Dev User <dev@example.com>');
        out('Date:   ' + c.date);
        out('');
        out('    ' + c.message, 'white');
        if (i !== ids.length - 1) out('');
    }
}

function mapHeadTips(args) {
    const tipSet = new Set();
    if (args.includes('--all')) {
        for (const b of Object.values(state.branches)) if (b.tip) tipSet.add(b.tip);
    } else {
        const t = state.initialized && state.currentBranch && state.branches[state.currentBranch].tip;
        if (t) tipSet.add(t);
    }
    return tipSet;
}