// =====================================================================
// ファイルシステム操作 (Windows 風ターミナル)
//   - pwd / mkdir / cd / rmdir / ls / dir / tree
//   - touch / rm (仮想ファイルの中身は持たず、存在/パスだけ管理)
// =====================================================================

function cmdPwd() {
    out(displayPath(fsState.cwd));
}

function cmdMkdir(args) {
    const parts = args.split(/\s+/).filter(Boolean);
    for (const item of parts) {
        const abs = resolvePath(item);
        if (abs === '/' || fsState.dirs.has(abs)) {
            out(`mkdir : An item with the specified name <${item}> already exists.`, 'red');
            continue;
        }
        const parent = abs.substring(0, abs.lastIndexOf('/')) || '/';
        if (!fsState.dirs.has(parent)) {
            out(`mkdir : Cannot find path '${item}' because it does not exist.`, 'red');
            continue;
        }
        fsState.dirs.add(abs);
    }
    refreshPrompt();
}

function cmdCd(args) {
    const target = (args || '').trim();
    if (!target || target === '.' || target === '.\\') {
        cmdPwd();
        return;
    }
    if (target === '..') {
        const c = fsState.cwd;
        fsState.cwd = c === '/' ? '/' : normalizePath(c + '/..');
        refreshPrompt();
        return;
    }
    const abs = resolvePath(target);
    if (!fsState.dirs.has(abs)) {
        out(`cd : Cannot find path '${displayPath(abs)}' because it does not exist.`, 'red');
        return;
    }
    fsState.cwd = abs;
    refreshPrompt();
}

function cmdRmdir(args) {
    const parts = args.split(/\s+/).filter(Boolean);
    for (const item of parts) {
        const abs = resolvePath(item);
        if (!fsState.dirs.has(abs)) {
            out(`Remove-Item : Cannot find path '${displayPath(abs)}' because it does not exist.`, 'red');
            continue;
        }
        if (abs === '/') {
            out('Remove-Item : Cannot remove item C:\\git_sandbox. Access to the path is denied.', 'red');
            continue;
        }
        const hasChild = [...fsState.dirs].some(d => d.startsWith(abs + '/'));
        const hasFile = state.workingFiles.some(f => f.startsWith(abs + '/'));
        if (hasChild || hasFile) {
            out(`Remove-Item : Cannot remove item ${displayPath(abs)}: The directory is not empty.`, 'red');
            continue;
        }
        fsState.dirs.delete(abs);
    }
    refreshPrompt();
}

function cmdLs() {
    const { dirs, files } = childrenOf(fsState.cwd);
    out('');
    out('    Directory: ' + displayPath(fsState.cwd), 'dim');
    out('');
    out('Mode     Name');
    out('----     ----');
    for (const d of dirs.sort()) {
        out('d-----   ' + d, 'cyan');
    }
    for (const f of files.sort()) {
        out('-a----   ' + f, 'white');
    }
    if (dirs.length === 0 && files.length === 0) {
        out('(このディレクトリは空です)', 'gray');
    }
}

function cmdTree() {
    const lines = [];
    lines.push(displayPath(fsState.cwd));
    walkTree(fsState.cwd, '', lines);
    out(lines.join('\n'), 'gray');
}

function walkTree(dir, prefix, lines) {
    const { dirs, files } = childrenOf(dir);
    const entries = [
        ...dirs.map(n => ({ name: n, isDir: true })),
        ...files.map(n => ({ name: n, isDir: false })),
    ];
    entries.sort((a, b) => a.name.localeCompare(b.name));
    entries.forEach((en, i) => {
        const last = i === entries.length - 1;
        lines.push(prefix + (last ? '└── ' : '├── ') + en.name + (en.isDir ? '/' : ''));
        if (en.isDir) {
            walkTree(dir + '/' + en.name, prefix + (last ? '    ' : '│   '), lines);
        }
    });
}

function touchFiles(names) {
    for (const f of names) {
        if (!f) continue;
        const abs = resolvePath(f);
        const parent = abs.substring(0, abs.lastIndexOf('/')) || '/';
        if (parent !== '/' && !fsState.dirs.has(parent)) {
            out(`touch: cannot touch '${f}': No such file or directory`, 'red');
            continue;
        }
        const tracked = hasTracked(abs);
        if (!state.workingFiles.includes(abs)) state.workingFiles.push(abs);
        if (tracked && !state.modified.includes(abs)) state.modified.push(abs);
    }
    refreshPrompt();
}

function rmFiles(names) {
    for (const f of names) {
        const abs = resolvePath(f);
        state.workingFiles = state.workingFiles.filter(x => x !== abs);
        state.stagedFiles = state.stagedFiles.filter(x => x !== abs);
        state.modified = state.modified.filter(x => x !== abs);
        const tip = state.initialized && state.currentBranch ? state.branches[state.currentBranch].tip : null;
        if (tip) {
            state.commits[tip].files = state.commits[tip].files.filter(x => x !== abs);
        }
    }
    refreshPrompt();
}