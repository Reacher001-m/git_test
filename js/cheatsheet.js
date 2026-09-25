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
                note: 'どちらもテキストファイルの内容自体は消しません。',
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
                    { c: 'git push origin main', d: '最初は拒否される。それが正しい挙動' },
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
        key: 'disconnect',
        label: '接続を切る・ファイル除外',
        color: 'pq-lv-1',
        items: [
            {
                t: 'GitHub との接続を切って、ローカルだけで開発したい (リモートを外す)',
                k: ['接続', '切る', 'remote rm', 'remove', '外す', 'github', 'リモート', 'やめ', '撤去'],
                cmds: [
                    { c: 'git remote -v', d: '今の接続先を確認する' },
                    { c: 'git remote rm origin', d: 'リモート設定を削除する (git remote remove origin も同じ)' },
                ],
                s: ['① git remote -v で接続先を確認',
                    '② git remote rm origin で設定を外す',
                    '③ git remote -v で (no remote) になる'],
                note: 'コミット履歴やファイルは消えません。GitHub 上のリポジトリ自体は削除するなら Web 側で行います。',
            },
            {
                t: 'Git の管理ごとやめて、ただのフォルダに戻したい',
                k: ['rm -rf .git', '管理', 'やめ', 'リポジトリ', '消す', '手放', '廃止'],
                cmds: [
                    { c: 'rm -rf .git', d: 'Git の管理データを削除 (※実機コマンド)' },
                ],
                s: ['① 必要なファイルを別フォルダにバックアップ',
                    '② rm -rf .git で管理データを削除'],
                note: '※実機コマンド: .git に全コミット履歴が入っています。削除すると二度と戻せません。サンドボックスでは再現しません。',
            },
            {
                t: '特定のファイルを Git / GitHub の追跡から外したい (手元には残す)',
                k: ['ファイル', '追跡', '外す', 'rm --cached', 'secret', '除外', '対象', '接続', '切る'],
                cmds: [
                    { c: 'git rm --cached <ファイル名>', d: 'そのファイルだけ追跡から外し、手元には残す' },
                    { c: 'git commit -m "stop tracking <ファイル名>"', d: '追跡外しを記録する' },
                ],
                s: ['① git rm --cached ファイル名 で追跡を外す (手元には残る)',
                    '② git status で「deleted:」と出ることを確認',
                    '③ git commit -m "..." で確定',
                    '④ git push で GitHub にも反映'],
                note: '「接続を切る」は削除ではありません。秘密情報なら、過去コミットに残ると履歴修正が必要になる点に注意。',
            },
            {
                t: '特定のフォルダごと追跡から外したい',
                k: ['フォルダ', 'ディレクトリ', 'まとめ', 'rm -r', '除外', 'build', 'node_modules', 'キャッシュ'],
                cmds: [
                    { c: 'git rm -r --cached <ディレクトリ名>', d: 'フォルダごと追跡を外して手元に残す' },
                    { c: 'git commit -m "untrack <ディレクトリ名>"', d: '確定する' },
                ],
                s: ['① git rm -r --cached ディレクトリ名',
                    '② git status で deleted 表示を確認',
                    '③ git commit -m "..." で確定'],
                note: 'よくある用途: build/ や node_modules/ など「成果物・依存物」をリポジトリから外す。',
            },
            {
                t: '今後そのファイルを追跡させないようにしておきたい',
                k: ['gitignore', '除外', '今後', '無視', '設定', 'させない', '環境設定'],
                cmds: [
                    { c: '整え方: .gitignore', d: '.gitignore に無視したいパターンを書く (※実機)' },
                ],
                s: ['① .gitignore を新規作成し、除外する名前やパターンを書く (例: secret.txt / *.log)',
                    '② git add .gitignore → git commit で設定を共有',
                    '③ その後は git status に出なくなる'],
                note: '※実機コマンド: サンドボックスはファイルの中身を書けないため、実際のPCで試してください。',
            },
            {
                t: 'GitHub の URL を新しいリポジトリに張り替えたい',
                k: ['url', '張り替え', 'set-url', '新しい', '別リポジトリ', '変更', '移行'],
                cmds: [
                    { c: 'git remote set-url origin <新しいURL>', d: '送信先の URL を変更する' },
                    { c: 'git remote -v', d: '変更されたか確認する' },
                ],
                s: ['① git remote set-url origin https://github.com/あなた/新しいリポジトリ.git',
                    '② git remote -v で確認',
                    '③ git push origin main で新しい URL に送信'],
                note: '履歴はそのまま新しいリポジトリへ送れます。',
            },
            {
                t: 'うっかり追跡を外したので、追跡に戻したい',
                k: ['戻す', '復活', '追跡', '再', '取り消し', 'add', 'reset', '間違え'],
                cmds: [
                    { c: 'git reset', d: 'commit 前なら削除ステージを取り消す' },
                    { c: 'git add <ファイル名>', d: 'commit 済みなら add で再追跡' },
                ],
                s: ['① commit 前なら git reset で元通り',
                    '② commit 済みなら git add ファイル名 → git commit で再追跡'],
                note: 'git rm --cached の直後に git reset をすれば安全に戻せます。',
            },
        ],
    },
    {
        key: 'errors',
        label: 'エラーの対処法',
        color: 'pq-lv-2',
        items: [
            {
                t: "fatal: not a git repository (or any of the parent directories)",
                k: ['not a git', 'fatal', 'git じゃない', 'repository', 'init忘れ', 'フォルダ', 'エラー'],
                cmds: [
                    { c: 'git init', d: '管理を始める (初回)' },
                    { c: 'cd <正しいフォルダ>', d: '管理中のフォルダへ移動' },
                ],
                s: ['① まだ管理していないなら git init',
                    '② 管理中の場所なら cd で移動して移動先で git status'],
                note: '「Git が管理していないフォルダで git コマンドを打った」が原因です。プロンプトに [main] と出る場所で作業するのが基本。',
            },
            {
                t: "nothing added to commit but untracked files present",
                k: ['nothing added', 'add 忘れ', 'untracked', 'コミットできない', 'track', 'エラー'],
                cmds: [
                    { c: 'git add <ファイル名>', d: 'コミット対象をステージする' },
                    { c: 'git commit -m "メッセージ"', d: 'それからコミットする' },
                ],
                s: ['① 入れるファイルを git add する',
                    '② git status でステージされているのを確認',
                    '③ git commit -m "..."'],
                note: 'add を忘れると commit できない、という仕組みです。「add → commit」の流れを覚えましょう。',
            },
            {
                t: "nothing to commit, working tree clean",
                k: ['nothing to commit', 'clean', '何もない', 'コミット済み', '変化なし', 'エラー'],
                cmds: [
                    { c: 'git status', d: '本当に変化がないか確認する' },
                ],
                s: ['① git status で working tree clean ならやることは無い',
                    '② 進めたければファイルを編集 → git add → git commit'],
                note: 'エラーではなく「変更は全部コミット済み」という意味です。',
            },
            {
                t: "error: switch 'm' requires a value",
                k: ['switch m', 'requires a value', '-m', 'メッセージ忘れ', '使い方', 'エラー'],
                cmds: [
                    { c: 'git commit -m "コミットメッセージ"', d: '-m の後に必ずメッセージを書く' },
                ],
                s: ['① メッセージを必ず書く。例: git commit -m "fix: バグ修正"'],
                note: '-m "..." の後にメッセージを書き忘れると出ます。必ず何か書きます。',
            },
            {
                t: "fatal: ambiguous argument ... / Not a valid object name",
                k: ['ambiguous', 'valid object', 'ハッシュ', '打ち間違い', 'commit id', 'エラー'],
                cmds: [
                    { c: 'git log --oneline', d: '正しいIDを確認する' },
                    { c: 'git revert <ID>', d: '確認できたIDに変えて再実行する' },
                ],
                s: ['① git log --oneline で先頭の短いID(7文字)を確認',
                    '② そのIDで git revert / git reset などに使う'],
                note: 'コミットIDやタグ名の打ち間違いです。ブランチ名は「git branch」で一覧を見て確認。',
            },
            {
                t: "push が rejected (non-fast-forward) / Updates were rejected",
                k: ['rejected', 'non-fast', 'Updates were rejected', '拒否', 'conflict', '先に進まれ', 'push エラー'],
                cmds: [
                    { c: 'git pull origin main', d: '相手の変更を先に取り込む (マージコミットになる場合もある)' },
                    { c: 'git push origin main', d: '統合できたら改めて送る' },
                ],
                s: ['① まず git pull origin main',
                    '② 相手と自分の変更が共存できるよう統合される',
                    '③ git push origin main で送信'],
                note: '相手が先に進んでいた時の正当な反応です。--force の強制 push は避けて「pull → push」が基本。',
            },
            {
                t: "Already up to date.",
                k: ['Already up to date', '最新', 'pull', '更新ない', 'あとで', 'エラー'],
                cmds: [
                    { c: 'git status', d: '同期状態 (ahead / behind) を確認する' },
                    { c: 'git push', d: '自分にだけコミットがある場合' },
                ],
                s: ['① pull で「Already up to date」なら受ける更新が無い',
                    '② git status で ahead なら push し忘れ、behind なら pull し忘れ'],
                note: 'エラーではなく「もう最新」です。次は push の番かもしれません。',
            },
            {
                t: "fatal: pathspec 'xxx' did not match any files",
                k: ['pathspec', 'did not match', 'ファイル名', '打ち間違い', '存在しない', 'エラー'],
                cmds: [
                    { c: 'ls', d: '現在地のファイル名を確認する' },
                    { c: 'git add <正しい名前>', d: '正しい名前で実行する' },
                ],
                s: ['① ls でファイル名を確認 (tree で全体も見られる)',
                    '② 正しい名前で git add など再実行'],
                note: 'ファイル名・フォルダ名の打ち間違いです。日本語名はコピー&ペーストが安全。',
            },
            {
                t: "git rm で failed (追跡外しができない)",
                k: ['rm', '追跡外し', 'do not have', 'not tracked', 'セキュリティ', 'エラー'],
                cmds: [
                    { c: 'git add <ファイル名>', d: 'まず追跡してから…' },
                    { c: 'git rm --cached <ファイル名>', d: '…改めて追跡を外す' },
                ],
                s: ['① 一度も add / commit していないファイルは追跡外しの対象外',
                    '② 追跡できたら git rm --cached で外す'],
                note: 'git rm --cached は「追跡済みのファイル」が対象です。未追跡なら add してから使います。',
            },
            {
                t: "error: The branch 'xxx' is not fully merged.",
                k: ['not fully merged', 'branch -d', '削除エラー', 'マージしてない', 'ブランチ', 'エラー'],
                cmds: [
                    { c: 'git branch -D <ブランチ名>', d: '強制削除 (そのコミットも捨てる)' },
                    { c: 'git merge <ブランチ名>', d: '先に統合してから -d が本来の道' },
                ],
                s: ['① 成果を残すなら main に merge してから git branch -d',
                    '② 捨てるなら git branch -D で強制削除'],
                note: '-D で消したコミットは戻せないので、本当に必要ない時だけに。',
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
                note: '--soft なら中身が残ります。むやみに --hard を使わないのがコツです。',
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
        html += `<div class="cs-grid">`;
        for (const it of visible) {
            html += `<div class="cs-card" data-keywords="${escapeHtml(csItemText(it))}">`;
            html += `<div class="cs-card-title">${escapeHtml(it.t)}</div>`;
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
                html += `<div class="cs-note">${escapeHtml(it.note)}</div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
        html += `</div>`;
    }

    if (visibleTotal === 0) {
        html += `<div class="cs-empty">「${escapeHtml(csState.q || 'このカテゴリー')}」に当てはまる状況が見つかりませんでした。<br>` +
                `「コミット」「プッシュ」「戻す」「バグ」など短い言葉で検索してみてください。</div>`;
    } else {
        html += `<div class="cs-foot">この早見表のコマンドは「ターミナルタブ」でそのまま試せます。「※実機コマンド」と書いたものは実際のPCでのみ動作します。分からなくなったらまず「git status」で状態を確認してください。</div>`;
    }

    content.innerHTML = html;
    const count = document.getElementById('cs-count');
    if (count) count.textContent = `表示中 ${visibleTotal} 件`;
    const scroll = document.getElementById('cs-scroll');
    if (scroll) scroll.scrollTop = 0;
}