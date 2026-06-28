# Issue: インタラクティブ図表とレッスン本文の作り直し

対象: Codex
種別: 設計改善（コンテンツ品質 / データ生成）
優先度: 高

---

## 0. 結論（最初に読む）

描画エンジン（[`assets/js/visualizations.js`](../assets/js/visualizations.js) / [`assets/js/lesson.js`](../assets/js/lesson.js)）は前回修正でまともになった。
**残っている問題は「各ページに流し込むデータ（spec）」がすべて [`scripts/generate-site.js`](../scripts/generate-site.js) の機械合成で、内容が空虚なこと。**

特に **比較表(comparison-table)16ページ + 対応表(relation-table)24ページ = 計40ページ** が「全行に同じ文章が並ぶ表」になっており、学習価値がゼロ。表として成立していない。

> **修正は87個のHTMLを手で直すのではなく、生成元の [`scripts/generate-site.js`](../scripts/generate-site.js) と、そこが参照するコンテンツデータを直すこと。**
> HTMLは生成物（`node scripts/generate-site.js` で再生成される）なので、HTMLを直接編集しても次の生成で消える。

---

## 1. 現状アーキテクチャ（どこを直すか）

- ページHTMLは [`scripts/generate-site.js`](../scripts/generate-site.js) が自動生成する。
- 1レッスンの入力は `lesson(slug, title, terms, focus, visualType, steps)` というタプル（[generate-site.js:16-167](../scripts/generate-site.js#L16) のチャプター定義）。
- 図表データは `visualFor()`（[L180](../scripts/generate-site.js#L180)）が `visualType` から自動で組み立てる。
- 表データは `comparisonSpec()`（[L232](../scripts/generate-site.js#L232)）/ `relationSpec()`（[L245](../scripts/generate-site.js#L245)）が **用語配列から数式的に合成**している。← ここが諸悪の根源。
- 本文は `explanationFor()`（[L465](../scripts/generate-site.js#L465)）がテンプレ合成。
- 確認問題は `quizFor()`（[L425](../scripts/generate-site.js#L425)）が practice 問題から検索して流用。← ここは妥当、流用継続でよい。

図表種別ごとのページ数（現状）:

| 種別 | ページ数 | 状態 |
|---|---|---|
| relation-table | 24 | ✗ 全行同一文。作り直し必須 |
| comparison-table | 16 | ✗ 全行同一文。作り直し必須 |
| flow | 27 | △ 手書き steps は良いが、用語流用フォールバックは弱い |
| distribution | 6 | ○ エンジンは妥当。テーマ適合の見直しのみ |
| regression | 6 | ○ 同上 |
| classification | 4 | ○ 同上 |
| network | 2 | ○ |
| attention | 2 | △ tokens が用語リストで非現実的 |

---

## 2. 問題の詳細（重大度順・根拠つき）

### P1【最重大】比較表・対応表が「全行同じ文」

原因コード:

- `relationSpec()` [generate-site.js:245-256](../scripts/generate-site.js#L245)
  - 2列目「関係」: `index === 0 ? focus : `${terms[0]}を理解するための関連語``
    → **先頭以外の行は全部「○○を理解するための関連語」という同一文**になる。
  - 3列目「区別ポイント」: `perspectiveFor(term)`（[L266](../scripts/generate-site.js#L266)）は5種類の定型文のいずれかを返すだけ。
- `comparisonSpec()` [generate-site.js:232-243](../scripts/generate-site.js#L232)
  - 2列目「役割」: `roleFor(term, focus)`（[L258](../scripts/generate-site.js#L258)）は多くの用語で `focus`（=レッスン要約）をそのまま返す → **全行が同じレッスン要約**。

実際の出力（`chapters/law-contract/copyright.html`）:

| 概念 | 関係 | 区別ポイント |
|---|---|---|
| 著作権 | 学習・生成・利用の各段階で…（=focus） | 要件・対象・例外を分ける |
| 学習データ | **著作権を理解するための関連語** | 似た用語との境界を説明できるようにする |
| 生成物 | **著作権を理解するための関連語** | 似た用語との境界を説明できるようにする |
| 権利制限 | **著作権を理解するための関連語** | 要件・対象・例外を分ける |

実際の出力（`chapters/ai-basics/turing-test.html`, comparison-table）:
→ 「役割」列・「試験での見方」列が**全4行まったく同一の文**。

**1列でも全行が同じ文になっている表は不合格。**

### P2【重大】Attention の入力が非現実的

- `visualFor()` の attention 分岐 [generate-site.js:207-215](../scripts/generate-site.js#L207) で
  `tokens: ["文脈","Query","Key","Value","重み"]`（=用語リスト）を渡している。
- エンジン側 [visualizations.js:302](../assets/js/visualizations.js#L302) はこのトークンに対し `sin/cos(i)` のダミーベクトルで内積を取る。
- softmax 計算自体は正しいが、**入力が「文章のトークン列」ではなく用語の寄せ集め**なので、学習者には何を見ているのか伝わらない。

### P3【中】フロー図の品質が不均一

- 手書き `steps` のあるレッスン（例: `backpropagation` 予測→損失→勾配→逆伝播→更新、`project-flow`）は**良い**。
- `steps` 未指定だと `visualFor()` [L220](../scripts/generate-site.js#L220) が `terms` をそのままステップ化 → 「流れ」になっていない。
- そもそもプロセスでないテーマにまで flow を機械適用している箇所がある。

### P4【中】「全ページに必ず1つ図表」という方針自体に無理がある

- 法律・倫理・契約など、本質的に数値でも工程でもないテーマに、無理やり表/フローを当てている。
- 図表が逆に理解を妨げている。**図表が有効なテーマに絞る**判断を入れるべき。

### P5【小】本文がテンプレ合成で内容が薄い

- `explanationFor()` [generate-site.js:465-474](../scripts/generate-site.js#L465) は
  「○○では、A、B、Cを別々の暗記事項ではなく…」という穴埋め1文＋演習問題の引用。
- テーマ固有の中身がない。

---

## 3. あるべき姿（要件）

1. **表は「行ごとに異なる、テーマ固有の中身」を持つこと。** 列の意味が成立していること。
2. **図表種別はテーマに合うものだけを選ぶ。** 合わない場合は「図表なし（本文・箇条書き比較で代替）」を許可する。
3. **Attention のトークンは意味のある日本語の文**にする。
4. **flow は本当に順序のあるテーマだけ**に使い、各ステップに短い説明(note)を付ける。
5. コンテンツ（表の行・本文）は **用語配列からの数式合成をやめ、明示的に著作したデータ**を使う。

---

## 4. 具体的な修正指示

### 4-1. コンテンツデータを「著作」方式に変える（最重要）

`lesson()` タプルに、表データ・本文を**明示的に渡せる**ようにする。
推奨: チャプター定義のインラインが大きくなりすぎるなら、別ファイル
`content/lesson-content.json`（または `content/lessons/<chapter>/<slug>.json`）に外出しし、
`generate-site.js` がそれを読み込んで埋め込む。

レッスンごとのコンテンツスキーマ（例）:

```jsonc
{
  "slug": "law-contract/copyright",
  "explanation": [
    "AIと著作権は『学習』『生成』『利用』の3段階で論点が変わる。段階を取り違えると結論を誤る。",
    "学習データの利用は情報解析目的の権利制限規定が関わり、生成物は依拠性・類似性で侵害判断される。"
  ],
  "visual": {
    "type": "relation-table",
    "title": "著作権: 段階ごとの論点",
    "columns": ["段階", "主な論点", "判断のポイント"],
    "rows": [
      ["学習データの収集・利用", "情報解析目的の権利制限", "享受目的が混ざると例外が外れる"],
      ["生成物の生成", "既存著作物への依拠性", "学習元への類似と依拠の有無で判断"],
      ["生成物の利用・公開", "侵害・利用許諾", "商用利用と出所表示の要否を確認"]
    ]
  }
}
```

ポイント:
- `rows` は**人が書いた**テーマ固有の内容。`terms.map(...)` での自動生成を全廃。
- 列ヘッダもテーマに合わせて変えてよい（「段階/論点/判断」など）。

### 4-2. `comparisonSpec` / `relationSpec` / `roleFor` / `perspectiveFor` を撤去

- [generate-site.js:232-272](../scripts/generate-site.js#L232) の自動合成関数を削除し、4-1 の著作データを使う。
- どうしても暫定フォールバックが必要な場合でも、**全行に同じ文字列を入れる実装は禁止**。

### 4-3. Attention のトークンを文にする

- `visualFor()` の attention 分岐を、意味のある文に変更。
  - 例（Attention）: `tokens: ["猫","が","魚","を","食べた"]`
  - 例（Transformer/Self-Attention）: 主語・動詞・目的語が照応する短文。
- 可能なら `sin/cos` ダミーではなく、トークンに紐づく簡単な特徴量を与えて「意味的に近い語の重みが上がる」ように [visualizations.js:302-309](../assets/js/visualizations.js#L302) を調整する。

### 4-4. flow の整備

- flow を使うレッスンは**必ず手書き `steps`（label + note）を持つ**こと。terms フォールバック禁止。
- 順序性のないテーマは flow から外し、本文＋表、または「図表なし」にする。

### 4-5. 図表種別の割り当て見直し

各レッスンの `visualType` を以下の基準で再点検:

- distribution / regression / classification … 数値・統計・評価指標テーマのみ。
- network … 構造を持つNN系のみ。
- attention … Attention/Transformer のみ。
- flow … 明確な工程・手順・時系列のみ。
- comparison-table / relation-table … 用語の対比・区別が主題のもの。
- **上記に当てはまらない（特に法律・倫理の一部）→ 図表を付けない選択肢を許可。**

### 4-6. 本文の最低品質

- `explanation` は最低2文、**テーマ固有の定義 + 試験で問われる観点**を含む。
- テンプレ穴埋め1文だけ、を禁止。

---

## 5. 受け入れ基準（Acceptance Criteria）

レビューで以下を機械的にチェックする:

- [ ] **どの表でも、同一列内に完全一致するセルが「全行」並んでいない。**（特に comparison-table / relation-table）
- [ ] 「○○を理解するための関連語」「似た用語との境界を説明できるようにする」などの定型文が**サイト全体から消えている**。
- [ ] 各表の行が、そのテーマ固有の内容になっている（用語名だけの差し替えでない）。
- [ ] Attention ページの `tokens` が意味のある日本語の文になっている。
- [ ] flow ページはすべて手書き `steps` を持ち、各ステップに `note` がある。
- [ ] 図表を付けないと判断したレッスンがあり、その判断理由が説明できる（全ページ強制ではない）。
- [ ] 本文が各ページで内容が異なり、テンプレ1文だけのページがない。
- [ ] `node scripts/generate-site.js` 実行後、上記がHTMLに反映される（HTML直編集ではない）。

検証用grep例:
```bash
# 定型ゴミ文が残っていないこと（0件であるべき）
grep -rl "を理解するための関連語" chapters
grep -rl "似た用語との境界を説明できるようにする" chapters
```

---

## 6. 推奨着手順（段階）

1. **P1解消**: 表40ページ分の著作データを作り、`comparisonSpec/relationSpec` を撤去。（最も体感が変わる）
2. **P4/P5見直し**: 図表種別の割り当てと本文を、テーマ単位で点検。図表不要ページを決める。
3. **P2/P3**: Attention のトークンと flow の steps を整備。
4. 再生成 → 受け入れ基準で全ページ確認。

---

## 6.5. 【最重要・Codexへ】「スクリプトで一気に合成」をやめる

現状の作り方は「`generate-site.js` が用語配列から表・本文を**数式で自動生成**する」方式。
これが全ページが空虚になる**直接の原因**。コンテンツは計算で生み出せない。

役割を明確に分離すること:

| 層 | 担当 | やり方 |
|---|---|---|
| **生成スクリプト** | HTMLの骨組み・レイアウト・ナビ・採点JS | 一気に自動生成してよい |
| **コンテンツ（表の行・本文・トークン文）** | 知識そのもの | **1テーマずつ人が著作したデータを読み込む。合成禁止** |

具体的に守ること:
- `generate-site.js` は **コンテンツを「生成」せず、`content/lessons/...` の著作データを「埋め込む」だけ**にする。
- 表の行・本文・Attentionの文を、`map`/正規表現/テンプレ関数で**作り出してはいけない**。データが無いテーマは、図表を付けない or 本文のみにする。
- 「87ページを1コマンドで埋める」ことを品質の代わりにしない。**埋まっていることと、中身があることは別物。**
- もし全テーマ分の著作が一度に無理なら、**少数の完成テーマ（例: 著作権・公平性・回帰・Attention）を“お手本”として先に仕上げ**、残りは順次。空テンプレで87ページを“完成扱い”にしない。

---

## 7. やってはいけないこと

- HTMLを直接編集して済ませる（生成で消える）。
- 用語配列から表の行を自動生成する実装を温存する。
- 「全ページに図表必須」を理由に、無意味な図表を残す。
- 全行同一の文字列でセルを埋める。
