// =====================================================================
// 早見表 (「早見表」タブ)
//   - 「こんなときどうする?」な状況ごとに、コマンドと手順を整理して表示
//   - カテゴリー絞り込み + キーワード検索に対応
//   - 各コマンドはサンドボックスのターミナルでそのまま試せる
// =====================================================================

const CSSECTIONS = [
    {
        key: 'basic',
        label: '基本操作',
        color: 'pq-lv-1',
        items: [
            {
                t: 'これから開発(リポジトリ)を始めたい',
                k: ['init', 'はじめ', '最初', '新規', 'リポジトリ', '作る', 'start'],
                cmds: [
                    { c: 'git init', d: '今のフォルダを Git 管理下に置く (.git が作られる)' },
                ],
                s: ['① 開発するテキストファイルを touch で作る',
                    '② git add ファイル名 → git commit -m "メッセージ" で初回コミット'],
                note: 'プロンプトに [main] と表示されたら管理下に入っています。',
            },
            {
                t: '今、何をすればいいか分からない',
                k: ['status', '状態', '確認', '迷う', 'いま', '今', 'どう', '何を', 'わからない'],
                cmds: [
                    { c: 'git status', d: '変更・ステージ・未保存の一覧。迷ったらまずこれ' },
                    { c: 'git log --oneline', d: 'これまでのコミットを1行ずつ表示' },
                    { c: 'git graph', d: 'ブランチの枝を画像で表示 (このサンドボックス独自コマンド)' },
                ],
                s: ['① git status で「コミット待ち」か「変更あり」かを見る',
                    '② 作業が一段落したら git add → git commit で記録'],
            },
            {
                t: 'ファイルをコミットしたい',
                k: ['コミット', 'add', 'commit', '保存', '記録', 'stage', 'ステージ'],
                cmds: [
                    { c: 'git add <ファイル名>', d: 'そのファイルをコミット候補(ステージ)へ' },
                    { c: 'git commit -m "メッセージ"', d: 'スナップショットとして記録する' },
                ],
                s: ['① git add ファイル名', '② git commit -m "何をしたか簡潔に"'],
                note: 'add を忘れると「nothing added to commit」と言われます。忘れずに add → commit。',
            },
            {
                t: '複数のファイルをまとめてコミットしたい',
                k: ['まとめ', 'add .', 'いちど', '一度', '全部', 'all'],
                cmds: [
                    { c: 'git add .', d: '今いる場所とその下の変更を全部ステージする' },
                    { c: 'git add -A', d: '削除なども含めてリポジトリ全体を一括ステージ' },
                    { c: 'git status', d: 'ステージに入ったファイルを確認してから commit する' },
                ],
                s: ['① git add . でまとめてステージ', '② git status で内容確認', '③ git commit -m "メッセージ"'],
                note: 'まとめて add する前に git diff で確認する習慣をつけると安全です。',
            },
            {
                t: 'これまで作った履歴をさかのぼりたい',
                k: ['履歴', 'ログ', 'log', 'graph', '確認', '遡', 'さかのぼ'],
                cmds: [
                    { c: 'git log --oneline', d: 'コミットを1行ずつ新しい順に' },
                    { c: 'git log --graph', d: '分岐・統合を線で表示' },
                    { c: 'git graph', d: 'SVG で華やかに表示 (独自コマンド)' },
                ],
                s: ['① git log --oneline で全体像を把握', '② 分岐を見たいときは --graph を付ける'],
            },
        ],
    },
    {
        key: 'commit',
        label: 'コミットの編集',
        color: 'pq-lv-2',
        items: [
            {
                t: '直近のコミットメッセージを書き間違えた',
                k: ['メッセージ', '直す', '間違え', 'amend', '直近', '最近', 'typo', '修正'],
                cmds: [
                    { c: 'git commit --amend -m "新しいメッセージ"', d: '直近のコミットのメッセージだけを書き換える' },
                ],
                s: ['① git commit --amend -m "正しいメッセージ" を実行'],
                note: 'push 済みのコミットを amend するのは控えましょう (履歴を書き換えるため)。',
            },
            {
                t: 'コミットし忘れたファイルを直近のコミットに入れたい',
                k: ['し忘れ', '忘れ', '追加', 'amend', '直前', '合わせる'],
                cmds: [
                    { c: 'git add <入れ忘れたファイル>', d: '入れるファイルをステージする' },
                    { c: 'git commit --amend -m "メッセージ"', d: '直近のコミットに取り込む' },
                ],
                s: ['① git add 入れ忘れたファイル', '② git commit --amend -m "メッセージ"'],
                note: 'amend すると直近のコミットが新しい内容に置き換わります (ID が変わります)。',
            },
            {
                t: 'コミットを N 個前に戻してやり直したい (履歴は残さない)',
                k: ['戻る', '戻す', 'やり直し', '1つ前', 'ひとつ前', '先頭', 'reset', 'HEAD', '直前'],
                cmds: [
                    { c: 'git reset --soft HEAD~1', d: '1つ前へ戻し、戻した変更はステージ済みのまま残す' },
                    { c: 'git reset --hard HEAD~1', d: '1つ前へ戻し、その変更は完全に破棄する' },
                ],
                s: ['① git log --oneline で何個戻すか決める',
                    '② 方を残したい → --soft / 捨ててよい → --hard で HEAD~N を指定', 
                    '③ git status で結果を確認'],
                note: '「バグが出て直近のコミットをなかったことにしたい」場合は reset が当てはまる。push 済みなら次の「revert」を使う。',
            },
            {
                t: 'もう push したコミットを取り消したい (履歴は残す)',
                k: ['revert', '取り消し', '打ち消', '安全', '消す', 'バグ', '削除'],
                cmds: [
                    { c: 'git revert HEAD', d: '直近コミットを「打ち消すコミット」を新しく作る' },
                    { c: 'git revert <ハッシュ>', d: '指定したコミットを打ち消す (例: a0f12ab)' },
                ],
                s: ['① git log --oneline / git graph で何を打ち消すか確認',
                    '② git revert HEAD で取り消しコミットを作る',
                    '③ git graph で「Revert ...」のコミットが増えたのを確認'],
                note: '履歴を残したまま安全に戻すのが revert。取消しコミットは普通に push して共有できます。',
            },
            {
                t: 'リリース版に目印 (タグ) を付けたい',
                k: ['タグ', 'tag', 'リリース', '版', 'バージョン', 'v1'],
                cmds: [
                    { c: 'git tag -a v1.0.0 -m "release v1.0.0"', d: '注釈付きタグを作成' },
                    { c: 'git tag', d: 'タグの一覧を表示' },
                ],
                s: ['① タグを付けたいタイミングで git tag -a を実行', '② git tag で一覧確認'],
            },
            {
                t: 'ステージに上げたファイルを取り消したい (add しすぎ)',
                k: ['add し過ぎ', 'stage', 'ステージ', '戻す', 'とに', 'reset', 'restore', '取り消'],
                cmds: [
                    { c: 'git reset', d: 'ステージ登録を全部取り消す (ファイルは残る)' },
                    { c: 'git restore --staged <ファイル名>', d: '特定ファイルのステージだけ取り消す' },
                ],
                s: ['① git status でステージに入っているものを確認',
                    '② 全部 → git reset / 特定だけ → git restore --staged ファイル名'],
                note: 'どちらもテキストファイルの内容自体は消しません。安心して使えます。',
            },
        ],
    },
    {
        key: 'branch',
        label: 'ブランチ',
        color: 'pq-lv-3',
        items: [
            {
                t: '新機能を本流から分けて開発したい',
                k: ['ブランチ', 'branch', '分ける', '機能', '新', '別', '切る'],
                cmds: [
                    { c: 'git checkout -b ブランチ名', d: 'ブランチを作成して、その場で切り替え' },
                    { c: 'git switch -c ブランチ名', d: '同じ操作の別の書き方' },
                ],
                s: ['① git checkout -b feature/homepage などで分ける',
                    '② そのままブランチ上で touch → add → commit', 
                    '③ git log --graph で枝が分かれたのを確認'],
                note: 'ブランチ名は「機能/内容」の英語命名が定番です。',
            },
            {
                t: 'ブランチを切り替えたい',
                k: ['切り替え', '移動', 'checkout', 'switch', 'ブランチ', '別'],
                cmds: [
                    { c: 'git checkout ブランチ名', d: '指定ブランチへ移動' },
                    { c: 'git switch ブランチ名', d: 'checkout と同じ (古い方法は checkout)' },
                ],
                s: ['① git branch で一覧を見る', '② git checkout ブランチ名で移動'],
                note: '切り替え前に git status で作業が残っていないか確認するのがおすすめです。',
            },
            {
                t: 'ブランチの一覧や、どこで作業しているか確認したい',
                k: ['branch', '一覧', '確認', 'どこ', '現在', '今'],
                cmds: [
                    { c: 'git branch', d: 'ブランチ一覧 (先頭に * が現在地)' },
                    { c: 'git branch -v', d: '＋ 各ブランチの先端コミットを表示' },
                ],
                s: ['① git branch で * の位置を確認'],
            },
            {
                t: '分けたブランチの成果を本流 (main) に統合したい',
                k: ['merge', 'マージ', '統合', '合流', '取り込み', '合わせる', '本流'],
                cmds: [
                    { c: 'git checkout main', d: '受け取る側 (main) に移動する' },
                    { c: 'git merge ブランチ名', d: 'main にブランチの変更を取り込む' },
                ],
                s: ['① git checkout main で受け取り側へ', '② git merge ブランチ名',
                    '③ Fast-forward(一直線) か Merge made by(マージコミット) になる'],
                note: '分岐していれば「マージコミット」(親が2つ) が作られ、git graph で線が合流します。',
            },
            {
                t: '使い終わったブランチを削除したい',
                k: ['削除', '消す', 'branch -d', '片付け', '整理', 'milestone'],
                cmds: [
                    { c: 'git branch -d ブランチ名', d: 'マージ済みなら削除 (安全)' },
                    { c: 'git branch -D ブランチ名', d: '強制削除 (未マージの履歴も消える)' },
                ],
                s: ['① git branch -d ブランチ名。マージ済みでなければ -D の警告が出る'],
                note: '未マージの削除は履歴を消すので、本当にいらない時だけ -D を使いましょう。',
            },
        ],
    },
    {
        key: 'remote',
        label: 'GitHub / チーム開発',
        color: 'pq-lv-2',
        items: [
            {
                t: 'コミットを GitHub に公開 (アップロード) したい',
                k: ['github', 'push', '公開', 'アップロード', '送る', 'リモート', 'remote', '提出'],
                cmds: [
                    { c: 'git remote add origin', d: 'リモート (origin) を登録。URL省略時はサンドボックスのデフォルト' },
                    { c: 'git push -u origin main', d: '初回は -u を付けて main を公開し追跡設定も行う' },
                ],
                s: ['① git remote add origin (初回のみ)',
                    '② git push -u origin main で公開',
                    '③ git graph で origin/main ラベルが付いたのを確認'],
                note: '-u で追跡設定すると、2回目以降は git push だけで済みます。',
            },
            {
                t: '毎日の進捗を GitHub に送りたい',
                k: ['push', '毎日', '送る', 'アップロード', '更新', '日々'],
                cmds: [
                    { c: 'git status', d: '実際に進んでいるか確認するクセをつける' },
                    { c: 'git push', d: '追跡済みならこれだけで送信できる' },
                ],
                s: ['① 作業 → git add → git commit', '② git push'],
                note: '「作業 → コミット → push」のループが日常です。push する前に git status で自分の位置を確認。',
            },
            {
                t: 'チームの最新の変更を取り込みたい',
                k: ['pull', '最新', '更新', 'もら', '取込', '取り込み', 'push pull', '同期'],
                cmds: [
                    { c: 'git pull origin main', d: 'GitHub の変更を取り込む (fetch + merge)' },
                    { c: 'git fetch origin', d: '取り込み情報だけ更新して、実際の統合は後でする' },
                ],
                s: ['① git pull origin main で最新を取り込む',
                    '② 分岐していなければ Fast-forward、していればマージコミットになる',
                    '③ git status で up to date を確認'],
            },
            {
                t: 'git push が rejected された (相手が先に進んでいた)',
                k: ['rejected', '拒否', 'push できない', 'non-fast', 'conflict', '衝突', '取り込', '先に'],
                cmds: [
                    { c: 'git push origin main', d: '最初は拒否される。それが正しい挙動。落ち着いて' },
                    { c: 'git pull origin main', d: '相手の変更を先に手元へ取り込む' },
                    { c: 'git push origin main', d: '統合してから改めて送る' },
                ],
                s: ['① git push が rejected になっても慌てない',
                    '② git pull origin main で相手の変更をマージコミットで統合',
                    '③ 改めて git push origin main で送信'],
                note: '無理に強制 push しません。まずは「pull → push」が基本の解決策です。',
            },
            {
                t: 'origin と比べて自分が先 (ahead) / 後ろ (behind) か確認したい',
                k: ['ahead', 'behind', '同期', 'ずれ', '確認', 'どこ', 'status'],
                cmds: [
                    { c: 'git status', d: 'ahead / behind / diverged を表示' },
                    { c: 'git branch -vv', d: '各ブランチと origin との関係を表示' },
                ],
                s: ['① git status で「ahead」= push し忘れ、「behind」= pull し忘れ、と読み取る'],
                note: 'ahead = 手元にだけあるコミット / behind = GitHub にだけあるコミット。',
            },
        ],
    },
    {
        key: 'undo',
        label: '元に戻す・困ったとき',
        color: 'pq-lv-3',
        items: [
            {
                t: 'バグが出たので、最新のコミットの変更を捨てて前の状態に戻したい',
                k: ['バグ', '戻す', '戻り', '1つ前', 'ひとつ前', '前の状態', '捨てる', 'reset', 'hard', 'やり直し'],
                cmds: [
                    { c: 'git reset --hard HEAD~1', d: '1つ前のコミットに戻し、その変更を完全に破棄' },
                ],
                s: ['① git log --oneline で「戻り先」を確認',
                    '② git reset --hard HEAD~1 を実行',
                    '③ git graph で先頭が戻ったことを確認'],
                note: '破棄した変更は二度と戻せません。まだ push していないコミットだけに使いましょう。',
            },
            {
                t: 'バグが出たが、最新のコミットは残して安全に作り直す余地を残したい',
                k: ['バグ', 'revert', '安全', '残す', '打ち消', '取り消し', '壊れ', 'エラー'],
                cmds: [
                    { c: 'git revert HEAD', d: '打ち消すコミットを追加して、前の状態の内容に戻す' },
                ],
                s: ['① git revert HEAD で取り消しコミットを作る',
                    '② git log --graph で「Revert ...」として履歴が1本伸びているのを確認'],
                note: 'reset と違い「戻した事実」も履歴に残るので、push 済みでも使えます。',
            },
            {
                t: 'まだ push していない直近のコミットをやり直したい',
                k: ['やり直し', '戻る', 'reset', 'soft', '直近', 'push前', 'まだ', 'コミットだけ', '積みすぎ'],
                cmds: [
                    { c: 'git reset --soft HEAD~1', d: 'コミットだけを取り消して、中身はステージに残す' },
                ],
                s: ['① git reset --soft HEAD~1 で1個前へ',
                    '② 修正して git add → git commit でコミットし直す'],
                note: '--soft なら中身が残るので安心。むやみに --hard を使わないのがコツ。',
            },
            {
                t: 'まだコミットしていない書きかけの変更を捨てたい',
                k: ['捨てる', '破棄', 'restore', '戻す', '書きかけ', '変更を消', 'やっぱり'],
                cmds: [
                    { c: 'git restore <ファイル名>', d: 'そのファイルの未コミット変更を破棄して元へ' },
                ],
                s: ['① git status で「Changes not staged」のファイル名を確認',
                    '② git restore ファイル名 で破棄'],
                note: '捨てた変更は戻りません。消す前に別名保存しておくのも手です。',
            },
            {
                t: '2つ前や3つ前までまとめて戻したい',
                k: ['2つ前', '3つ前', 'まとめ', '複数', 'HEAD~', 'いくつ', 'N前'],
                cmds: [
                    { c: 'git reset --soft HEAD~2', d: '2個前へ戻して変更は残す (N は自由に変えられる)' },
                    { c: 'git reset --hard HEAD~3', d: '3個前へ戻して変更も破棄' },
                ],
                s: ['① git log --oneline で幾つ戻すか数える', '② HEAD~N の N にその数値を入れて実行'],
            },
            {
                t: 'どの「戻す」コマンドを使うか迷った',
                k: ['迷う', 'どれ', '使い分け', 'まとめ', '選び方', '分からない', '判断'],
                cmds: [
                    /* これは「一覧表」カード。コマンドは無し */
                ],
                s: ['【まだコミットしていない変更】→ git restore <ファイル>',
                    '【ステージに上げただけ】→ git reset / git restore --staged',
                    '【直近のコミットを消したい (未push)】→ git reset --soft HEAD~1', 
                    '【push 済みのコミットを取り消したい】→ git revert HEAD'],
                note: 'ポイント: ① push 済みなら revert ② 手元だけなら reset。まず this の git status で状況を確認するのが最短です。',
            },
        ],
    },
];

let csState = { cat: 'all', q: '' };

function renderCheatsheet() {
    const content = document.getElementById('cs-content');
    const chips = document.getElementById('cs-chips');
    const search = document.getElementById('cs-search');
    if (!content || !chips) return;

    // カテゴリーチップ
    let chipHtml = `<button type="button" class="cs-chip active" data-cat="all">すべて表示 (${CSSECTIONS.length})</button>`;
    for (const sec of CSSECTIONS) {
        chipHtml += `<button type="button" class="cs-chip" data-cat="${sec.key}">${escapeHtml(sec.label)} (${sec.items.length})</button>`;
    }
    chips.innerHTML = chipHtml;
    chips.querySelectorAll('[data-cat]').forEach(btn => {
        btn.addEventListener('click', () => {
            csState.cat = btn.dataset.cat;
            chips.querySelectorAll('[data-cat]').forEach(b => b.classList.toggle('active', b === btn));
            renderCheatsheetContent();
            if (search) search.focus();
        });
    });

    if (search) {
        search.removeEventListener('input', csOnSearch);
        search.addEventListener('input', csOnSearch);
    }

    renderCheatsheetContent();
}

function csOnSearch() {
    const search = document.getElementById('cs-search');
    csState.q = (search ? search.value : '').trim().toLowerCase();
    renderCheatsheetContent();
}

function csItemText(item) {
    const parts = [item.t];
    if (item.k) parts.push(item.k.join(' '));
    if (item.cmds) for (const c of item.cmds) parts.push(c.c + ' ' + c.d);
    if (item.s) parts.push(item.s.join(' '));
    if (item.note) parts.push(item.note);
    return parts.join(' ').toLowerCase();
}

function renderCheatsheetContent() {
    const content = document.getElementById('cs-content');
    if (!content) return;
    const q = csState.q;

    let html = '';
    let visibleTotal = 0;
    for (const sec of CSSECTIONS) {
        if (csState.cat !== 'all' && csState.cat !== sec.key) continue;
        const visible = sec.items.filter(it => !q || csItemText(it).includes(q));
        if (visible.length === 0) continue;
        visibleTotal += visible.length;

        html += `<div class="cs-section">`;
        html += `<div class="cs-section-head"><span class="pq-level ${sec.color}">${escapeHtml(sec.label)}</span>${escapeHtml(sec.label)} の早見表</div>`;
        for (const it of visible) {
            html += `<div class="cs-card" data-keywords="${escapeHtml(csItemText(it))}">`;
            html += `<div class="cs-card-title">🛟 ${escapeHtml(it.t)}</div>`;
            if (it.cmds && it.cmds.length) {
                html += `<div class="cs-label">▼ コマンド</div><div class="cs-cmds">`;
                for (const c of it.cmds) {
                    html += `<div class="cs-cmd-row"><span class="cs-cmd">${escapeHtml(c.c)}</span>` +
                            `<span class="cs-cmd-d">${escapeHtml(c.d)}</span></div>`;
                }
                html += `</div>`;
            }
            if (it.s && it.s.length) {
                html += `<div class="cs-label">▼ 手順</div><ol class="cs-steps">`;
                for (const st of it.s) html += `<li>${escapeHtml(st)}</li>`;
                html += `</ol>`;
            }
            if (it.note) {
                html += `<div class="cs-note">💡 ${escapeHtml(it.note)}</div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    }

    if (visibleTotal === 0) {
        html += `<div class="cs-empty">「${escapeHtml(csState.q || 'このカテゴリー')}」に当てはまる状況が見つかりませんでした。<br>` +
                `「コミット」「プッシュ」「戻す」「バグ」など短い言葉で検索してみてください。</div>`;
    } else {
        html += `<div class="cs-foot">この早見表のコマンドは「ターミナルタブ」でそのまま試せます。分からなくなったら「git status」!</div>`;
    }

    content.innerHTML = html;
    const count = document.getElementById('cs-count');
    if (count) count.textContent = `表示中 ${visibleTotal} 件`;
    const scroll = document.getElementById('cs-scroll');
    if (scroll) scroll.scrollTop = 0;
}