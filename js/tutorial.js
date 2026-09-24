// =====================================================================
// 開発フローチュートリアル (「開発フローで学ぶ」タブ)
//   - ステップ定義 (TUTORIAL)
//   - レンダリング (開始画面 / ステップ / 完了画面)
//   - 入力検証・自動実行・フィードバック
// =====================================================================

const workflowView = { state: 'start', index: -1 };

const TUTORIAL = [
    {
        title: 'リポジトリを初期化する',
        body: [
            '開発のスタート地点です。開発対象のフォルダを Git の管理下に置くのが「git init」の役割。',
            'これを実行すると .git フォルダが作られ、以降ファイルの変更履歴を記録できるようになります。',
        ],
        command: 'git init',
        parts: [
            { t: 'git init', d: '今のフォルダを Git リポジトリにする。これで変更履歴の記録が始められる' },
        ],
        commands: ['git init'],
        hint: '画面下の入力欄に「git init」と入力して Enter を押してください。',
        check: (cmd) => state.initialized,
        success: ['リポジトリが初期化されました。プロンプトに [main] が表示されたはずです。', '次は現在の状態を確認します。'],
    },
    {
        title: '現在の状態を確認する',
        body: [
            'Git は「ワークツリー(作業フォルダ) → ステージ(仮置き場) → コミット(記録)」の3段構えです。',
            '何をしていいのか分からなくなったら、まず「git status」です。現在の状態を必ず確認する習慣をつけましょう。',
        ],
        command: 'git status',
        parts: [
            { t: 'git status', d: '現在のブランチ、ステージ済み、未追跡のファイルなどを一覧表示する' },
            { t: 'Untracked files', d: 'Git がまだ追跡していないファイル(新しく作ったファイル)を意味する' },
        ],
        commands: ['git status'],
        hint: '「git status」と入力して Enter を押してください。',
        check: (cmd) => /^git status/.test(cmd),
        success: ['状態が確認できました。今は README.md などが「Untracked」になっています。', '次はこのファイルをコミットの候補(ステージ)に上げます。'],
    },
    {
        title: 'ファイルをステージに追加する',
        body: [
            'コミットするファイルを選んで仮置き場(ステージ)に上げるのが「git add」です。',
            'README.md を作成し、「git status」で Untracked に現れることを確認したあと、git add でステージに追加しましょう。',
        ],
        command: 'touch README.md\n→ git status\n→ git add README.md',
        parts: [
            { t: 'touch README.md', d: '空のファイル README.md を作成する(ターミナルのコマンド)' },
            { t: 'git status', d: '作ったファイルが Untracked に表示されるのを確認する' },
            { t: 'git add README.md', d: 'README.md をステージ(コミット候補)に追加する' },
            { t: 'git add .', d: '今いるフォルダ以下の変更をまとめてステージする省略形' },
        ],
        commands: ['touch README.md', 'git status', 'git add README.md'],
        hint: '「touch README.md」「git add README.md」の順に入力してください。ステージできたら git status で「Changes to be committed」に出るはずです。',
        check: () => state.stagedFiles.some(f => f.includes('README.md')),
        success: ['README.md がステージに載りました("Changes to be committed" に表示)。', 'いよいよ最初のコミットを作ります。'],
    },
    {
        title: '最初のコミットを作る',
        body: [
            'コミットとは「その時点のスナップショット(写真のようなもの)」を Git に保存することです。',
            '一緒に書く「コミットメッセージ」は、あとで履歴を遡る時の頼りになります。短く、その変更が何かを表す文を書きましょう。',
        ],
        command: 'git commit -m "initial commit"',
        parts: [
            { t: 'git commit', d: 'ステージ済みの変更をコミットとして記録する' },
            { t: '-m "..."', d: 'コミットメッセージを指定する。省略するとエディタが開く(実物の挙動)' },
            { t: '"initial commit"', d: '最初のコミットを表す定番メッセージ' },
        ],
        commands: ['git commit -m "initial commit"'],
        hint: '「git commit -m "initial commit"」と入力してください。メッセージは必ずダブルクォートで囲みます。',
        check: () => Object.keys(state.commits).length >= 1,
        success: ['最初のコミットができました! この時点のファイル内容が履歴に残りました。', '履歴を確認してみましょう。'],
    },
    {
        title: '履歴を確認する',
        body: [
            '「git log」でコミットの履歴(=プロジェクトの歴史)を新しい順に見られます。',
            '--oneline を付けると1コミット1行の簡潔な表示に、--graph を付けるとブランチの分岐を線で描画してくれます。ここで両方試してみましょう。',
        ],
        command: 'git log --oneline\n→ git log --graph',
        parts: [
            { t: 'git log', d: 'コミット履歴を新しい順に表示する' },
            { t: '--oneline', d: '各コミットを1行で表示。「進捗ID(ハッシュ) + メッセージ」だけになる' },
            { t: '--graph', d: 'ブランチの分岐・統合を文字の線で可視化する' },
        ],
        commands: ['git log --oneline', 'git log --graph'],
        hint: '「git log --oneline」と入力してください。履歴が1件表示されます。',
        check: (cmd) => /^git log/.test(cmd),
        success: ['履歴を確認できました。hash(進捗を示すID)とメッセージが並んでいます。', '次は、新機能開発のための「ブランチ」を切ります。'],
    },
    {
        title: 'ブランチを切って新機能の開発を始める',
        body: [
            '本流(main)とは別の「作業線」を作るのがブランチです。main を壊さずに新機能を進められます。',
            '「git checkout -b」で「ブランチを作成して、その場で切り替え」までを一気に行います。ブランチ名は「機能/内容」という英語の命名が定番です。',
        ],
        command: 'git checkout -b feature/homepage',
        parts: [
            { t: 'git checkout', d: 'ブランチを切り替える(移動する)' },
            { t: '-b <name>', d: '存在しないブランチを作成して、その場で切り替える' },
            { t: 'feature/homepage', d: 'ブランチ名。「<機能>/<内容>」のような命名がよく使われる' },
        ],
        commands: ['git checkout -b feature/homepage'],
        hint: '「git checkout -b feature/homepage」と入力してください。プロンプトのブランチ名が変わったはずです。',
        check: () => Object.keys(state.branches).some(b => b !== 'main'),
        success: ['feature/homepage ブランチに移動しました。main から分かれた別の線ができています。', 'このブランチの上で作業してコミットします。'],
    },
    {
        title: 'ブランチの上で作業してコミットする',
        body: [
            'ブランチ上でファイルを1つ追加して、コミットしましょう。',
            'このコミットは feature/homepage にだけ積まれます。main の履歴は変わりません。これを「main は安全なまま、並行して開発できる」ことの体感になります。',
        ],
        command: 'touch homepage.txt\n→ git add homepage.txt\n→ git commit -m "add homepage"',
        parts: [
            { t: 'touch homepage.txt', d: 'ブランチ上で新しいファイルを作成する' },
            { t: 'git add homepage.txt', d: 'ステージに追加する' },
            { t: 'git commit -m "add homepage"', d: 'コミットを作成。これで feature/homepage だけが1つ進む' },
        ],
        commands: ['touch homepage.txt', 'git add homepage.txt', 'git commit -m "add homepage"'],
        hint: '「touch homepage.txt」「git add homepage.txt」「git commit -m "add homepage"」の順に入力してください。',
        check: () => {
            const b = state.currentBranch;
            if (!b || b === 'main') return false;
            const bTip = state.branches[b] && state.branches[b].tip;
            const mTip = state.branches['main'] && state.branches['main'].tip;
            return !!bTip && bTip !== mTip;
        },
        success: ['feature/homepage にだけコミットが積まれました。main はまだ変わっていません。', 'この機能を main に取り込みましょう。先に main へ戻ります。'],
    },
    {
        title: '統合の前に main へ戻る',
        body: [
            '完成した機能を main に取り込む(マージ)ためには、受け入れ側の main ブランチに移動します。',
            'マージする前には必ず「どこにいるか」を確認しましょう。今いるブランチが重要です。',
        ],
        command: 'git checkout main',
        parts: [
            { t: 'git checkout main', d: 'main ブランチに切り替える' },
        ],
        commands: ['git checkout main'],
        hint: '「git checkout main」と入力してください。プロンプトが [main] に戻ります。',
        check: () => state.currentBranch === 'main',
        success: ['main に戻れました。', 'feature/homepage の内容を main にマージします。'],
    },
    {
        title: 'feature を main にマージする',
        body: [
            'ブランチで作った変更を現在のブランチに取り込むのが「git merge」です。',
            'main と feature は分岐していない(一直線)なので、「Fast-forward」という形で main が feature の先頭まで追いつきます。',
        ],
        command: 'git merge feature/homepage',
        parts: [
            { t: 'git merge <name>', d: '指定ブランチの変更を現在のブランチに取り込む' },
            { t: 'Fast-forward', d: '分岐していない場合に起こるマージ。履歴が一直線に前進する' },
            { t: 'Merge made by ...', d: '分岐がある場合に作られる「マージコミット」。両方の変更を統合する' },
        ],
        commands: ['git merge feature/homepage'],
        hint: '「git merge feature/homepage」と入力してください。Fast-forward と表示されれば成功です。',
        check: () => {
            const f = Object.keys(state.branches).find(b => b !== 'main');
            if (!f) return false;
            const mTip = state.branches['main'] && state.branches['main'].tip;
            const fTip = state.branches[f] && state.branches[f].tip;
            return !!mTip && !!fTip && isAncestor(fTip, mTip);
        },
        success: ['マージできました。main に feature の変更が取り込まれました。', '役目を終えたブランチを片付けます。'],
    },
    {
        title: '役目を終えたブランチを削除する',
        body: [
            'マージ済みのブランチは、残しておくと混雑するので削除するのが一般的です。',
            '「git branch -d」は「マージ済みなら削除、マージされていなければ安全のためエラー」という賢いコマンド。強制で消す -D はマージしていないブランチを消す時だけ使います。',
        ],
        command: 'git branch -d feature/homepage',
        parts: [
            { t: 'git branch', d: 'ブランチの管理コマンド(一覧/作成/削除など)' },
            { t: '-d <name>', d: 'マージ済みブランチの削除。未マージならエラーになる(安全設計)' },
            { t: '-D <name>', d: '強制削除。マージしていない履歴を消してしまうので注意' },
        ],
        commands: ['git branch -d feature/homepage'],
        hint: '「git branch -d feature/homepage」と入力してください。main だけが残れば成功。',
        check: () => Object.keys(state.branches).length === 1,
        success: ['ブランチを削除できました。git branch で確認すると main だけが残っています。', '最後に、リリース時の目印となる「タグ」を付けてみましょう。'],
    },
    {
        title: 'リリースに目印のタグを付ける',
        body: [
            '「このコミットで v1.0 をリリースした」のように、特定のコミットに名前を付けておくと、後からその版を確実に参照できます。これがタグです。',
            '「git tag」で一覧表示、「git tag -a 名前 -m "メッセージ"」で注釈付きタグを作成できます。',
        ],
        command: 'git tag -a v1.0.0 -m "release v1.0.0"',
        parts: [
            { t: 'git tag', d: 'タグの一覧表示(引数なし)またはタグ操作' },
            { t: '-a <name>', d: '注釈付きタグを作成(作った人や日付も記録される)' },
            { t: '-m "..."', d: 'タグに付けるメッセージ' },
            { t: 'git tag', d: '一覧を出すと v1.0.0 が確認できる' },
        ],
        commands: ['git tag -a v1.0.0 -m "release v1.0.0"', 'git tag'],
        hint: '「git tag -a v1.0.0 -m "release v1.0.0"」と入力してください。git tag で一覧に v1.0.0 が出れば成功。',
        check: () => !!state.tags['v1.0.0'],
        success: ['タグ v1.0.0 を付けることができました。git graph で見るとコミットの横に表示されます。'],
    },
    {
        title: null,
    },
];

function renderWorkflowStart() {
    workflowView.state = 'start';
    workflowView.index = -1;
    wfLesson.innerHTML =
        '<div class="wf-step-title">開発フローで Git を学ぶ</div>' +
        '<div class="wf-body"><p>実開発で使う手順「初期化 → コミット → ブランチ → マージ → タグ」' +
        'を、1ステップずつ入力しながら学びます。</p>' +
        '<p>手順どおりにコマンドを入力すると自動的にチェックされ、次のステップへ進みます。</p>' +
        '<p>「自動実行」でお手本どおりにコマンドを打たせたり、「ヒント」で行き詰まりを解消できます。</p></div>' +
        '<div class="wf-actions"><button type="button" class="btn accent" id="wf-start-btn">スタート</button></div>';
    document.getElementById('wf-start-btn').addEventListener('click', () => startTutorial());
    wfOutput.innerHTML = '';
}

function startTutorial() {
    resetRepo();
    workflowView.state = 'started';
    workflowView.index = 0;
    setSink('wf');
    out('━━ 開発フローチュートリアル開始 ━━', 'yellow');
    out('専用のリポジトリをリセットしました。指示に従ってコマンドを入力してください。', 'gray');
    refreshPrompt();
    renderWorkflowStep();
}

function renderWorkflowStep() {
    if (workflowView.state !== 'started') return;
    setSink('wf');

    if (workflowView.index >= TUTORIAL.length - 1) {
        renderWorkflowDone();
        return;
    }
    const step = TUTORIAL[workflowView.index];
    const no = workflowView.index + 1;
    const total = TUTORIAL.length - 1;
    const progress = Math.round((no / total) * 100);

    let html = '';
    html += `<div class="wf-progress-wrap">` +
            `<div class="wf-progress-label">ステップ ${no} / ${total} (${progress}%)</div>` +
            `<div class="wf-progress-bar"><div class="wf-progress-fill" style="width:${progress}%"></div></div>` +
            `</div>`;
    html += `<div class="wf-step-title"><span class="wf-step-no">STEP ${no}</span>${escapeHtml(step.title)}</div>`;
    html += `<div class="wf-body">${step.body.map(p => `<p>${escapeHtml(p)}</p>`).join('')}</div>`;

    if (step.command) {
        html += `<div class="wf-label">▼ 実際に入力するコマンド例</div>`;
        html += `<pre class="wf-cmd-line">&gt; ${escapeHtml(step.command)}</pre>`;
    }
    if (step.parts) {
        html += `<div class="wf-label">▼ コマンド解説</div>`;
        html += `<div class="wf-parts">`;
        for (const part of step.parts) {
            html += `<div class="wf-part"><span class="wf-token">${escapeHtml(part.t)}</span>` +
                    `<span class="wf-desc">${escapeHtml(part.d)}</span></div>`;
        }
        html += `</div>`;
    }

    html += `<div class="wf-hint" id="wf-hint-box">💡 ${escapeHtml(step.hint)}</div>`;
    html += `<div class="wf-actions">` +
            `<button type="button" class="btn run" data-wf="run">自動実行 (お手本どおりに入力)</button>` +
            `<button type="button" class="btn" data-wf="hint">ヒントを見る</button>` +
            `<button type="button" class="btn" data-wf="skip">スキップ</button>` +
            `</div>`;
    html += `<div class="wf-feedback" id="wf-feedback"></div>`;

    wfLesson.innerHTML = html;

    wfLesson.querySelector('[data-wf="run"]').addEventListener('click', () => workflowAutoRun());
    wfLesson.querySelector('[data-wf="hint"]').addEventListener('click', () => {
        document.getElementById('wf-hint-box').classList.toggle('show');
    });
    wfLesson.querySelector('[data-wf="skip"]').addEventListener('click', () => workflowAdvance(false));
    wfLesson.scrollTop = 0;
    if (currentSink === sinks.wf) scrollBottom();
    wfInput.focus();
}

function workflowAdvance(withBadge) {
    if (workflowView.state !== 'started') return;
    if (workflowView.index >= TUTORIAL.length - 1) return;
    renderWorkflowStep();
    wfInput.focus();
}

function workflowFeedback(texts, ok) {
    const fb = document.getElementById('wf-feedback');
    if (!fb) return;
    let html = ok ? '<span class="wf-badge">✅ ステップ完了!</span>' : '<span class="wf-badge" style="background:#a33612">❌ まだ未達</span>';
    html += `<div class="wf-success">${texts.map(t => escapeHtml(t)).join('<br>')}</div>`;
    fb.innerHTML = html;
    wfLesson.scrollTop = wfLesson.scrollHeight;
}

function workflowTryStep(cmd) {
    if (workflowView.state !== 'started') return;
    const step = TUTORIAL[workflowView.index];
    if (!step || !step.check) return;

    const ok = step.check(cmd);
    if (ok) {
        if (workflowView.index >= TUTORIAL.length - 2) {
            workflowView.index += 1;
            renderWorkflowDone();
            return;
        }
        setSink('wf');
        for (const line of step.success) out('✔ ' + line, 'green');
        workflowView.index += 1;
        renderWorkflowStep();
    } else {
        workflowFeedback(['まだ完了条件を満たしていません。', 'ヒント: ' + step.hint], false);
    }
}

function workflowAutoRun() {
    if (workflowView.state !== 'started') return;
    setSink('wf');
    const step = TUTORIAL[workflowView.index];
    out('── 自動実行(お手本どおりに入力) ──', 'dim');
    let last = '';
    for (const c of step.commands) {
        last = c;
        dispatchCommand(c);
    }
    workflowTryStep(last);
}

function workflowOnCommand(cmd) {
    workflowTryStep(cmd);
    if (currentSink === sinks.wf) scrollBottom();
}

function renderWorkflowDone() {
    workflowView.state = 'done';
    setSink('wf');
    wfLesson.innerHTML =
        '<div class="wf-done-title">🎉 おつかれさまでした!</div>' +
        '<div class="wf-done-body">' +
        '<p>実際の開発でよく使う一連の流れを最後まで通しで練習できました。ここまでの流れをおさらいします。</p>' +
        '<p><b>1. git init</b> … リポジトリを作る<br>' +
        '<b>2. git status</b> … 常に現在地を確認する<br>' +
        '<b>3. git add</b> … コミットする候補をステージに上げる<br>' +
        '<b>4. git commit -m "..."</b> … スナップショットを記録する<br>' +
        '<b>5. git log --oneline / --graph</b> … 履歴・分岐を確認する<br>' +
        '<b>6. git checkout -b 名前</b> … 機能ごとにブランチを切る<br>' +
        '<b>7. ブランチ上でコミット → git checkout main → git merge</b> … 本流へ統合<br>' +
        '<b>8. git branch -d 名前</b> … 不要になったブランチを消す<br>' +
        '<b>9. git tag -a v1.0.0 -m "..."</b> … リリース版に目印を付ける</p>' +
        '<p>「ターミナル」タブに戻ると、この練習で作ったリポジトリがそのまま残っています。' +
        '自由に git graph でツリーを見たり、さらに操作を試してみましょう!</p>' +
        '<p><b>「最初からやり直す」</b>ボタンで同じ手順をもう一度練習できます。</p>' +
        '</div>';
    wfInput.focus();
}