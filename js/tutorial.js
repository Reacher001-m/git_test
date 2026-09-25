// =====================================================================
// 開発フローチュートリアル (「開発フローで学ぶ」タブ)
//   - コース定義 (COURSES): 「開発フローの基礎」/「GitHub でチーム開発」
//   - コース一覧 / ステップ / 完了画面
//   - 入力検証・自動実行・フィードバック
// =====================================================================

const workflowView = { state: 'course', course: 0, index: -1 };

function currentSteps() {
    return (COURSES[workflowView.course] && COURSES[workflowView.course].steps) || [];
}

// ---------------------------------------------------------------------
// コース 1: 開発フローの基礎
// ---------------------------------------------------------------------
const COURSES = [
    {
        title: '開発フローの基礎',
        blurb: '個人開発の流れ「初期化 → コミット → ブランチ → マージ → タグ」を1ステップずつ入力しながら学びます。Git の基本がゼロから身につきます。',
        steps: [
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
            { title: null },
        ],
        done: {
            title: '🎉 おつかれさまでした!',
            body: [
                '<p>実際の開発でよく使う一連の流れを最後まで通しで練習できました。ここまでの流れをおさらいします。</p>',
                '<p><b>1. git init</b> … リポジトリを作る<br>' +
                '<b>2. git status</b> … 常に現在地を確認する<br>' +
                '<b>3. git add</b> … コミットする候補をステージに上げる<br>' +
                '<b>4. git commit -m "..."</b> … スナップショットを記録する<br>' +
                '<b>5. git log --oneline / --graph</b> … 履歴・分岐を確認する<br>' +
                '<b>6. git checkout -b 名前</b> … 機能ごとにブランチを切る<br>' +
                '<b>7. ブランチ上でコミット → git checkout main → git merge</b> … 本流へ統合<br>' +
                '<b>8. git branch -d 名前</b> … 不要になったブランチを消す<br>' +
                '<b>9. git tag -a v1.0.0 -m "..."</b> … リリース版に目印を付ける</p>',
                '<p>次は「GitHub でチーム開発」コースで、push / pull を使った複数人開発を学びましょう!</p>',
            ],
        },
    },

    // ---------------------------------------------------------------------
    // コース 2: GitHub でチーム開発
    // ---------------------------------------------------------------------
    {
        title: 'GitHub でチーム開発',
        blurb: 'チーム開発で毎日使う「push / pull / fetch」と、相手と同時に作業した時の衝突解決を、開発相手をシミュレートする peer-commit と一緒に学びます。',
        steps: [
            {
                title: '公開するリポジトリを用意する',
                body: [
                    '複数人開発の前に、まず公開する下地のリポジトリを用意します。',
                    'git init でリポジトリを作り、README.md を1コミットして、GitHub に送る準備を整えましょう。',
                ],
                command: 'git init\n→ touch README.md\n→ git add README.md\n→ git commit -m "initial commit"',
                parts: [
                    { t: 'git init', d: 'リポジトリを作る' },
                    { t: 'touch README.md', d: 'プロジェクト説明のファイルを用意する' },
                    { t: 'git add README.md', d: 'ステージに追加' },
                    { t: 'git commit -m "initial commit"', d: '初期コミットを作る' },
                ],
                commands: ['git init', 'touch README.md', 'git add README.md', 'git commit -m "initial commit"'],
                hint: '「git init」「touch README.md」「git add README.md」「git commit -m "initial commit"」の順に入力してください。',
                check: () => state.initialized && !!state.branches['main'] && !!state.branches['main'].tip,
                success: ['初期コミットまでできました。', 'このコミットを GitHub に公開する準備をします。'],
            },
            {
                title: 'リポジトリを GitHub に公開する準備',
                body: [
                    'チーム開発の前提として、まず完成したコンテンツを GitHub(リモート)に公開(送信)する方法を練習します。',
                    'コミットを GitHub に送るのが「push」、GitHub の状態を登録するのが「remote add」です。まずリモート「origin」を登録しましょう。',
                ],
                command: 'git remote add origin',
                parts: [
                    { t: 'git remote add origin', d: 'リモートの別名「origin」を登録する(URL省略時はデフォルトURLが使われる)' },
                    { t: 'git remote -v', d: '登録したリモートの一覧を確認する' },
                ],
                commands: ['git remote add origin', 'git remote -v'],
                hint: '「git remote add origin」と入力してください。登録できたら git remote -v で確認できます。',
                check: () => !!state.remote && state.remote.name === 'origin',
                success: ['リモート origin が登録されました。', '準備完了。それでは公開(push)してみましょう。'],
            },
            {
                title: 'コミットを GitHub に送る - git push',
                body: [
                    'ローカルで作ったコミットを GitHub に送信するのが「git push」です。',
                    '初回は「-u」(--set-upstream)を付けると「このブランチは origin/main に追跡される」と設定され、2回目以降の push が省略形で書けるようになります。',
                    '実行すると「git graph」で origin/main のラベルがコミットに付くのが確認できます。',
                ],
                command: 'git push -u origin main',
                parts: [
                    { t: 'git push', d: 'ローカルにしかないコミットを GitHub に送信する' },
                    { t: '-u / --set-upstream', d: '追跡ブランチを設定し、次回以降 push を省略形で書けるようにする' },
                    { t: 'origin main', d: '送り先のリモート(origin)とブランチ(main)を指定' },
                ],
                commands: ['git push -u origin main'],
                hint: '「git push -u origin main」と入力してください。git graph で origin/main ラベルが付くのを確認してみましょう。',
                check: () => !!state.remote && state.remote.branches['main'] === state.branches['main'].tip,
                success: ['main が GitHub に公開されました! origin/main がローカルの先頭と同じコミットになっています。', '次は、作品を追加して「毎日の作業の流れ」を体験します。'],
            },
            {
                title: '更新して再度 push (毎日のサイクル)',
                body: [
                    '実開発の日常は「作業する → コミット → push」の繰り返しです。',
                    '今日の成果として、ファイルを1つ追加してコミットし、push で GitHub に反映させましょう。',
                    '2回目以降の push は「-u」が要らない点に注目してください。',
                ],
                command: 'touch notes.txt\n→ git add notes.txt\n→ git commit -m "add notes"\n→ git push',
                parts: [
                    { t: 'touch notes.txt', d: '作業の成果物を作成する' },
                    { t: 'git add notes.txt', d: 'ステージに追加する' },
                    { t: 'git commit -m "add notes"', d: 'コミット(変更の記録)を作る' },
                    { t: 'git push', d: '-u で追跡済みなら branch 省略可。作成したコミットを GitHub に送る' },
                ],
                commands: ['touch notes.txt', 'git add notes.txt', 'git commit -m "add notes"', 'git push'],
                hint: '「touch notes.txt」「git add notes.txt」「git commit -m "add notes"」「git push」の順に入力してください。',
                check: () => !!state.remote && state.remote.branches['main'] === state.branches['main'].tip
                    && state.commits[state.branches['main'].tip].files.includes('/notes.txt'),
                success: ['作業をコミットして push できました。これが「日常のサイクル」です。', 'ここからが本番。あなたの後ろで、開発相手が GitHub 上で作業を進めています。'],
            },
            {
                title: '開発相手が GitHub 上でコミットした',
                body: [
                    '複数人開発では、あなたが作業している間に「他の人が GitHub 上で新しくコミットを push」することがあります。',
                    'このサンドボックスでは開発相手の操作を「git peer-commit」という独自コマンドで再現します。実行すると、あなたのローカルから見える GitHub(origin/main)が1つ先へ進みます。',
                ],
                command: 'git peer-commit main -m "update footer (via GitHub)"',
                parts: [
                    { t: 'git peer-commit', d: '(独自コマンド) 開発相手が GitHub 上で直接コミットした状況をシミュレート' },
                    { t: 'git status', d: 'あなたのローカルが origin/main の何か先/後かを教えてくれる' },
                ],
                commands: ['git peer-commit main -m "update footer (via GitHub)"'],
                hint: '「git peer-commit main -m "update footer (via GitHub)"」を実行してください。続けて git status で状態を見てみましょう。',
                check: () => !!state.remote && !!state.remote.branches['main']
                    && state.remote.branches['main'] !== state.branches['main'].tip,
                success: ['origin/main があなたより先に進みました。「git status」を打つと behind と表示されます。', 'GitHub の変更を手元に取り込みましょう。'],
            },
            {
                title: '相手の変更を取り込む - git pull',
                body: [
                    'origin/main があなたより先なのは、相手のコミットがまだローカルにないためです。',
                    '「git pull origin main」で、GitHub の変更をローカルに取り込みます。この場合、単純にローカルが先頭まで追いつく「Fast-forward」になります。',
                ],
                command: 'git pull origin main',
                parts: [
                    { t: 'git pull', d: 'リモートの変更を取得(fetch)して、ローカルに統合(merge)する' },
                    { t: 'Fast-forward', d: 'ローカルがリモートの祖先なら、先頭を指すだけで追いつくマージ方法' },
                    { t: 'git log --oneline', d: '相手のコミットが手元に入ってきたことを確認' },
                ],
                commands: ['git pull origin main', 'git log --oneline'],
                hint: '「git pull origin main」と入力してください。取り込まれたら git log --oneline で履歴に相手のコミットが増えているはずです。',
                check: () => !!state.remote && state.remote.branches['main'] === state.branches['main'].tip,
                success: ['相手の変更を取り込みました。ローカルが GitHub と並びました(up to date)。', '次は「相手もあなたも進んだ」分かれた状態を体験します。'],
            },
            {
                title: '衝突の状況を作る',
                body: [
                    'あなたが作業している間に相手も GitHub でコミットしました。',
                    'さらにあなたもローカルでコミットを重ねると、ローカルと GitHub は「分かれた歴史」を持った状態(diverged)になります。この状態で push を試みると、GitHub に弾かれます(非 fast-forward)。',
                ],
                command: 'git peer-commit main -m "add docs (via GitHub)"\n→ touch local.txt\n→ git add local.txt\n→ git commit -m "feat: local work"',
                parts: [
                    { t: 'git peer-commit', d: '相手がまた GitHub 上でコミット' },
                    { t: 'touch local.txt', d: 'あなたの作業成果を作る' },
                    { t: 'git commit -m "feat: local work"', d: 'あなたのコミットをローカルに積む' },
                    { t: 'git log --graph', d: 'ローカルと GitHub の線が分かれているのが見える' },
                ],
                commands: ['git peer-commit main -m "add docs (via GitHub)"', 'touch local.txt', 'git add local.txt', 'git commit -m "feat: local work"'],
                hint: 'peer-commit のあと、ファイルを作ってコミットしてください。git log --graph で線が分かれるのを確認しましょう。',
                check: () => {
                    if (!state.remote || !state.remote.branches['main']) return false;
                    const { ahead, behind } = aheadBehind('main');
                    return ahead > 0 && behind > 0;
                },
                success: ['ローカルは「進んでいる(ahead)」し「遅れてもいる(behind)」状態になりました。', 'このまま push しようとするとどうなるか、やってみましょう。'],
            },
            {
                title: 'push が拒否される (衝突と対面)',
                body: [
                    '分かれた状態で push すると、GitHub は歴史を消す恐れがあるため安全に拒否します。',
                    '「git push」を実行すると「! [rejected] (non-fast-forward)」と表示されます。これは「先に相手の変更を取り込め」という合図です。',
                ],
                command: 'git push origin main  (rejected になる)',
                parts: [
                    { t: '! [rejected] non-fast-forward', d: 'ローカルがリモートの祖先でないため push が拒否される' },
                    { t: 'hint: git pull ...', d: '指摘どおり「まず pull で相手の変更を取り込め」という意味' },
                    { t: 'git graph', d: '分かれた2つの線がそのまま残っている(マージされていない状態)' },
                ],
                commands: ['git push origin main'],
                hint: '「git push origin main」と入力して、拒否されることを実際に確認してください。エラー自体が「次は pull をしなさい」という指示です。',
                check: (cmd) => {
                    if (!/^git push/.test(cmd)) return false;
                    if (!state.remote || !state.remote.branches['main']) return false;
                    const synced = state.remote.branches['main'] === state.branches['main'].tip;
                    // rejected を一度体験した、または (すでに解決済みで同期済みなら) 通過
                    return state.lastPushRejected === true || synced;
                },
                success: ['push が拒否されました。GitHub はあなたの歴史を守ってくれています。', 'では、指示どおり pull して衝突を解決しましょう。'],
            },
            {
                title: 'pull でマージして衝突を解決する',
                body: [
                    '拒否された push の解決法は「git pull」です。分かれた2つの線をマージコミット(親が2つ)で結びます。',
                    'このマージコミットには「相手の変更」と「あなたの変更」の両方のファイルが含まれます。',
                ],
                command: 'git pull origin main',
                parts: [
                    { t: 'git pull origin main', d: 'リモートの変更を取り込む。分岐している場合はマージコミットになる' },
                    { t: 'Merge made by ...', d: '2つの親を持つ「マージコミット」が作られた印' },
                    { t: 'git log --graph', d: '分かれていた2つの線が合流したのが見える' },
                ],
                commands: ['git pull origin main'],
                hint: '「git pull origin main」と入力してください。マージコミットが作られれば成功です。',
                check: () => {
                    if (!state.remote || !state.remote.branches['main']) return false;
                    const tip = state.branches['main'].tip;
                    if (!tip) return false;
                    const merged = state.commits[tip].parents.length === 2;
                    const synced = state.remote.branches['main'] === tip;
                    // マージコミットができた、または既に同期済み(解決済み)なら通過
                    return merged || synced;
                },
                success: ['マージコミットができました。分かれていた2つの線が1つに合流しています。', 'これで再び push できる状態です。仕上げに送信しましょう。'],
            },
            {
                title: '解決後、改めて push して同期する',
                body: [
                    'マージができたので、あなたのローカルは「リモートを含めた新しい歴史」を持っています。',
                    '最後の「git push」で GitHub に反映させると、チーム全員の作業が1つの歴史にまとまり、同期が完了します。',
                ],
                command: 'git push origin main\n→ git status  (up to date になる)',
                parts: [
                    { t: 'git push origin main', d: 'マージ済みの歴史を GitHub に送信(今度は通る)' },
                    { t: 'git status', d: 'up to date 表示で同期完了を確認' },
                ],
                commands: ['git push origin main', 'git status'],
                hint: '「git push origin main」を実行してください。git status が up to date になれば完了です。',
                check: () => !!state.remote && state.remote.branches['main'] === state.branches['main'].tip
                    && state.commits[state.branches['main'].tip].parents.length === 2,
                success: ['push が通りました! あなたと相手の作業が GitHub 上で1つに統合されています。', 'これがチーム開発の基本サイクル push → pull → merge です。'],
            },
            {
                title: 'リリース版にタグを付けて公開する',
                body: [
                    '開発が落ち着いたら、リリース版のコミットにタグを付けて管理します。タグは GitHub 上でも共有され、チームの「このバージョンはここ」の目印になります。',
                    'git tag -a で注釈付きタグを作成し、git tag で一覧を確認しましょう。',
                ],
                command: 'git tag -a v2.0.0 -m "release v2.0.0"',
                parts: [
                    { t: 'git tag -a v2.0.0', d: '注釈付きタグを作成(メッセージや作成者が記録される)' },
                    { t: 'git tag', d: 'タグ一覧を確認。git graph で見るとコミットにラベルが付いている' },
                ],
                commands: ['git tag -a v2.0.0 -m "release v2.0.0"', 'git tag'],
                hint: '「git tag -a v2.0.0 -m "release v2.0.0"」と入力してください。git graph でタグラベルを確認しましょう。',
                check: () => !!state.tags['v2.0.0'],
                success: ['リリースタグ v2.0.0 を付けられました。', 'これでコースは完了です。おつかれさまでした!'],
            },
            { title: null },
        ],
        done: {
            title: '🎉 チーム開発コース完了!',
            body: [
                '<p>GitHub を使ったチーム開発の核となる流れを体験しました。おさらいです。</p>',
                '<p><b>1. git remote add origin</b> … リモートを登録する<br>' +
                '<b>2. git push -u origin main</b> … GitHub に公開(初回は -u で追跡設定)<br>' +
                '<b>3. 作業 → commit → push</b> … 毎日のアップロードの習慣<br>' +
                '<b>4. git peer-commit (独自)</b> … 開発相手の GitHub 操作を再現<br>' +
                '<b>5. git status</b> … ahead(先) / behind(後れ)で現在地を把握<br>' +
                '<b>6. git pull</b> … 相手の変更を取り込む(Fast-forward かマージコミット)<br>' +
                '<b>7. push が rejected されたら</b> … 無理に押し込まず、まず pull で相手の変更を統合<br>' +
                '<b>8. マージコミットを作る</b> … 2つの線の歴史を1つに統合<br>' +
                '<b>9. 再 push で同期完了</b> … これが衝突解決の基本<br>' +
                '<b>10. git tag</b> … リリース版に目印を付けて共有</p>',
                '<p>「上級者向け問題」タブにも、この衝突解決を題材にした問題があります。挑戦してみましょう!</p>',
            ],
        },
    },
];

function renderWorkflowStart() {
    workflowView.state = 'course';
    workflowView.index = -1;
    let html = '<div class="wf-step-title">開発フローで Git を学ぶ</div>';
    html += '<div class="wf-body"><p>実開発で使う手順を、コース形式で1ステップずつ入力しながら学べます。</p></div>';
    html += '<div class="pq-list">';
    for (let i = 0; i < COURSES.length; i++) {
        const c = COURSES[i];
        const lv = 'pq-lv-' + (i + 1);
        html += `<button type="button" class="pq-card" data-course="${i}">` +
                `<span class="pq-level ${lv}">コース ${String(i + 1).padStart(2, '0')}</span>` +
                `<span class="pq-title">${escapeHtml(c.title)}</span>` +
                `<span class="pq-blurb">${escapeHtml(c.blurb)}</span>` +
                `</button>`;
    }
    html += '</div>';
    wfLesson.innerHTML = html;

    wfLesson.querySelectorAll('[data-course]').forEach(btn => {
        btn.addEventListener('click', () => startCourse(Number(btn.dataset.course)));
    });
    wfOutput.innerHTML = '';
}

function startCourse(course) {
    resetRepo();
    workflowView.state = 'started';
    workflowView.course = course;
    workflowView.index = 0;
    setSink('wf');
    out(`━━ ${COURSES[course].title} コース開始 ━━`, 'yellow');
    out('専用のリポジトリをリセットしました。指示に従ってコマンドを入力してください。', 'gray');
    refreshPrompt();
    renderWorkflowStep();
}

function startTutorial() {
    startCourse(0);
}

function renderWorkflowStep() {
    if (workflowView.state !== 'started') return;
    setSink('wf');
    const steps = currentSteps();

    if (workflowView.index >= steps.length - 1) {
        renderWorkflowDone();
        return;
    }
    const step = steps[workflowView.index];
    const no = workflowView.index + 1;
    const total = steps.length - 1;
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
    if (workflowView.index >= currentSteps().length - 1) return;
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
    const steps = currentSteps();
    const step = steps[workflowView.index];
    if (!step || !step.check) return;

    const ok = step.check(cmd);
    if (ok) {
        if (workflowView.index >= steps.length - 2) {
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
    const step = currentSteps()[workflowView.index];
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
    const done = (COURSES[workflowView.course] && COURSES[workflowView.course].done) ||
        { title: '🎉 おつかれさまでした!', body: ['<p>コースを完了しました。</p>'] };
    let html = `<div class="wf-done-title">${done.title}</div>`;
    html += `<div class="wf-done-body">${done.body.join('')}</div>`;
    html += `<div class="wf-actions">` +
            `<button type="button" class="btn accent" id="wf-back-course">コース一覧に戻る</button>` +
            `</div>`;
    wfLesson.innerHTML = html;
    document.getElementById('wf-back-course').addEventListener('click', () => {
        renderWorkflowStart();
        scrollBottom();
    });
    wfOutput.innerHTML = '';
    if (currentSink === sinks.wf) scrollBottom();
    wfInput.focus();
}