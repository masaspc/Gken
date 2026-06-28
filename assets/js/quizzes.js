(function () {
  "use strict";

  const modules = [
    {
      id: "ai-basics",
      title: "人工知能とは",
      minutes: 25,
      focus: "AIの定義、強いAIと弱いAI、人工知能分野で議論される代表論点。",
      outcome: "AIという言葉の揺れを理解し、試験で問われる基本概念を整理できる。",
      visual: "定義比較カードと論点マップ",
      tags: ["定義", "フレーム問題", "チューリングテスト"]
    },
    {
      id: "ai-history",
      title: "人工知能をめぐる動向",
      minutes: 30,
      focus: "探索・推論、知識表現、エキスパートシステム、機械学習、ディープラーニングの流れ。",
      outcome: "AIブームの変遷と、各技術がどの問題を解こうとしたかを説明できる。",
      visual: "年表と技術系譜図",
      tags: ["探索", "知識表現", "AIブーム"]
    },
    {
      id: "ml-overview",
      title: "機械学習の概要",
      minutes: 35,
      focus: "教師あり学習、教師なし学習、強化学習、モデル評価。",
      outcome: "課題の種類に応じて回帰・分類・クラスタリング・強化学習を選べる。",
      visual: "散布図、回帰直線、分類境界、混同行列",
      tags: ["回帰", "分類", "強化学習"]
    },
    {
      id: "dl-overview",
      title: "ディープラーニングの概要",
      minutes: 40,
      focus: "ニューラルネットワーク、活性化関数、損失関数、正則化、誤差逆伝播法、最適化。",
      outcome: "入力から損失最小化までの計算フローを図で追える。",
      visual: "ネットワーク構造図と損失の変化",
      tags: ["活性化関数", "損失関数", "最適化"]
    },
    {
      id: "dl-elements",
      title: "ディープラーニングの要素技術",
      minutes: 45,
      focus: "全結合層、畳み込み層、正規化層、プーリング層、スキップ結合、Attention、オートエンコーダ。",
      outcome: "主要レイヤーの役割と、モデル構造の狙いを比較できる。",
      visual: "レイヤー比較とAttentionヒートマップ",
      tags: ["CNN", "Attention", "正規化"]
    },
    {
      id: "applications",
      title: "ディープラーニングの応用例",
      minutes: 35,
      focus: "画像認識、自然言語処理、音声処理、深層強化学習、生成、転移学習、マルチモーダル。",
      outcome: "応用領域ごとの代表タスクと、モデル選択の観点を説明できる。",
      visual: "応用領域マップ",
      tags: ["画像認識", "NLP", "生成AI"]
    },
    {
      id: "implementation",
      title: "AIの社会実装に向けて",
      minutes: 30,
      focus: "AIプロジェクトの進め方、データ収集・加工・分析・学習、PoCから運用まで。",
      outcome: "実装前に確認すべきデータ品質、目的、評価、運用リスクを整理できる。",
      visual: "プロジェクトフローとリスクマトリクス",
      tags: ["PoC", "データ品質", "運用"]
    },
    {
      id: "math-stats",
      title: "AIに必要な数理・統計知識",
      minutes: 35,
      focus: "平均、分散、相関、確率、評価指標など、AI理解に必要な最小限の数理。",
      outcome: "統計量とグラフの対応を直感的に読み取れる。",
      visual: "分布、相関、箱ひげ図",
      tags: ["平均", "分散", "相関"]
    },
    {
      id: "law-contract",
      title: "AIに関する法律と契約",
      minutes: 35,
      focus: "個人情報保護法、著作権法、特許法、不正競争防止法、契約上の論点。",
      outcome: "AI利用時に確認すべき法務論点を、ケースごとに切り分けられる。",
      visual: "法務チェックリスト",
      tags: ["個人情報", "著作権", "契約"]
    },
    {
      id: "ethics-governance",
      title: "AI倫理・AIガバナンス",
      minutes: 35,
      focus: "公平性、安全性、透明性、プライバシー、悪用防止、ガバナンス。",
      outcome: "AIリスクを技術・組織・社会の観点から説明できる。",
      visual: "リスク評価シート",
      tags: ["公平性", "透明性", "ガバナンス"]
    },
    {
      id: "review",
      title: "横断復習・模試",
      minutes: 40,
      focus: "十区分を横断して弱点を見つけ、模試形式で定着を確認する。",
      outcome: "弱点カテゴリを把握し、次に復習すべき範囲を選べる。",
      visual: "弱点ヒートマップ",
      tags: ["模試", "弱点補強", "復習"]
    }
  ];

  const questionBank = [
    {
      id: "q-ml-1",
      module: "ml-overview",
      type: "mcq",
      prompt: "店舗売上を、地域人口・店舗面積・商品カテゴリ数から数値として予測したい。最も近い学習設定はどれですか。",
      options: ["クラスタリング", "重回帰", "強化学習", "主成分分析"],
      answer: "重回帰",
      explanation: "連続値を予測する課題なので、分類ではなく回帰の設定になります。"
    },
    {
      id: "q-ml-2",
      module: "ml-overview",
      type: "mcq",
      prompt: "分類問題で再現率を重視しやすい場面として最も自然なものはどれですか。",
      options: ["重要な陽性例の見逃しを減らしたい", "予測の計算時間だけを最小化したい", "クラスタ数を自動で決めたい", "訓練データを完全に暗記したい"],
      answer: "重要な陽性例の見逃しを減らしたい",
      explanation: "再現率は実際の陽性をどれだけ拾えたかを表します。"
    },
    {
      id: "q-dl-1",
      module: "dl-overview",
      type: "mcq",
      prompt: "ニューラルネットワークの学習で、損失を小さくする方向に重みを更新する代表的な考え方はどれですか。",
      options: ["勾配降下法", "ランダムサンプリングのみ", "ハッシュ化", "正規表現"],
      answer: "勾配降下法",
      explanation: "損失関数の勾配を利用して、重みを少しずつ更新します。"
    },
    {
      id: "q-elements-1",
      module: "dl-elements",
      type: "mcq",
      prompt: "Attention機構が主に表現しようとするものはどれですか。",
      options: ["入力要素どうしの関連の強さ", "画像の明るさだけ", "データベースの索引", "OSのメモリ使用量"],
      answer: "入力要素どうしの関連の強さ",
      explanation: "Attentionは、どの入力要素に注目するかを重みとして扱います。"
    },
    {
      id: "q-math-1",
      module: "math-stats",
      type: "numeric",
      prompt: "値 2, 4, 6, 8 の平均はいくつですか。",
      answer: 5,
      tolerance: 0,
      explanation: "合計20を4個で割るので、平均は5です。"
    },
    {
      id: "q-law-1",
      module: "law-contract",
      type: "mcq",
      prompt: "AIサービスで個人を識別できる情報を扱う場合、まず確認すべき論点として最も近いものはどれですか。",
      options: ["個人情報の取得目的と利用範囲", "GPUの型番だけ", "CSSの配色", "検索順位"],
      answer: "個人情報の取得目的と利用範囲",
      explanation: "個人情報を扱う場合は、目的、同意、管理、第三者提供などの確認が必要です。"
    },
    {
      id: "q-ethics-1",
      module: "ethics-governance",
      type: "mcq",
      prompt: "AIガバナンスで、モデルの判断理由や限界を説明できるようにする観点に最も近いものはどれですか。",
      options: ["透明性", "暗号化のみ", "画面解像度", "圧縮率"],
      answer: "透明性",
      explanation: "透明性は、AIの挙動や意思決定の説明可能性と深く関係します。"
    },
    {
      id: "q-history-1",
      module: "ai-history",
      type: "mcq",
      prompt: "エキスパートシステムと関係が深い考え方はどれですか。",
      options: ["専門家の知識をルールとして表現する", "画像を必ず3D化する", "全データを削除する", "乱数だけで回答する"],
      answer: "専門家の知識をルールとして表現する",
      explanation: "エキスパートシステムは、専門家の知識や推論規則を用いるシステムです。"
    }
  ];

  const glossary = [
    { term: "過学習", body: "訓練データに適合しすぎて、未知データへの性能が下がる状態。" },
    { term: "汎化", body: "学習していないデータに対しても適切に予測できる性質。" },
    { term: "混同行列", body: "分類結果を真陽性、偽陽性、真陰性、偽陰性で整理する表。" },
    { term: "適合率", body: "陽性と予測した中で、本当に陽性だった割合。" },
    { term: "再現率", body: "本当の陽性の中で、陽性として予測できた割合。" },
    { term: "Attention", body: "入力要素間の関連度を重みとして扱い、重要な情報に注目する仕組み。" },
    { term: "正則化", body: "モデルが複雑になりすぎることを抑え、過学習を防ぐための工夫。" },
    { term: "勾配降下法", body: "損失関数を小さくする方向へ、パラメータを反復的に更新する方法。" },
    { term: "個人情報保護法", body: "個人情報の適正な取り扱いに関する日本の法律。" },
    { term: "AIガバナンス", body: "AIを安全・公平・透明に活用するための組織的な管理と意思決定。" }
  ];

  window.GKEN_DATA = {
    modules,
    questionBank,
    glossary
  };
})();
