// =====================================================================
// ブランチツリーの描画
//   - レイアウト計算 (コミット・ブランチをレーン/深度で配置)
//   - SVG 描画 (git graph 独自コマンド)
//   - テキストグラフ (git log --graph)
// =====================================================================

// ---------------------------------------------------------------------
// git graph - SVG によるブランチツリー表示(独自コマンド)
// ---------------------------------------------------------------------
function gitGraph() {
    if (!guardInit()) return;
    const layout = computeLayout();
    if (!layout) {
        out('(まだコミットがありません。 git commit で作成しましょう)', 'gray');
        return;
    }
    const svg = renderSvg(layout);
    const title = document.createElement('p');
    title.className = 'branch-title';
    title.textContent = '◆ Branch Tree (複数行の分岐は git log --graph でも確認できます)';
    const box = document.createElement('div');
    box.className = 'branch-tree';
    box.innerHTML = svg;
    currentSink.output.appendChild(title);
    currentSink.output.appendChild(box);
    scrollBottom();
}

// ---------------------------------------------------------------------
// レイアウト計算 (グラフ描画用)
// ---------------------------------------------------------------------
function computeLayout(tipsArg) {
    let tips;
    if (tipsArg instanceof Set && tipsArg.size > 0) {
        tips = [...tipsArg];
    } else if (tipsArg instanceof Set) {
        tips = [
            ...Object.values(state.branches).map(b => b.tip).filter(Boolean),
            ...Object.values(state.tags).map(t => t.commit),
        ];
    } else {
        tips = [
            ...Object.values(state.branches).map(b => b.tip).filter(Boolean),
            ...Object.values(state.tags).map(t => t.commit),
        ];
    }
    tips = [...new Set(tips.filter(Boolean))];
    if (tips.length === 0) return null;

    const reachable = new Set();
    const stack = [...tips];
    while (stack.length) {
        const id = stack.pop();
        if (reachable.has(id)) continue;
        reachable.add(id);
        for (const p of state.commits[id].parents) {
            if (!reachable.has(p) && state.commits[p]) stack.push(p);
        }
    }
    const ids = [...reachable];
    ids.sort((a, b) => state.commits[a].seq - state.commits[b].seq);

    const depth = {};
    function calcDepth(id) {
        if (depth[id] !== undefined) return depth[id];
        const c = state.commits[id];
        let d = c.parents.length ? calcDepth(c.parents[0]) + 1 : 0;
        depth[id] = d;
        return d;
    }
    ids.forEach(calcDepth);

    const laneOf = {};
    const usedAt = {};
    let maxLane = 0;
    let maxDepth = 0;
    for (const id of ids) {
        const d = depth[id];
        maxDepth = Math.max(maxDepth, d);
        if (!usedAt[d]) usedAt[d] = new Set();
        const p = state.commits[id].parents[0] || null;
        let lane;
        if (p && laneOf[p] !== undefined && !usedAt[d].has(laneOf[p])) {
            lane = laneOf[p];
        } else {
            lane = 0;
            while (usedAt[d].has(lane)) lane++;
        }
        laneOf[id] = lane;
        usedAt[d].add(lane);
        maxLane = Math.max(maxLane, lane);
    }

    const commitToBranch = {};
    for (const b of Object.keys(state.branches)) {
        let cur = state.branches[b].tip;
        while (cur && !commitToBranch[cur]) {
            commitToBranch[cur] = b;
            const c = state.commits[cur];
            cur = c.parents.length ? c.parents[0] : null;
        }
    }

    return { ids, depth, laneOf, maxLane, maxDepth, commitToBranch };
}

function commitColor(layout, id) {
    const b = layout.commitToBranch[id];
    return b && state.branches[b] ? state.branches[b].color : '#6e7681';
}

// ---------------------------------------------------------------------
// SVG 描画
// ---------------------------------------------------------------------
const LANE_W = 74;
const ROW_H = 58;
const PAD_L = 24;
const PAD_T = 46;
const PAD_R = 140;
const PAD_B = 30;

let svgCounter = 0;

function renderSvg(layout) {
    svgCounter += 1;
    const markerId = 'arr' + svgCounter;
    const w = PAD_L + (layout.maxLane + 1) * LANE_W + PAD_R;
    const h = PAD_T + (layout.maxDepth + 1) * ROW_H + PAD_B;

    const x = (lane) => PAD_L + lane * LANE_W + 8;
    const y = (d) => PAD_T + d * ROW_H;

    let edges = '';
    for (const id of layout.ids) {
        const c = state.commits[id];
        for (const p of c.parents) {
            if (!layout.ids.includes(p)) continue;
            const cx = x(layout.laneOf[id]);
            const cy = y(layout.depth[id]);
            const px = x(layout.laneOf[p]);
            const py = y(layout.depth[p]);
            const color = commitColor(layout, p);
            if (layout.laneOf[id] === layout.laneOf[p]) {
                edges +=
                    `<polygon points="${cx},${cy} ${cx},${py - 7}" fill="none" stroke="${color}" ` +
                    `stroke-width="2" marker-end="url(#${markerId})"/>`;
            } else {
                edges +=
                    `<polygon points="${cx},${cy} ${cx},${py} ${px},${py - 7}" fill="none" ` +
                    `stroke="${color}" stroke-width="2" marker-end="url(#${markerId})"/>`;
            }
        }
    }

    let nodes = '';
    for (const id of layout.ids) {
        const c = state.commits[id];
        const cx = x(layout.laneOf[id]);
        const cy = y(layout.depth[id]);
        const color = commitColor(layout, id);
        const isHeadTip = state.initialized && state.currentBranch &&
                          state.branches[state.currentBranch].tip === id;

        nodes += `<circle cx="${cx}" cy="${cy}" r="9" fill="${color}" stroke="#0d1117" stroke-width="2"/>`;
        nodes += `<text x="${cx + 15}" y="${cy + 4}" class="commit-id" fill="${color}">` +
                 `${id.substring(0, 7)}</text>`;
        if (c.parents.length > 1) {
            nodes += `<text x="${cx + 15}" y="${cy - 9}" class="tag-label">merge</text>`;
        }
        nodes += `<text x="${cx + 96}" y="${cy + 4}" class="commit-msg">${escapeHtml(c.message)}</text>`;
        if (isHeadTip) {
            nodes += `<text x="${cx + 15}" y="${cy + 18}" class="head-mark">HEAD</text>`;
        }
        if (state.remote) {
            const remoteMarks = Object.entries(state.remote.branches)
                .filter(([, tip]) => tip === id)
                .map(([n]) => 'origin/' + n);
            if (remoteMarks.length) {
                nodes += `<text x="${cx + 15}" y="${cy + 32}" class="remote-mark">${remoteMarks.join(' ')}</text>`;
            }
        }
        for (const [tname, tag] of Object.entries(state.tags)) {
            if (tag.commit !== id) continue;
            nodes += `<text x="${cx - 14}" y="${cy - 8}" class="tag-label" text-anchor="end">` +
                     `${escapeHtml(tname)}</text>`;
        }
    }

    let branchLabels = '';
    for (const b of Object.keys(state.branches)) {
        const tip = state.branches[b].tip;
        if (!tip || !layout.ids.includes(tip)) continue;
        const bx = x(layout.laneOf[tip]);
        const by = y(layout.depth[tip]);
        branchLabels += `<text x="${bx}" y="${by - 18}" class="branch-label" fill="${state.branches[b].color}" ` +
            `text-anchor="middle" ${b === state.currentBranch ? 'font-weight="bold"' : ''}>` +
            `${escapeHtml(b)}</text>`;
    }

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <marker id="${markerId}" viewBox="0 0 10 10" refX="5" refY="10" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L5 10 L10 0 z" fill="context-stroke"/>
    </marker>
  </defs>
  ${edges}
  ${nodes}
  ${branchLabels}
</svg>`;
}

// ---------------------------------------------------------------------
// git log --graph (テキストによるグラフ)
// ---------------------------------------------------------------------
function buildTextGraph(layout, headBranch) {
    const rows = new Map();
    const maxLane = layout.maxLane;
    const maxDepth = layout.maxDepth;

    function putCell(d, l, ch) {
        if (d < 0 || l < 0 || l > maxLane) return;
        if (!rows.has(d)) rows.set(d, new Map());
        const m = rows.get(d);
        if (!m.has(l)) m.set(l, ch);
    }

    for (const id of layout.ids) {
        putCell(layout.depth[id], layout.laneOf[id], '*');
    }

    for (const id of layout.ids) {
        const c = state.commits[id];
        const l = layout.laneOf[id];
        for (const p of c.parents) {
            if (!layout.ids.includes(p)) continue;
            const dp = layout.depth[p];
            const lp = layout.laneOf[p];
            for (let d = dp + 1; d < layout.depth[id]; d++) putCell(d, l, '|');
            if (lp !== l) {
                putCell(dp, l, lp < l ? '\\' : '/');
            }
        }
    }

    const lines = [];
    for (let d = maxDepth; d >= 0; d--) {
        if (!rows.has(d)) continue;
        const m = rows.get(d);
        const nodesAt = [];
        for (const [l, ch] of m) if (ch === '*') nodesAt.push(l);
        if (nodesAt.length === 0) continue;

        for (const nl of nodesAt) {
            let row = '';
            for (let l = 0; l <= maxLane; l++) {
                if (l === nl) { row += '*'; continue; }
                const ch = m.get(l);
                row += ch === '*' ? 'o' : (ch || ' ');
            }
            const idCommit = layout.ids.find(i => layout.depth[i] === d && layout.laneOf[i] === nl);
            let suffix = ' ' + idCommit.substring(0, 7) + ' ' + state.commits[idCommit].message;
            const labels = [];
            const isHead = headBranch && state.branches[headBranch] &&
                           state.branches[headBranch].tip === idCommit;
            if (isHead) labels.push('HEAD -> ' + headBranch);
            if (state.remote) {
                const remoteMarks = Object.entries(state.remote.branches)
                    .filter(([, tip]) => tip === idCommit)
                    .map(([n]) => 'origin/' + n);
                if (remoteMarks.length) labels.push(remoteMarks.join(', '));
            }
            const tags = Object.keys(state.tags).filter(t => state.tags[t].commit === idCommit);
            if (tags.length) labels.push('tag: ' + tags.join(', '));
            if (labels.length) suffix += '  (' + labels.join(', ') + ')';
            lines.push(row.replace(/[\s\\/]+$/, '') + suffix);
        }
    }
    return lines;
}