// =====================================================================
// 上級者向け問題 (「上級者向け問題」タブ)
//   - 問題一覧 / 問題画面 / クリア画面
//   - 達成条件のチェックリスト (すべて満たすとクリア)
//   - 各問題は専用リポジトリをリセットして開始する
// =====================================================================

const practiceView = { state: 'list', index: -1, ctx: {} };

const PRACTICE = [
    {
        level: '初級',
        title: '2つのファイルを1つのコミットにする',
        blurb: 'Git の基本動作の確認。ファイルを作り、ステージし、1つのコミットとして記録します。',
        setup(ctx) {
            state.workingFiles = [];
        },
        checks: [
            { desc: 'リポジトリが初期化されている', test: () => state.initialized },
            { desc: 'meta.txt と notes.txt が作られている', test: () => state.workingFiles.includes('/meta.txt') && state.workingFiles.includes('/notes.txt') },
            { desc: '1つのコミットに2つのファイルが含まれている', test: () => {
                const tip = state.initialized && state.branches[state.currentBranch] ? state.branches[state.currentBranch].tip : null;
                return !!tip && state.commits[tip].files.includes('/meta.txt') && state.commits[tip].files.includes('/notes.txt');
            } },
            { desc: '「add」を含むメッセージでコミットできている', test: () => {
                const tip = state.initialized && state.branches[state.currentBranch] ? state.branches[state.currentBranch].tip : null;
                return !!tip && /add/i.test(state.commits[tip].message);
            } },
        ],
        solution: 'git init\ntouch meta.txt\ntouch notes.txt\ngit add meta.txt notes.txt\ngit commit -m "add two files"',
        explanation: 'touch でファイルを用意し、git add でステージに上げ、git commit で1つのコミットにまとめました。',
    },
    {
        level: '初級',
        title: 'ブランチで作業して main に統合する',
        blurb: 'ブランチの基本運用。feature ブランチで作業し、main にマージして、使ったブランチを片付けます。',
        setup(ctx) {
            state.workingFiles = [];
            gitInit();
            touchFiles(['base.txt']);
            gitAdd('base.txt');
            gitCommit('bootstrap');
        },
        checks: [
            { desc: '現在 main にいて、「feature」ブランチが存在しない(削除済み)', test: () => state.initialized && state.currentBranch === 'main' && !state.branches['feature'] },
            { desc: '「main」ブランチだけが残っている', test: () => state.initialized && Object.keys(state.branches).length === 1 },
            { desc: 'feature で作ったコミットが main に取り込まれている', test: () => {
                const tip = state.branches['main'] && state.branches['main'].tip;
                if (!tip) return false;
                return Object.keys(state.commits).some(id =>
                    /\bfeature\b/i.test(state.commits[id].message) && isAncestor(id, tip));
            } },
            { desc: '作業ツリーがきれい (変更・未コミットがない)', test: () => state.initialized
                && state.stagedFiles.length === 0
                && state.modified.length === 0
                && state.workingFiles.length === headCommitedFiles().length },
        ],
        solution: 'git checkout -b feature\ntouch feature.txt\ngit add feature.txt\ngit commit -m "add feature"\ngit checkout main\ngit merge feature\ngit branch -d feature',
        explanation: '「git checkout -b」でブランチを切り、コミットしてから main に戻って merge。分岐していないので「Fast-forward」で統合され、役目を終えたブランチは -d で削除できます。',
    },
    {
        level: '中級',
        title: '分岐してからマージ = マージコミットを作る',
        blurb: '本題の分岐合流。main と feature がそれぞれ新しいコミットを持った状態で merge すると「マージコミット」(親が2つ)ができます。',
        setup(ctx) {
            state.workingFiles = [];
            gitInit();
            touchFiles(['base.txt']);
            gitAdd('base.txt');
            gitCommit('bootstrap');
        },
        checks: [
            { desc: '「feature」ブランチが存在する', test: () => !!state.branches['feature'] },
            { desc: 'feature の作業が main にマージで取り込まれている', test: () => {
                const m = state.branches['main'] && state.branches['main'].tip;
                const f = state.branches['feature'] && state.branches['feature'].tip;
                return !!m && !!f && isAncestor(f, m);
            } },
            { desc: 'main に取り込んだ後、最新コミットがマージコミット(親が2つ)になっている', test: () => {
                const tip = state.branches['main'] && state.branches['main'].tip;
                return !!tip && state.commits[tip].parents.length === 2;
            } },
            { desc: 'feature と main の両方のファイルが main に含まれている', test: () => {
                const tip = state.branches['main'] && state.branches['main'].tip;
                if (!tip) return false;
                const files = state.commits[tip].files;
                return files.includes('/feature.txt') && files.includes('/main.txt');
            } },
        ],
        solution: 'git checkout -b feature\ntouch feature.txt\ngit add feature.txt\ngit commit -m "add feature"\ngit checkout main\ntouch main.txt\ngit add main.txt\ngit commit -m "add main"\ngit merge feature',
        explanation: '両方のブランチが進んだ状態で merge すると、親を2つ持つ「マージコミット」が生まれます。git log --graph や git graph で分岐が可視化されます。',
    },
    {
        level: '中級',
        title: 'GitHub (リモート) に公開する - push',
        blurb: 'GitHub 連携の第一歩。リモート origin を登録し、ローカルの main をプッシュして、origin と同期させます。',
        setup(ctx) {
            state.workingFiles = [];
            gitInit();
            touchFiles(['app.js']);
            gitAdd('app.js');
            gitCommit('initial commit');
            gitRemote('add origin https://github.com/you/sandbox.git');
        },
        checks: [
            { desc: 'リモート「origin」が登録されている', test: () => !!state.remote && state.remote.name === 'origin' },
            { desc: 'origin/main がローカルの main と同じコミットを指している (同期済み)', test: () => !!state.remote && !!state.remote.branches['main'] && state.remote.branches['main'] === state.branches['main'].tip },
            { desc: 'git status で ahead/behind が0 (up to date) ', test: () => {
                if (!state.remote || !state.remote.branches['main']) return false;
                const { ahead, behind } = aheadBehind('main');
                return ahead === 0 && behind === 0;
            } },
        ],
        solution: 'git status\ngit remote add origin https://github.com/you/sandbox.git\ngit push -u origin main\ngit status',
        explanation: 'リモートを登録して push すると、GitHub 上にブランチが作られ同期します。-u で追跡設定され、以後の push は短縮形で書けます。',
    },
    {
        level: '上級',
        title: 'GitHub 側の進みを取り込む - pull',
        blurb: 'リモートにだけ新しいコミットがある状態からの取り込み。開発相手は peer-commit で GitHub 上で直接コミット済みです。',
        setup(ctx) {
            state.workingFiles = [];
            gitInit();
            touchFiles(['app.js']);
            gitAdd('app.js');
            gitCommit('initial commit');
            gitRemote('add origin');
            gitPush('origin main');
            // 開発相手が GitHub 上で2コミット進めた
            peerCommitTip('main', 'update title (via GitHub)');
            peerCommitTip('main', 'fix typo (via GitHub)');
        },
        checks: [
            { desc: 'origin/main と同じコミットまでローカルが追いついている (同期済み)', test: () => !!state.remote && !!state.remote.branches['main'] && state.branches['main'].tip === state.remote.branches['main'] },
            { desc: '開発相手のコミットがローカルに取り込まれている', test: () => {
                const tip = state.branches['main'] && state.branches['main'].tip;
                if (!tip) return false;
                return Object.keys(state.commits).some(id => /via GitHub/i.test(state.commits[id].message) && isAncestor(id, tip));
            } },
            { desc: 'git status で up to date になっている', test: () => {
                if (!state.remote || !state.remote.branches['main']) return false;
                const { ahead, behind } = aheadBehind('main');
                return ahead === 0 && behind === 0;
            } },
        ],
        solution: 'git status       # behind になっている\ngit pull origin main\ngit status       # up to date になる',
        explanation: 'リモートにだけ新しいコミットがある状態を pull すると、Fast-forward でリモートの内容がローカルに取り込まれます。別ブランチの作業を取り込むのは git pull (分岐があればマージコミット)。',
    },
    {
        level: '上級',
        title: 'リモートのタグを確認する - tag の扱い',
        blurb: 'リリース管理の定番業務。特定のコミット（最新の main）に注釈付きタグ v1.0.0 を付けて、一覧で確認します。',
        setup(ctx) {
            state.workingFiles = [];
            gitInit();
            touchFiles(['app.js']);
            gitAdd('app.js');
            gitCommit('initial commit');
            gitRemote('add origin');
            gitPush('origin main');
            gitPeerCommit('main -m "fix critical bug (via GitHub)"');
            gitPull('origin main');
        },
        checks: [
            { desc: '注釈付きタグ v1.0.0 が付いている', test: () => !!state.tags['v1.0.0'] && state.tags['v1.0.0'].annotated },
            { desc: 'タグが最新の main (= origin/main) を指している', test: () => !!state.tags['v1.0.0'] && state.tags['v1.0.0'].commit === state.branches['main'].tip && state.tags['v1.0.0'].commit === state.remote.branches['main'] },
            { desc: 'タグのメッセージが「release」を含む', test: () => /release/i.test(state.tags['v1.0.0'].message) },
        ],
        solution: 'git tag -a v1.0.0 -m "release v1.0.0"\ngit tag',
        explanation: '「git tag -a」で注釈付きタグを作成します。-m でメッセージを添えると、リリースノート代わりにもなります。',
    },
    {
        level: '上級',
        title: 'push が拒否された時の衝突解決',
        blurb: 'あなたがローカルでコミットを重ねている間に、開発相手が GitHub 上でもコミットしました。この「分かれた状態」で push すると拒否されます。マージして解決しましょう。',
        setup(ctx) {
            state.workingFiles = [];
            gitInit();
            touchFiles(['app.js']);
            gitAdd('app.js');
            gitCommit('initial commit');
            gitRemote('add origin');
            gitPush('origin main');
            // 開発相手が GitHub 上で1コミット進めた
            peerCommitTip('main', 'update app.js (via GitHub)');
            // あなたもローカルで1コミット進めた → diverged (ahead=1, behind=1)
            touchFiles(['README.md']);
            gitAdd('README.md');
            gitCommit('feat: add README.md');
        },
        checks: [
            { desc: 'ローカルと origin/main が同じコミットを指している (同期済み)', test: () => !!state.remote && !!state.remote.branches['main'] && !!(state.remote.branches['main'] === state.branches['main'].tip), hint: 'git pull origin main で相手の変更を取り込んでから、git push origin main で送信すると同期します。' },
            { desc: 'ローカル先頭が2つの親を持つ「マージコミット」になっている', test: () => {
                const tip = state.branches['main'] && state.branches['main'].tip;
                return !!(tip && state.commits[tip].parents.length === 2);
            }, hint: '分かれた2つの線を結ぶには git pull origin main(分岐があるのでマージコミットが作られる) を使います。' },
            { desc: '開発相手 (via GitHub) のコミットがローカルに取り込まれている', test: () => {
                const tip = state.branches['main'] && state.branches['main'].tip;
                if (!tip) return false;
                return Object.keys(state.commits).some(id => /via GitHub/i.test(state.commits[id].message) && isAncestor(id, tip));
            }, hint: '修正用のコミットが git log --oneline に出てくるはずです。' },
            { desc: '自分のコミット (add README.md) が origin/main に含まれて同期済み', test: () => {
                if (!state.remote || !state.remote.branches['main']) return false;
                const r = state.remote.branches['main'];
                if (r !== state.branches['main'].tip) return false;
                return Object.keys(state.commits).some(id => /add README\.md/i.test(state.commits[id].message) && isAncestor(id, r));
            }, hint: '最後の git push origin main が通らないと自分のコミットは GitHub に届きません。' },
        ],
        solution: 'git push origin main   # rejected (non-fast-forward) になる\ngit pull origin main      # 分かれた2つの線をマージコミットで統合\ngit push origin main      # 今度は通る。同期完了',
        explanation: 'ローカルと GitHub が「分かれた状態」での push は、歴史を消す恐れがあるため拒否されます (non-fast-forward)。解決法は「先に pull」で相手の変更を取り込み、マージコミットで統合してから、改めて push すること。無理に force push せず、まず pull するのが鉄則です。',
    },
];

function renderPracticeList() {
    practiceView.state = 'list';
    practiceView.index = -1;
    let html = '<div class="pq-intro">';
    html += '<div class="wf-step-title">上級者向け問題</div>';
    html += '<p>達成すべき状態を作るコマンドを、入力して目指します。</p>';
    html += '<p>それぞれの<b>達成条件</b>がすべて満たされるとクリア。条件を満たさない限り、入力を試し続けられます。</p>';
    html += '<p>難しくて詰まったら「回答コマンド例」を参考にしてください。</p></div>';
    html += '<div class="pq-list">';
    for (let i = 0; i < PRACTICE.length; i++) {
        const p = PRACTICE[i];
        const lv = p.level === '上級' ? 'pq-lv-3' : (p.level === '中級' ? 'pq-lv-2' : 'pq-lv-1');
        html += `<button type="button" class="pq-card" data-pq="${i}">` +
                `<span class="pq-level ${lv}">${p.level}</span>` +
                `<span class="pq-title">${escapeHtml(p.title)}</span>` +
                `<span class="pq-blurb">${escapeHtml(p.blurb)}</span>` +
                `</button>`;
    }
    html += '</div>';
    pbLesson.innerHTML = html;

    pbLesson.querySelectorAll('[data-pq]').forEach(btn => {
        btn.addEventListener('click', () => startPractice(Number(btn.dataset.pq)));
    });
}

function startPractice(index) {
    resetRepo();
    practiceView.state = 'started';
    practiceView.index = index;
    practiceView.ctx = {};
    setSink('pb');
    pbOutput.innerHTML = '';
    const p = PRACTICE[index];
    const no = index + 1;
    out(`━━ 問題 ${no}: ${p.title} ━━`, 'yellow');
    out('専用のリポジトリを用意しました。達成条件を満たすようコマンドを入力してください。', 'gray');
    refreshPrompt();
    p.setup(practiceView.ctx);
    renderPractice();
    pbInput.focus();
    scrollBottom();
}

function practiceChecksPassed(p) {
    return p.checks.every(c => { try { return !!c.test(); } catch (e) { return false; } });
}

function renderPractice() {
    if (practiceView.state !== 'started') return;
    setSink('pb');
    const p = PRACTICE[practiceView.index];
    if (!p) return;

    if (practiceChecksPassed(p)) {
        renderPracticeDone(p);
        return;
    }

    let html = '';
    const done = p.checks.filter(c => { try { return !!c.test(); } catch (e) { return false; } }).length;
    html += `<div class="wf-progress-wrap">` +
            `<div class="wf-progress-label">達成条件 ${done} / ${p.checks.length}</div>` +
            `<div class="wf-progress-bar"><div class="wf-progress-fill" style="width:${Math.round(done / p.checks.length * 100)}%"></div></div>` +
            `</div>`;
    html += `<div class="wf-step-title"><span class="wf-step-no">問題 ${practiceView.index + 1}</span>${escapeHtml(p.title)}</div>`;
    html += `<div class="wf-body">${escapeHtml(p.blurb)}</div>`;
    html += `<div class="wf-label">▼ 達成条件</div>`;
    html += `<div class="pq-checks">`;
    for (let i = 0; i < p.checks.length; i++) {
        const c = p.checks[i];
        let ok = false;
        try { ok = !!c.test(); } catch (e) { ok = false; }
        html += `<div class="pq-check ${ok ? 'on' : 'off'}">` +
                `<span class="pq-mark">${ok ? '✅' : '⬜'}</span>` +
                `<span class="pq-desc">${escapeHtml(c.desc)}</span>` +
                (ok ? '' : `<span class="pq-hint">💡 ${escapeHtml(c.hint)}</span>`) +
                `</div>`;
    }
    html += `</div>`;
    if (p.checks.every(c => { try { return !!c.test(); } catch (e) { return false; } })) {
        html += `<div class="wf-actions"><button type="button" class="btn accent" id="pb-next">次へ進む</button></div>`;
        html += `<div class="wf-feedback" id="wf-feedback"></div>`;
    }
    pbLesson.innerHTML = html;
    pbLesson.scrollTop = 0;
    if (currentSink === sinks.pb) scrollBottom();
}

function renderPracticeDone(p) {
    practiceView.state = 'done';
    setSink('pb');
    let html = '<div class="wf-done-title">🎉 クリア!</div>';
    html += `<div class="wf-done-body"><p>${escapeHtml(p.title)} の達成条件をすべて満たしました。</p></div>`;
    html += `<div class="wf-label">▼ 回答コマンド例</div>`;
    html += `<pre class="wf-cmd-line">${escapeHtml(p.solution)}</pre>`;
    html += `<div class="wf-label">▼ 解説</div>`;
    html += `<div class="wf-body"><p>${escapeHtml(p.explanation)}</p></div>`;
    html += `<div class="wf-actions"><button type="button" class="btn accent" id="pb-next">次の問題へ / 一覧に戻る</button></div>`;
    pbLesson.innerHTML = html;
    document.getElementById('pb-next').addEventListener('click', () => {
        renderPracticeList();
        scrollBottom();
    });
    pbLesson.scrollTop = 0;
    if (currentSink === sinks.pb) scrollBottom();
}

function practiceOnCommand(cmd) {
    if (practiceView.state !== 'started') return;
    renderPractice();
    if (currentSink === sinks.pb) scrollBottom();
}