// =====================================================================
// パスユーティリティ
//   - 絶対パス / 相対パスの解決・正規化
//   - Windows 表示用パス変換
//   - ディレクトリ配下のファイル・サブディレクトリ列挙
// =====================================================================

function normalizePath(p) {
    const parts = p.split('/');
    const stack = [];
    for (const part of parts) {
        if (part === '' || part === '.') continue;
        if (part === '..') {
            if (stack.length) stack.pop();
            continue;
        }
        stack.push(part);
    }
    return '/' + stack.join('/');
}

function resolvePath(p) {
    p = (p || '').trim().replace(/\\/g, '/');
    if (p === '' || p === '.') return fsState.cwd;
    if (p.startsWith('/')) return normalizePath(p);
    return normalizePath(fsState.cwd + '/' + p);
}

function displayPath(abs) {
    if (abs === '/') return 'C:\\git_sandbox';
    return 'C:\\git_sandbox' + abs.replace(/\//g, '\\');
}

function relPath(abs) {
    const cwd = fsState.cwd;
    const a = abs.split('/').filter(Boolean);
    const b = cwd.split('/').filter(Boolean);
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    const ups = b.length - i;
    const downs = a.slice(i);
    if (ups === 0 && downs.length === 0) return '.';
    return [...Array(ups).fill('..'), ...downs].join('/');
}

function workingFilesUnder(absDir) {
    const prefix = absDir === '/' ? '/' : absDir + '/';
    return state.workingFiles.filter(f => f.startsWith(prefix));
}

function childrenOf(cwd) {
    const prefix = cwd === '/' ? '/' : cwd + '/';
    const dirs = [];
    for (const d of fsState.dirs) {
        if (d === cwd || !d.startsWith(prefix)) continue;
        const rel = d.slice(prefix.length);
        if (rel && !rel.includes('/')) dirs.push(rel);
    }
    const files = [];
    for (const f of state.workingFiles) {
        if (!f.startsWith(prefix)) continue;
        const rel = f.slice(prefix.length);
        if (rel && !rel.includes('/')) files.push(rel);
    }
    return { dirs, files };
}