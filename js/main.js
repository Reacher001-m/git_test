// =====================================================================
// メイン処理 (エントリポイント)
//   - タブクリック・リセットボタン・入力のイベント登録
//   - 起動処理 (boot)
// =====================================================================

// ---------------------------------------------------------------------
// タブクリック・イベント登録
// ---------------------------------------------------------------------
document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => activateTab(t.dataset.tab));
});

bindInput(baseInput, 'sb', null);
bindInput(wfInput, 'wf', workflowOnCommand);
bindInput(pbInput, 'pb', practiceOnCommand);
focusOnClick(document.getElementById('panel-sandbox'), baseInput);
focusOnClick(document.getElementById('panel-workflow'), wfInput);
focusOnClick(document.getElementById('panel-practice'), pbInput);

wfResetBtn.addEventListener('click', () => {
    resetRepo();
    workflowView.state = 'start';
    renderWorkflowStart();
    setSink('wf');
    out('リポジトリをリセットしました。「スタート」からやり直せます。', 'gray');
    refreshPrompt();
});

pbBackBtn.addEventListener('click', () => {
    renderPracticeList();
    setSink('pb');
    refreshPrompt();
    if (currentSink === sinks.pb) scrollBottom();
    pbInput.focus();
});

// ---------------------------------------------------------------------
// 起動
// ---------------------------------------------------------------------
function boot() {
    setSink('sb');
    refreshPrompt();
    renderWorkflowStart();
    renderPracticeList();
    out('==========================================', 'gray');
    out('        Git 操作サンドボックス v2.1', 'cyan');
    out('==========================================', 'gray');
    out('Windows 風ターミナル + Git のシミュレーションです。', 'gray');
    out('「help」でコマンド一覧、「git graph」でブランチツリーを表示します。', 'gray');
    out('「開発フローで学ぶ」タブで実開発の手順を、', 'yellow');
    out('「上級者向け問題」タブで Git/GitHub の練習問題を解けます。', 'yellow');
    out('');
    out('最初の一歩: git init', 'yellow');
    baseInput.focus();
    scrollBottom();
}

boot();

// ---------------------------------------------------------------------
// 依存の強制参照 (未定義シンボルの早期検出)
//   - 最終ロードの main.js で全モジュールの関数を解決し、
//     ロード順ミス・分割ミスを実行前に検出する
// ---------------------------------------------------------------------
const __deps = [
    refreshPrompt,            // terminal.js
    displayPath, resolvePath, normalizePath, relPath, workingFilesUnder, childrenOf,  // path.js
    out, echo, scrollBottom, setSink, showHelp, guardInit, dispatchCommand, bindInput, // terminal.js
    cmdPwd, cmdMkdir, cmdCd, cmdRmdir, cmdLs, cmdTree, walkTree, touchFiles, rmFiles,  // filesystem.js
    gitInit, gitStatus, gitAdd, gitCommit, gitBranch, gitCheckout, gitSwitch, gitMerge, // gitcore.js
    gitReset, gitTag, gitLog, mapHeadTips, historyIdList, headCommitedFiles, hasTracked, hasUntracked,
    gitRemote, gitPush, gitFetch, gitPull, gitPeerCommit, peerCommitTip, aheadBehind,   // gitcore.js (GitHub)
    gitGraph, computeLayout, commitColor, renderSvg, buildTextGraph,                   // graph.js
    workflowView, renderWorkflowStart, startTutorial, workflowOnCommand,              // tutorial.js
    practiceView, renderPracticeList, startPractice, practiceOnCommand,               // practice.js
    activateTab, resetRepo,                                                          // 再帰の整合
];
void __deps;