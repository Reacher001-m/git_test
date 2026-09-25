# Git Operations Sandbox

Git と GitHub の操作を、実際にコマンドを打ちながら学べる学習用 Web アプリです。
`index.html` をブラウザで開くだけで動作します（サーバ不要・依存ライブラリなし）。

Windows 風の PowerShell ターミナル上で、シミュレーションされた Git リポジトリに対して
本物の Git と同じような操作を体験できます。

[サイトはこちら→](https://git-test.yuusi.workers.dev/)

---

## 主な機能

### 1. ターミナルタブ（サンドボックス）

自由にコマンドを打って練習するスペースです。仮想ファイルシステムと仮想 Git リポジトリが動作します。

- **仮想ファイルシステム** … `pwd / cd / mkdir / rmdir / ls / tree / touch / rm`（中身は持たず存在管理のみ）
- **Git 基本操作** … `init / status / add / commit / branch / checkout / switch / merge / reset / tag / log`
- **やり直し・復元（元に戻す系）** … `git reset --soft/--hard HEAD~N` / `git revert HEAD` / `git restore <file> (--staged)` / `git commit --amend -m`
- **ファイルの追跡から外す** … `git rm <file>` / `git rm --cached <file>`（手元に残して Git 管理だけ外す）
- **ブランチの可視化** … `git graph` で SVG のブランチツリー、`git log --graph` でテキストグラフを表示
- **GitHub 連携（リモート操作）** … `remote add / set-url / rm / push / fetch / pull / peer-commit`（後述）

### 2. 開発フローで学ぶタブ（チュートリアル）

「初期化 → 状態確認 → ステージ → コミット → ログ → ブランチ → マージ → タグ」の
実開発の流れを **2 つのコース**で学べます。

- **コース 1「開発フローの基礎」** … init からタグ付けまでの 11 ステップ
- **コース 2「GitHub でチーム開発」** … remote 登録 → push -u → 毎日のコミット&プッシュ →
  相手のコミット（peer-commit）→ pull（Fast-forward）→ 分岐 → push 拒否 → pull でマージ →
  再 push → タグ付けの 11 ステップ

- コース一覧画面から選んで開始し、指示どおりコマンドを入力すると自動チェックされて次へ進む
- 「自動実行」「ヒント」「スキップ」ボタン付き
- クリア後は作ったリポジトリがターミナルタブにそのまま残る

### 3. 上級者向け問題タブ（練習問題）

達成すべき状態を作るコマンドを入力するチェックリスト式の練習問題です。

- 初級 2 問 / 中級 2 問 / 上級 3 問（計 7 問）
- 各問題は専用リポジトリをリセットして開始。達成条件をすべて満たすとクリア
- クリア時に回答コマンド例と解説を表示
- 問題は「★分野」：
  | No | レベル | 内容 |
  |----|-------|------|
  | 1 | 初級 | 2 つのファイルを 1 つのコミットにする |
  | 2 | 初級 | ブランチで作業して main に統合する |
  | 3 | 中級 | 分岐してからマージ = マージコミットを作る |
  | 4 | 中級 | GitHub（リモート）に公開する - push |
  | 5 | 上級 | GitHub 側の進みを取り込む - pull |
  | 6 | 上級 | リモートのタグを確認する - tag の扱い |
  | 7 | 上級 | push が拒否された時の衝突解決 |

### 4. 早見表タブ（「こんなときどうする?」）

状況ごとに「コマンド → 手順 → 注意点」をまとめた検索可能な早見表です。

- カテゴリー（**基本操作 / コミットの編集 / ブランチ / GitHub・チーム開発 / 接続を切る・ファイル除外 / 元に戻す・困ったとき / エラーの対処法**）で絞り込み
- フリーワード検索（例: 「バグ」「push」「戻す」「rejected」）
- 「バグが出たから 1 つ前に戻したい」「GitHub との接続を切る」「特定ファイルを追跡から外す」
  「エラーが出たときの対処」などの具体シナリオを収録（計 44 カード）
- 掲載コマンドの大半は「ターミナルタブ」でそのまま試せる（`.gitignore` / `rm -rf .git` のみ実機操作）

---

## サポートコマンド一覧

### Git 基本

| コマンド | 説明 |
|----------|------|
| `git init` | リポジトリを初期化（ブランチは `main` から開始） |
| `git status` | 現在の状態（ブランチ / ステージ済み / 未追跡 / origin との ahead-behind） |
| `git add <file>...` | ステージに追加（`git add .` で今いる場所以下すべて） |
| `git commit -m "メッセージ"` | ステージ済みの変更をコミット |
| `git commit --amend -m "..."` | 直近のコミットのメッセージ/内容を修正（ステージ済みの追加も取り込む） |
| `git reset` | ステージを取り消す |
| `git reset --soft HEAD~N` | N 個前へ戻し、変更はステージ済みのまま残す |
| `git reset --hard HEAD~N` | N 個前へ戻し、その変更は破棄する |
| `git revert HEAD` / `<hash>` | コミットを打ち消す「新しいコミット」で安全に戻す |
| `git restore <file>` | 未コミットの変更を破棄して元に戻す |
| `git restore --staged <file>` | ステージ登録だけを取り消す |
| `git rm <file>` | ファイルを削除して「削除」をステージする |
| `git rm --cached <file>` | 手元のファイルを残したまま Git の追跡から外す（`-r` でフォルダごと） |
| `git log [--oneline] [--graph] [--all]` | コミット履歴 |
| `git branch` | 一覧（`origin` との tracking / ahead-behind を表示） |
| `git branch <name>` / `-d <name>` / `-D <name>` | 作成 / マージ済みなら削除 / 強制削除 |
| `git checkout [-b] <name>` | ブランチ切替 / 新規作成して切替 |
| `git switch [-c] <name>` | checkout の別名 |
| `git merge <name>` | 現在のブランチに統合（Fast-forward / マージコミット） |
| `git tag` | タグ一覧 |
| `git tag -a <name> -m "msg"` | 注釈付きタグを作成 |
| `git tag -d <name>` | タグ削除 |
| `git graph` | SVG ブランチツリー（独自コマンド） |

### ファイルシステム（Windows 風）

`pwd` / `cd` / `mkdir` / `rmdir` / `ls` / `dir` / `tree` / `touch <file>` / `rm <file>`
`clear`（Ctrl+L）/ `help` / `exit`

### GitHub / リモート

| コマンド | 説明 |
|----------|------|
| `git remote add <name> [<url>]` | リモート登録（URL 省略時はデフォルト URL） |
| `git remote [-v]` | リモート一覧 |
| `git remote set-url <name> <newurl>` | リモートの URL を張り替え |
| `git remote rm <name>` | リモート削除 |
| `git push [-u] [origin] [branch]` | コミットを GitHub に送る（non-fast-forward は拒否） |
| `git fetch [origin]` | リモートの状態だけ取得 |
| `git pull [origin] [branch]` | リモートを取り込み（Fast-forward / 分岐時はマージコミット） |
| `git peer-commit <branch> -m "msg"` | 開発相手の GitHub での直接コミットをシミュレート（独自コマンド） |

`git peer-commit` は**学習用の独自コマンド**です。リモート側にだけコミットを追加し、
「自分のローカルが ahead / behind」という状態を作り出すために使います。

### ahead / behind（同期状態）

ローカルと origin のブランチの差分を自動判定し、以下を表示します。

- `git status` …「up to date / ahead by N / behind by N / diverged」
- `git branch` … `[origin/main: ahead N, behind N]` 形式
- `git push` … 非 fast-forward の場合は `! [rejected]` とヒントを表示
- `git pull` … ahead のみのとき Fast-forward、分岐しているときはマージコミットを作成
- SVG / テキストグラフに `origin/<branch>` ラベル、タグラベル、HEAD マークを表示

---

## ファイル構成

```
index.html          4 タブ（ターミナル / 開発フロー / 上級者向け問題 / 早見表）の UI
styles.css          ターミナル・タブ・SVG グラフ・問題画面・早見表のスタイル
js/
  state.js          リポジトリ状態 (state)・仮想 FS (fsState)・リセット・共通ユーティリティ
  path.js           パス解決・正規化・Windows 表示変換
  filesystem.js     pwd / mkdir / cd / rmdir / ls / tree / touch / rm の実装
  gitcore.js        git コマンド本体（init〜tag、reset/revert/restore/rm、remote / push / fetch / pull / peer-commit）
  graph.js          git graph（SVG）・git log --graph（テキスト）の描画
  terminal.js       出力 (out/echo)・入力バインド・履歴・タブ切替・コマンドディスパッチ・help
  tutorial.js       開発フローチュートリアル（2 コース）のエンジンとステップ定義
  practice.js       上級者向け問題（7 問）のエンジンと問題定義
  cheatsheet.js     早見表（状況×コマンド×手順）のデータと描画・検索
  main.js           エントリポイント（イベント登録・起動処理・依存チェック）
```

読み込み順は `state → path → filesystem → gitcore → graph → terminal → tutorial → practice → cheatsheet → main`。
ES Modules は使わず **classic スクリプト**で全モジュールを連結し、`file://` で直接開いても動作します。

### state.js のデータモデル

```js
state = {
  initialized: boolean,      // git init 済みか
  currentBranch: string,     // 現在のブランチ名
  branches: { name: { tip: commitId|null, color } },
  commits:   { id: { id, message, parents:[], files:[], date, seq } },
  stagedFiles: [],           // ステージされたファイル（絶対パス）
  stagedDeletions: [],       // git rm / git rm --cached で削除をステージしたファイル
  workingFiles: [],          // 仮想 FS 上の全ファイル（絶対パス）
  modified: [],              // 追跡済みで変更されたファイル
  tags:      { name: { commit, annotated, message, date } },
  remote: null | { name, url, branches:{name->tip}, synced:{name->lastFetchTip} },
  lastPushRejected: boolean, // 直近の push が拒否されたか（チュートリアル判定用）
}

fsState = {
  dirs: Set([...]),          // 存在するディレクトリ
  cwd: '/',                  // 現在のディレクトリ（絶対パス）
}
```

### main.js の依存チェック

最終ロードの `main.js` に全モジュールの関数を列挙した `__deps` を持ち、
ロード順・分割のミスによる未定義シンボルを起動時に検出します。

---

## 使い方

1. このフォルダの `index.html` をブラウザで開く（Chrome / Edge 推奨）
2. ターミナルタブで `help` と入力してコマンド一覧を確認
3. おすすめの流れ:
   `git init` → `touch README.md` → `git add .` → `git commit -m "initial"` → `git graph`
4. 「開発フローで学ぶ」タブでステップ式のレッスン（コース 2 では GitHub チーム開発）
5. 「上級者向け問題」タブで練習問題に挑戦（7 問）
6. 「早見表」タブで「こんなときどうする?」を検索（例: バグ / push / 戻す）

## 開発メモ

- ロジックはすべて素の JavaScript（フレームワーク・外部ライブラリなし）
- カスタムコマンド（`git graph` / `git peer-commit`）は本物の Git にはない学習用機能
- タブは 4 つとも別々の作動領域を持ち、共通の `state` を共有する
- やり直し系（`reset --soft/--hard` / `revert` / `restore` / `commit --amend`）と
  `git rm (--cached)`、`git remote set-url` はサンドボックス用に新規実装した学習用コマンド
- `git rm --cached` の削除ステージは `stagedDeletions` で管理し、`git status` の `deleted:` 表示・
  commit への反映・`git reset` / `git restore --staged` での取り消しに対応
- `.gitignore` の無視判定と `rm -rf .git` は仮想 FS の制約（ファイル内容を持たない）で再現しないため、
  早見表では「※実機コマンド」として案内のみ
- `node --check` で各 JS ファイルの構文チェックが可能