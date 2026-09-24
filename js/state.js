// =====================================================================
// 状態管理・定数・汎用ユーティリティ
//   - シミュレーション用リポジトリ (state)
//   - 仮想ファイルシステム (fsState)
//   - ブランチ色パレット / ID・日付生成 / 祖先判定 / HTMLエスケープ
//   - リポジトリのリセット
// =====================================================================

// ---------------------------------------------------------------------
// 状態 (シミュレーション用のリポジトリ)
// ---------------------------------------------------------------------
const state = {
    initialized: false,
    currentBranch: null,
    branches: {},          // name -> { tip: commitId|null, color }
    nextColor: 0,          // 次に割り当てるブランチ色のインデックス
    commits: {},           // id -> { id, message, parents:[], files:[], date, seq }
    seq: 0,
    stagedFiles: [],       // ステージされたファイル(絶対パス)
    workingFiles: ['/README.md', '/src/app.js', '/src/utils.js'],
    modified: [],          // 追跡済みで変更されたファイル(絶対パス)
    tags: {},              // name -> { commit, annotated, message, date }
    remote: null,          // { name, url, branches: {name->tip}, synced: {name->lastFetchTip} } / null で未設定
};

// ---------------------------------------------------------------------
// ファイルシステム (サンドボックス用の仮想ディレクトリ)
// ---------------------------------------------------------------------
const fsState = {
    dirs: new Set(['/', '/src']),   // 存在するディレクトリ(絶対パス)
    cwd: '/',                       // 現在のディレクトリ
};

const PALETTE = [
    '#58a6ff', '#3fb950', '#f778ba', '#e3b341', '#a371f7', '#39c5cf',
    '#ffa657', '#79c0ff', '#7ee787', '#f0883e',
];

function nextBranchColor() {
    const c = PALETTE[state.nextColor % PALETTE.length];
    state.nextColor += 1;
    return c;
}

// ---------------------------------------------------------------------
// 汎用ユーティリティ
// ---------------------------------------------------------------------
let idCounter = 0;
function genId() {
    idCounter += 1;
    const r = Math.floor(Math.random() * 0xffffffff).toString(16);
    return 'a0f' + idCounter.toString(16) + r.slice(0, 4);
}

function fmtDate() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function isAncestor(candidateId, fromId) {
    if (!state.commits[candidateId] || !state.commits[fromId]) return false;
    const stack = [fromId];
    const seen = new Set();
    while (stack.length) {
        const id = stack.pop();
        if (seen.has(id)) continue;
        seen.add(id);
        if (id === candidateId) return true;
        for (const p of state.commits[id].parents) stack.push(p);
    }
    return false;
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---------------------------------------------------------------------
// リポジトリのリセット
// ---------------------------------------------------------------------
function resetRepo() {
    state.initialized = false;
    state.currentBranch = null;
    state.branches = {};
    state.nextColor = 0;
    state.commits = {};
    state.seq = 0;
    state.stagedFiles = [];
    state.workingFiles = ['/README.md', '/src/app.js', '/src/utils.js'];
    state.modified = [];
    state.tags = {};
    state.remote = null;
    fsState.dirs = new Set(['/', '/src']);
    fsState.cwd = '/';
    idCounter = 0;
    refreshPrompt();
}