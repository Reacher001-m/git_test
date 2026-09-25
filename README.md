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
- **ブランチの可視化** … `git graph` で SVG のブランチツリー、`git log --graph` でテキストグラフを表示
- **GitHub 連携（リモート操作）** … `remote add / push / fetch / pull / peer-commit`（後述）

### 2. 開発フローで学ぶタブ（チュートリアル）

「初期化 → 状態確認 → ステージ → コミット → ログ → ブランチ → マージ → タグ」の
実開発の流れを 11 ステップで学べます。

- 指示に従ってコマンドを入力すると自動チェックされ、次のステップへ進む
- 「自動実行」「ヒント」「スキップ」ボタン付き
- クリア後は作ったリポジトリがターミナルタブにそのまま残る

### 3. 上級者向け問題タブ（練習問題）

達成すべき状態を作るコマンドを入力するチェックリスト式の練習問題です。

- 初級 2 問 / 中級 2 問 / 上級 2 問（計 6 問）
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
  | 6 | 上級 | リリース版にタグを付ける - tag |

---

## サポートコマンド一覧

### Git 基本

| コマンド | 説明 |
|----------|------|
| `git init` | リポジトリを初期化（ブランチは `main` から開始） |
| `git status` | 現在の状態（ブランチ / ステージ済み / 未追跡 / origin との ahead-behind） |
| `git add <file>...` | ステージに追加（`git add .` で今いる場所以下すべて） |
| `git commit -m "メッセージ"` | ステージ済みの変更をコミット |
| `git reset` | ステージを取り消す |
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
index.html          3 タブ（ターミナル / 開発フロー / 上級者向け問題）の UI
styles.css          ターミナル・タブ・SVG グラフ・問題画面のスタイル
js/
  state.js          リポジトリ状態 (state)・仮想 FS (fsState)・リセット・共通ユーティリティ
  path.js           パス解決・正規化・Windows 表示変換
  filesystem.js     pwd / mkdir / cd / rmdir / ls / tree / touch / rm の実装
  gitcore.js        git コマンド本体（init〜tag、remote / push / fetch / pull / peer-commit）
  graph.js          git graph（SVG）・git log --graph（テキスト）の描画
  terminal.js       出力 (out/echo)・入力バインド・履歴・タブ切替・コマンドディスパッチ・help
  tutorial.js       開発フローチュートリアル（11 ステップ）
  practice.js       上級者向け問題（6 問）のエンジンと問題定義
  main.js           エントリポイント（イベント登録・起動処理・依存チェック）
```

読み込み順は `state → path → filesystem → gitcore → graph → terminal → tutorial → practice → main`。
ES Modules は使わず **classic スクリプト**で全モジュールを連結し、`file://` で直接開いても動作します。

### state.js のデータモデル

```js
state = {
  initialized: boolean,      // git init 済みか
  currentBranch: string,     // 現在のブランチ名
  branches: { name: { tip: commitId|null, color } },
  commits:   { id: { id, message, parents:[], files:[], date, seq } },
  stagedFiles: [],           // ステージされたファイル（絶対パス）
  workingFiles: [],          // 仮想 FS 上の全ファイル（絶対パス）
  modified: [],              // 追跡済みで変更されたファイル
  tags:      { name: { commit, annotated, message, date } },
  remote: null | { name, url, branches:{name->tip}, synced:{name->lastFetchTip} },
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
4. 「開発フローで学ぶ」タブでステップ式のレッスン
5. 「上級者向け問題」タブで練習問題に挑戦

## 開発メモ

- ロジックはすべて素の JavaScript（フレームワーク・外部ライブラリなし）
- カスタムコマンド（`git graph` / `git peer-commit`）は本物の Git にはない学習用機能
- タブは 3 つとも別々の作動領域を持ち、共通の `state` を共有する
- `node --check` で各 JS ファイルの構文チェックが可能