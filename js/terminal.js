// =====================================================================
// ターミナル UI・出力・コマンドディスパッチ
//   - 2つのターミナル (sb / wf) への出力 (out/echo)
//   - 入力バインド・履歴・タブ切り替え
//   - help / コマンド分岐 (dispatch)
// =====================================================================

// ---------------------------------------------------------------------
// DOM / 出力先 (2つのターミナルを持ち、アクティブな方へ出力する)
// ---------------------------------------------------------------------
const baseScroll = document.getElementById('base-scroll');
const baseOutput = document.getElementById('base-output');
const baseInput = document.getElementById('base-input');
const basePrompt = document.getElementById('base-prompt');

const wfScroll = document.getElementById('wf-scroll');
const wfOutput = document.getElementById('wf-output');
const wfInput = document.getElementById('wf-input');
const wfPrompt = document.getElementById('wf-prompt');
const wfLesson = document.getElementById('wf-lesson');
const wfResetBtn = document.getElementById('wf-reset');

const pbScroll = document.getElementById('pb-scroll');
const pbOutput = document.getElementById('pb-output');
const pbInput = document.getElementById('pb-input');
const pbPrompt = document.getElementById('pb-prompt');
const pbLesson = document.getElementById('pb-lesson');
const pbBackBtn = document.getElementById('pb-back');

const sinks = {
    sb: { output: baseOutput, scroll: baseScroll, prompt: basePrompt },
    wf: { output: wfOutput, scroll: wfScroll, prompt: wfPrompt },
    pb: { output: pbOutput, scroll: pbScroll, prompt: pbPrompt },
};
let currentSink = sinks.sb;

function setSink(key) {
    currentSink = sinks[key] || sinks.sb;
}

function promptText() {
    const p = 'PS ' + displayPath(fsState.cwd);
    const br = state.initialized && state.currentBranch ? ' [' + state.currentBranch + ']' : '';
    return p + br + '> ';
}

function refreshPrompt() {
    basePrompt.textContent = promptText();
    wfPrompt.textContent = promptText();
    pbPrompt.textContent = promptText();
}

// ---------------------------------------------------------------------
// 出力ヘルパー (現在アクティブなターミナルへ)
// ---------------------------------------------------------------------
function out(text, cls) {
    if (text === undefined || text === null) text = '';
    const parts = String(text).split('\n');
    for (const line of parts) {
        const pre = document.createElement('pre');
        pre.className = 'line' + (cls ? ' ' + cls : '');
        pre.textContent = line;
        currentSink.output.appendChild(pre);
    }
    scrollBottom();
}

function echo(cmd) {
    const div = document.createElement('div');
    div.className = 'cmdline';
    const s = document.createElement('span');
    s.className = 'prompt';
    s.textContent = promptText();
    const c = document.createElement('span');
    c.className = 'cmd';
    c.textContent = cmd;
    div.appendChild(s);
    div.appendChild(c);
    currentSink.output.appendChild(div);
    scrollBottom();
}

function scrollBottom() {
    currentSink.scroll.scrollTop = currentSink.scroll.scrollHeight;
}

// ---------------------------------------------------------------------
// help
// ---------------------------------------------------------------------
function showHelp() {
    out('Git 操作サンドボックスへようこそ!', 'yellow');
    out('ブランチツリーの確認や Git コマンドの練習ができます。', 'gray');
    out('');
    out('== リポジトリ操作 ==', 'cyan');
    out('  git init                 リポジトリを初期化する');
    out('  git status               現在の状態を確認する');
    out('  git log [--oneline]     コミット履歴を確認する(--graph で分岐表示)');
    out('  git graph                SVG でブランチツリーを表示 (独自コマンド)');
    out('  git tag <name>           タグを付ける (-a <name> -m "msg" で注釈付き)');
    out('  git reset                ステージ登録を取り消す');
    out('');
    out('== コミット ==', 'cyan');
    out('  touch <file>             ファイルを作成/更新');
    out('  git add <file>           ステージに追加 ("git add ." で今いる場所以下を追加)');
    out('  git commit -m "メッセージ"  コミットを作成');
    out('');
    out('== ブランチ ==', 'cyan');
    out('  git branch [name]        一覧/作成');
    out('  git branch -d/-D <name>  削除');
    out('  git checkout [-b] <name> 切り替え/新規作成して切り替え');
    out('  git switch [-c] <name>   checkout と同じ');
    out('  git merge <name>         現在のブランチに統合');
    out('');
    out('== Windows ターミナル操作 ==', 'cyan');
    out('  pwd / cd / mkdir / rmdir / ls / dir / tree / rm <file>');
    out('');
    out('== GitHub / リモート ==', 'cyan');
    out('  git remote add origin <url>   GitHub のリポジトリを登録 (省略時デフォルトURL)');
    out('  git remote [-v]               リモート一覧 / 詳細');
    out('  git push [-u] [origin] [branch] コミットを GitHub に送る');
    out('  git pull [origin] [branch]    GitHub の変更を取り込む (fetch + merge)');
    out('  git fetch [origin]            GitHub から取り込み情報だけ更新');
    out('  git peer-commit <branch> -m "msg"  開発相手の GitHub 操作をシミュレート (独自コマンド)');
    out('  git status / git branch -vv   origin との ahead/behind を表示');
    out('');
    out('== その他 ==', 'cyan');
    out('  help / clear (Ctrl+L) / exit');
    out('');
    out('上部の「開発フローで学ぶ」タブで実開発の手順を、「上級者向け問題」タブで練習問題を解けます。', 'yellow');
    out('');
    out('おすすめの流れ:', 'gray');
    out('  git init → touch README.md → git add . → git commit -m "initial"', 'white');
    out('  → git checkout -b feature → touch feature.txt → git add .', 'white');
    out('  → git commit -m "add feature" → git graph でツリーを確認!', 'white');
}

// ---------------------------------------------------------------------
// コマンドディスパッチ
// ---------------------------------------------------------------------
function guardInit() {
    if (!state.initialized) {
        out('fatal: not a git repository (or any of the parent directories) to .git', 'red');
        return false;
    }
    return true;
}

function dispatchGit(body) {
    const pieces = body.split(/\s+/).filter(Boolean);
    const sub = pieces[0];
    const rest = body.slice(sub.length).trim();

    switch (sub) {
        case 'init': gitInit(); break;
        case 'status': gitStatus(); break;
        case 'add': gitAdd(rest); break;
        case 'rm':
            if (pieces[1] === '--cached') gitReset();
            else rmFiles(pieces.slice(1));
            break;
        case 'commit': {
            const m = rest.match(/^-m\s+"([\s\S]*?)"\s*$/);
            gitCommit(m ? m[1] : (rest.match(/^-m\s+(.+)$/)?.[1] || null));
            break;
        }
        case 'branch': gitBranch(rest); break;
        case 'checkout': gitCheckout(rest); break;
        case 'switch': gitSwitch(rest); break;
        case 'merge': gitMerge(rest); break;
        case 'log': gitLog(rest); break;
        case 'graph': gitGraph(); break;
        case 'tag': gitTag(rest); break;
        case 'reset': gitReset(); break;
        case 'remote': gitRemote(rest); break;
        case 'push': gitPush(rest); break;
        case 'fetch': gitFetch(rest); break;
        case 'pull': gitPull(rest); break;
        case 'peer-commit': gitPeerCommit(rest); break;
        case 'help':
        case '--help': showHelp(); break;
        case 'version':
        case '--version':
            out('git version 2.40.0'); break;
        default:
            out(`git: '${sub}' is not a git command. See 'git --help'.`, 'red');
    }
}

function dispatchCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    echo(trimmed);

    if (/^git\s+/.test(trimmed)) {
        dispatchGit(trimmed.replace(/^git\s+/, ''));
        refreshPrompt();
        return;
    }

    const pieces = trimmed.split(/\s+/).filter(Boolean);
    const cmd = pieces[0];

    switch (cmd) {
        case 'help': showHelp(); break;
        case 'clear': currentSink.output.innerHTML = ''; break;
        case 'pwd': cmdPwd(); break;
        case 'cd': cmdCd(pieces.slice(1).join(' ')); break;
        case 'mkdir': cmdMkdir(pieces.slice(1).join(' ')); break;
        case 'rmdir': cmdRmdir(pieces.slice(1).join(' ')); break;
        case 'ls':
        case 'dir': cmdLs(); break;
        case 'tree': cmdTree(); break;
        case 'touch': touchFiles(pieces.slice(1)); break;
        case 'del':
        case 'rm': rmFiles(pieces.slice(1)); break;
        case 'exit':
        case 'quit': out('(サンドボックスを閉じるにはタブを閉じてください)', 'gray'); break;
        default:
            out(`The term '${cmd}' is not recognized as the name of a cmdlet, function, ` +
                'script file, or operable program.', 'red');
    }
    refreshPrompt();
}

// ---------------------------------------------------------------------
// タブ切り替え
// ---------------------------------------------------------------------
function activateTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
    setSink(name);
    refreshPrompt();
    if (name === 'workflow') {
        wfInput.focus();
    } else if (name === 'practice') {
        pbInput.focus();
    } else {
        baseInput.focus();
    }
    scrollBottom();
}

// ---------------------------------------------------------------------
// ターミナル入力 (2つのターミナル共通)
// ---------------------------------------------------------------------
const histories = { sb: [], wf: [], pb: [] };
const historyIdx = { sb: -1, wf: -1, pb: -1 };

function bindInput(inputEl, sinkKey, afterRun) {
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = inputEl.value.trim();
            if (cmd) {
                histories[sinkKey].push(cmd);
                historyIdx[sinkKey] = histories[sinkKey].length;
                setSink(sinkKey);
                dispatchCommand(cmd);
                if (afterRun) afterRun(cmd);
            }
            inputEl.value = '';
            refreshPrompt();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const h = histories[sinkKey];
            if (h.length === 0) return;
            historyIdx[sinkKey] = Math.max(0, (historyIdx[sinkKey] === -1 ? h.length : historyIdx[sinkKey]) - 1);
            inputEl.value = h[historyIdx[sinkKey]];
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const h = histories[sinkKey];
            if (h.length === 0) return;
            historyIdx[sinkKey] += 1;
            if (historyIdx[sinkKey] >= h.length) {
                historyIdx[sinkKey] = h.length;
                inputEl.value = '';
            } else {
                inputEl.value = h[historyIdx[sinkKey]];
            }
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            setSink(sinkKey);
            currentSink.output.innerHTML = '';
        }
    });
}

function focusOnClick(panel, input) {
    panel.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') input.focus();
    });
}