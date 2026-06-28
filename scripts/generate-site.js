const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const chapters = [
  {
    slug: "ai-basics",
    title: "人工知能とは",
    summary: "AIの定義、知能観、古典的な論点を整理し、以後の章の土台を作る。",
    lessons: [
      lesson("ai-definition", "人工知能の定義", ["人工知能", "知能", "推論", "学習"], "AIという言葉は一枚岩ではない。定義の幅を把握し、問題設定に応じた説明ができるようにする。", "bars"),
      lesson("strong-weak-ai", "強いAIと弱いAI", ["強いAI", "弱いAI", "汎用AI", "特化型AI"], "人間のように理解するAIと、特定タスクを解くAIを区別し、G検定で問われる立場の違いを押さえる。", "matrix"),
      lesson("symbol-grounding", "記号接地問題", ["記号接地問題", "意味理解", "シンボル", "身体性"], "記号だけを操作しても意味を理解したことになるのか、というAIの根本論点を学ぶ。", "flow", ["入力", "記号化", "対応づけ", "意味", "判断"]),
      lesson("frame-problem", "フレーム問題", ["フレーム問題", "探索範囲", "常識", "関連性"], "現実世界では考慮すべき条件が膨大になる。何を無視し、何を考えるかという難しさを理解する。", "flow", ["状況", "候補条件", "関連判定", "推論", "行動"]),
      lesson("turing-test", "チューリングテスト", ["チューリングテスト", "対話", "知能判定", "模倣ゲーム"], "外から観察される振る舞いによって知能を判定する考え方と、その限界を学ぶ。", "bars"),
      lesson("eliza-and-dialogue", "ELIZAと対話システム", ["ELIZA", "対話システム", "ルールベース", "自然言語"], "初期の対話システムから、現在の言語モデルへつながる発想の違いを整理する。", "flow", ["入力文", "パターン照合", "応答生成", "対話継続"])
    ]
  },
  {
    slug: "ai-history",
    title: "人工知能をめぐる動向",
    summary: "探索・推論・知識表現から機械学習、ディープラーニングまでの流れをつかむ。",
    lessons: [
      lesson("ai-booms", "AIブームの変遷", ["第1次AIブーム", "第2次AIブーム", "第3次AIブーム", "冬の時代"], "AIの発展は期待と限界の反復で進んできた。ブームごとの中心技術と失速要因を比較する。", "flow", ["探索推論", "知識表現", "機械学習", "深層学習", "生成AI"]),
      lesson("search", "探索", ["探索木", "幅優先探索", "深さ優先探索", "ヒューリスティック"], "問題空間をどの順序で調べるかという探索の基本を、ルート選択として理解する。", "flow", ["初期状態", "候補展開", "評価", "選択", "ゴール"]),
      lesson("reasoning", "推論", ["推論", "演繹", "帰納", "アブダクション"], "既知の情報から結論を導く方法を整理し、機械学習との違いも見えるようにする。", "matrix"),
      lesson("knowledge-representation", "知識表現", ["知識表現", "オントロジー", "意味ネットワーク", "ルール"], "AIに知識を扱わせるための表現方法を比較し、メリットと限界を押さえる。", "matrix"),
      lesson("expert-system", "エキスパートシステム", ["エキスパートシステム", "知識ベース", "推論エンジン", "MYCIN"], "専門家の知識をルールとして実装する発想と、保守の難しさを学ぶ。", "flow", ["知識獲得", "ルール化", "推論", "説明", "更新"]),
      lesson("machine-learning-rise", "機械学習の台頭", ["機械学習", "データ駆動", "特徴量", "統計的学習"], "知識を手で書くのではなく、データからパターンを学ぶ転換を理解する。", "scatter"),
      lesson("deep-learning-rise", "ディープラーニングの発展", ["ディープラーニング", "GPU", "ビッグデータ", "表現学習"], "多層ネットワークが再び注目された理由を、計算資源・データ・手法の観点で整理する。", "bars")
    ]
  },
  {
    slug: "ml-overview",
    title: "機械学習の概要",
    summary: "教師あり・教師なし・強化学習、評価指標、過学習を操作しながら学ぶ。",
    lessons: [
      lesson("supervised-learning", "教師あり学習", ["教師あり学習", "ラベル", "訓練データ", "予測"], "正解付きデータから入力と出力の対応を学ぶ仕組みを理解する。", "scatter"),
      lesson("regression", "回帰", ["回帰", "目的変数", "説明変数", "残差"], "連続値を予測する課題を、回帰直線と残差で直感的に学ぶ。", "scatter"),
      lesson("classification", "分類", ["分類", "決定境界", "クラス", "しきい値"], "カテゴリを予測する課題で、境界の動かし方が誤分類に与える影響を見る。", "boundary"),
      lesson("unsupervised-learning", "教師なし学習", ["教師なし学習", "クラスタリング", "次元削減", "潜在構造"], "正解ラベルなしでデータの構造を探す考え方を学ぶ。", "scatter"),
      lesson("clustering", "クラスタリング", ["クラスタリング", "k-means", "クラスタ中心", "距離"], "近いデータをまとめる方法を、中心点と距離の関係で理解する。", "scatter"),
      lesson("reinforcement-learning", "強化学習", ["強化学習", "エージェント", "環境", "報酬"], "行動と報酬の関係から方策を改善する考え方を学ぶ。", "flow", ["状態", "行動", "報酬", "更新", "方策"]),
      lesson("train-test-split", "訓練データとテストデータ", ["訓練データ", "テストデータ", "検証データ", "汎化"], "学習に使ったデータだけで性能を見る危うさを理解する。", "bars"),
      lesson("overfitting", "過学習と汎化", ["過学習", "汎化", "バイアス", "バリアンス"], "複雑なモデルが訓練データに寄りすぎる様子を可視化する。", "scatter"),
      lesson("evaluation-metrics", "評価指標", ["正解率", "適合率", "再現率", "F値"], "分類性能を複数の指標で読み分ける。", "boundary"),
      lesson("confusion-matrix", "混同行列", ["真陽性", "偽陽性", "真陰性", "偽陰性"], "予測の当たり外れを4区分で整理し、指標の意味につなげる。", "matrix")
    ]
  },
  {
    slug: "dl-overview",
    title: "ディープラーニングの概要",
    summary: "ニューラルネットワークの構造、損失、最適化、正則化を学ぶ。",
    lessons: [
      lesson("neural-network", "ニューラルネットワーク", ["入力層", "隠れ層", "出力層", "重み"], "層とユニットのつながりを見ながら、ニューラルネットワークの計算の流れを学ぶ。", "network"),
      lesson("perceptron", "パーセプトロン", ["パーセプトロン", "線形分離", "重み", "バイアス"], "単純な分類器としてのパーセプトロンを、境界線で理解する。", "boundary"),
      lesson("activation-functions", "活性化関数", ["ReLU", "Sigmoid", "Tanh", "非線形性"], "活性化関数が非線形な表現を可能にする理由を整理する。", "bars"),
      lesson("loss-functions", "損失関数", ["損失関数", "平均二乗誤差", "交差エントロピー", "目的関数"], "予測の悪さを数値化し、学習の方向づけに使う考え方を学ぶ。", "scatter"),
      lesson("backpropagation", "誤差逆伝播法", ["誤差逆伝播法", "勾配", "連鎖律", "重み更新"], "出力側の誤差を前の層へ伝え、重みを更新する流れを追う。", "flow", ["予測", "損失計算", "勾配計算", "逆伝播", "更新"]),
      lesson("gradient-descent", "勾配降下法", ["勾配降下法", "学習率", "局所解", "収束"], "学習率を変えると最適化が安定するかどうかを観察する。", "scatter"),
      lesson("optimizers", "最適化手法", ["SGD", "Momentum", "Adam", "RMSprop"], "代表的なoptimizerの違いを、更新の安定性と速度の観点で比較する。", "bars"),
      lesson("regularization", "正則化", ["正則化", "L1", "L2", "Dropout"], "過学習を抑えるための工夫を比較し、どの場面で効くかを考える。", "matrix"),
      lesson("batch-normalization", "バッチ正規化", ["バッチ正規化", "内部共変量シフト", "平均", "分散"], "層の入力分布を整えることで学習を安定させる考え方を学ぶ。", "distribution")
    ]
  },
  {
    slug: "dl-elements",
    title: "ディープラーニングの要素技術",
    summary: "CNN、RNN、Attention、データ拡張など主要な構成要素を学ぶ。",
    lessons: [
      lesson("fully-connected", "全結合層", ["全結合層", "重み行列", "特徴結合", "パラメータ"], "すべての入力と出力を結ぶ層の役割とパラメータ数を理解する。", "network"),
      lesson("convolution", "畳み込み層", ["畳み込み層", "カーネル", "フィルタ", "受容野"], "局所的な特徴を抽出するCNNの基本を、フィルタの動きとして捉える。", "matrix"),
      lesson("pooling", "プーリング層", ["プーリング", "Max Pooling", "Average Pooling", "位置ずれ"], "特徴マップを圧縮し、位置ずれに強くする働きを学ぶ。", "matrix"),
      lesson("normalization-layer", "正規化層", ["正規化", "BatchNorm", "LayerNorm", "安定化"], "値のスケールを整えることが学習安定性に与える影響を理解する。", "distribution"),
      lesson("skip-connection", "スキップ結合", ["スキップ結合", "ResNet", "勾配消失", "残差学習"], "深いネットワークで情報を飛び越して伝える利点を学ぶ。", "flow", ["入力", "畳み込み", "残差", "加算", "出力"]),
      lesson("rnn", "回帰結合層とRNN", ["RNN", "LSTM", "GRU", "系列データ"], "時系列や文章のような順序を持つデータを扱う発想を学ぶ。", "flow", ["時刻1", "隠れ状態", "時刻2", "更新", "出力"]),
      lesson("attention", "Attention", ["Attention", "Query", "Key", "Value", "重み"], "入力要素間の関連度を重みとして扱う仕組みをヒートマップで理解する。", "attention"),
      lesson("transformer", "Transformer", ["Transformer", "Self-Attention", "Multi-Head Attention", "位置エンコーディング"], "現在の言語モデルの中核であるTransformerの部品を整理する。", "attention"),
      lesson("autoencoder", "オートエンコーダ", ["オートエンコーダ", "エンコーダ", "デコーダ", "潜在表現"], "入力を圧縮し復元することで表現を学ぶ仕組みを理解する。", "flow", ["入力", "圧縮", "潜在表現", "復元", "誤差"]),
      lesson("data-augmentation", "データ拡張", ["データ拡張", "反転", "回転", "ノイズ"], "訓練データを変形して汎化性能を高める考え方を学ぶ。", "bars"),
      lesson("foundation-models", "基盤モデルと言語モデル", ["基盤モデル", "大規模言語モデル", "事前学習", "ファインチューニング"], "生成AI時代の重要項目として、基盤モデルの学習と利用の流れを押さえる。", "flow", ["大規模データ", "事前学習", "適応", "推論", "評価"])
    ]
  },
  {
    slug: "applications",
    title: "ディープラーニングの応用例",
    summary: "画像、自然言語、音声、生成、マルチモーダルなど応用分野を横断する。",
    lessons: [
      lesson("image-classification", "画像認識", ["画像分類", "物体検出", "セグメンテーション", "CNN"], "画像タスクの種類を区別し、どの出力が必要かを整理する。", "matrix"),
      lesson("object-detection", "物体検出", ["物体検出", "バウンディングボックス", "IoU", "検出精度"], "画像のどこに何があるかを予測するタスクを学ぶ。", "bars"),
      lesson("natural-language-processing", "自然言語処理", ["形態素解析", "埋め込み", "言語モデル", "翻訳"], "テキストを数値として扱い、意味や文脈を処理する流れを理解する。", "flow", ["テキスト", "トークン化", "埋め込み", "文脈化", "出力"]),
      lesson("speech-processing", "音声処理", ["音声認識", "音声合成", "スペクトログラム", "波形"], "音声を時間変化する信号として扱う考え方を学ぶ。", "distribution"),
      lesson("deep-rl", "深層強化学習", ["深層強化学習", "DQN", "方策勾配", "報酬設計"], "深層学習と強化学習を組み合わせると何ができるかを学ぶ。", "flow", ["観測", "行動選択", "報酬", "経験蓄積", "更新"]),
      lesson("generative-models", "生成モデル", ["生成モデル", "GAN", "VAE", "拡散モデル"], "データを分類するだけでなく、新しいデータを生成するモデルを比較する。", "matrix"),
      lesson("transfer-learning", "転移学習", ["転移学習", "ファインチューニング", "特徴抽出", "事前学習済みモデル"], "既存モデルを新しいタスクに適応する実務上の利点を学ぶ。", "flow", ["事前学習", "重み利用", "追加学習", "評価"]),
      lesson("multimodal", "マルチモーダル", ["マルチモーダル", "画像と言語", "音声と言語", "クロスモーダル"], "複数種類のデータを組み合わせて扱うAIの設計を理解する。", "matrix"),
      lesson("explainability", "モデルの解釈性", ["解釈性", "説明可能AI", "特徴量重要度", "可視化"], "モデルがなぜそう判断したかを説明する必要性を学ぶ。", "bars"),
      lesson("model-compression", "モデルの軽量化", ["蒸留", "量子化", "枝刈り", "エッジAI"], "大きなモデルを実運用に載せるための軽量化手法を比較する。", "bars")
    ]
  },
  {
    slug: "implementation",
    title: "AIの社会実装に向けて",
    summary: "AIプロジェクト、データ、評価、運用までの実装プロセスを学ぶ。",
    lessons: [
      lesson("project-flow", "AIプロジェクトの進め方", ["課題設定", "PoC", "評価", "運用"], "AI導入を技術だけでなく、目的・評価・運用の流れとして理解する。", "flow", ["課題設定", "データ確認", "PoC", "本番化", "運用改善"]),
      lesson("business-goal", "目的設定とKPI", ["目的設定", "KPI", "成功基準", "費用対効果"], "AIで何を改善するのかを測れる形に落とし込む。", "bars"),
      lesson("data-collection", "データ収集", ["データ収集", "サンプリング", "偏り", "同意"], "データ量だけでなく、質・偏り・利用条件を見る。", "distribution"),
      lesson("data-preprocessing", "データ加工", ["前処理", "欠損値", "外れ値", "正規化"], "学習前にデータを整える処理の意味を学ぶ。", "matrix"),
      lesson("annotation", "アノテーション", ["アノテーション", "ラベル品質", "一致率", "教師データ"], "教師あり学習の品質を左右するラベル付けを理解する。", "bars"),
      lesson("model-monitoring", "運用監視", ["モデル監視", "ドリフト", "再学習", "性能劣化"], "運用後にモデル性能が変化する理由と監視の必要性を学ぶ。", "flow", ["予測", "ログ", "性能確認", "ドリフト検知", "再学習"]),
      lesson("human-in-the-loop", "Human-in-the-loop", ["人間参加型AI", "レビュー", "例外処理", "責任分界"], "人がどこで判断に関与するべきかを設計する。", "flow", ["AI予測", "信頼度判定", "人の確認", "最終判断"]),
      lesson("risk-management", "リスク管理", ["リスク", "影響度", "発生確率", "対策"], "AI導入時の失敗や事故を、事前に見積もり対策する。", "matrix")
    ]
  },
  {
    slug: "math-stats",
    title: "AIに必要な数理・統計知識",
    summary: "平均、分散、相関、確率、評価指標などを直感的に学ぶ。",
    lessons: [
      lesson("mean-variance", "平均と分散", ["平均", "分散", "標準偏差", "ばらつき"], "代表値と散らばりを同時に見て、データの形を読む。", "distribution"),
      lesson("correlation", "相関", ["相関", "正の相関", "負の相関", "因果"], "2つの変数の関係を散布図で読み、因果との違いを押さえる。", "scatter"),
      lesson("probability", "確率", ["確率", "条件付き確率", "事象", "独立"], "不確実な出来事を数値で扱う基礎を学ぶ。", "bars"),
      lesson("bayes", "ベイズの考え方", ["ベイズ", "事前確率", "尤度", "事後確率"], "新しい証拠で判断を更新する流れを理解する。", "flow", ["事前知識", "観測", "尤度", "更新", "事後確率"]),
      lesson("linear-algebra", "線形代数の直感", ["ベクトル", "行列", "内積", "変換"], "データをベクトルや行列として扱う意味を図でつかむ。", "matrix"),
      lesson("distance", "距離と類似度", ["ユークリッド距離", "コサイン類似度", "近傍", "埋め込み"], "近い・似ているを数値化する方法を比較する。", "scatter"),
      lesson("metrics-math", "評価指標の数理", ["正解率", "適合率", "再現率", "F値"], "混同行列から評価指標が計算される関係を学ぶ。", "boundary"),
      lesson("sampling", "サンプリングと偏り", ["サンプリング", "標本", "母集団", "バイアス"], "標本の取り方が分析結果に与える影響を理解する。", "distribution")
    ]
  },
  {
    slug: "law-contract",
    title: "AIに関する法律と契約",
    summary: "個人情報、著作権、特許、不正競争、契約をケースで整理する。",
    lessons: [
      lesson("personal-information", "個人情報保護法", ["個人情報", "利用目的", "第三者提供", "安全管理措置"], "AIで個人に関するデータを扱うときの基本確認事項を整理する。", "flow", ["取得", "利用目的", "管理", "提供", "削除"]),
      lesson("copyright", "著作権法", ["著作権", "学習データ", "生成物", "権利制限"], "学習・生成・利用の各段階で著作権の論点が変わることを学ぶ。", "matrix"),
      lesson("patent", "特許法", ["特許", "発明", "発明者", "実施"], "AI関連発明で、技術的思想や権利化の観点を整理する。", "flow", ["アイデア", "技術化", "出願", "審査", "権利化"]),
      lesson("unfair-competition", "不正競争防止法", ["営業秘密", "限定提供データ", "不正取得", "秘密管理"], "データやノウハウの保護に関する論点を学ぶ。", "matrix"),
      lesson("antitrust", "独占禁止法", ["独占禁止法", "競争", "アルゴリズム", "優越的地位"], "AIやデータ利用が競争環境へ与える影響を考える。", "bars"),
      lesson("development-contract", "AI開発委託契約", ["開発委託", "成果物", "責任範囲", "知的財産"], "AI開発では結果保証が難しいため、契約で何を決めるかを学ぶ。", "flow", ["目的", "データ", "成果物", "検収", "責任"]),
      lesson("service-contract", "AIサービス提供契約", ["SaaS", "利用規約", "SLA", "データ利用"], "AIサービスを使う側・提供する側の確認ポイントを整理する。", "matrix"),
      lesson("legal-checklist", "法務チェックリスト", ["チェックリスト", "リスク評価", "証跡", "更新確認"], "法律分野を暗記ではなく、確認手順として使えるようにする。", "flow", ["データ", "権利", "契約", "説明", "記録"])
    ]
  },
  {
    slug: "ethics-governance",
    title: "AI倫理・AIガバナンス",
    summary: "公平性、透明性、安全性、悪用防止、ガバナンスを実務ケースで学ぶ。",
    lessons: [
      lesson("ai-guidelines", "国内外のガイドライン", ["AIガイドライン", "原則", "リスクベース", "説明責任"], "AI倫理を個人の善意ではなく、原則と運用ルールとして理解する。", "flow", ["原則", "リスク分類", "対策", "監査", "改善"]),
      lesson("privacy", "プライバシー", ["プライバシー", "匿名化", "同意", "目的外利用"], "個人情報だけでなく、私生活上の利益を守る視点を学ぶ。", "matrix"),
      lesson("fairness", "公平性", ["公平性", "バイアス", "差別", "属性"], "データやモデルが特定集団に不利な結果を出すリスクを学ぶ。", "boundary"),
      lesson("safety-security", "安全性とセキュリティ", ["安全性", "セキュリティ", "堅牢性", "攻撃"], "AIシステムが誤作動や攻撃に耐えるための観点を整理する。", "matrix"),
      lesson("misuse", "悪用への対策", ["悪用", "ディープフェイク", "なりすまし", "濫用防止"], "便利なAIが不正利用される場面と対策を学ぶ。", "bars"),
      lesson("transparency", "透明性", ["透明性", "説明可能性", "開示", "限界説明"], "AIの判断や制約を利用者にどう伝えるかを考える。", "flow", ["入力", "判断", "理由", "限界", "説明"]),
      lesson("democracy", "民主主義と情報環境", ["民主主義", "偽情報", "フィルターバブル", "世論操作"], "生成AIが情報環境や意思決定へ与える影響を学ぶ。", "matrix"),
      lesson("environment", "環境負荷", ["環境負荷", "計算資源", "電力", "効率化"], "大規模AIの学習・推論に必要な資源と環境配慮を理解する。", "bars"),
      lesson("labor", "労働とリスキリング", ["労働政策", "自動化", "リスキリング", "人材育成"], "AI導入が仕事や学習に与える影響を整理する。", "flow", ["業務変化", "影響評価", "教育", "再配置", "改善"]),
      lesson("governance", "AIガバナンス", ["AIガバナンス", "責任体制", "監査", "継続改善"], "組織としてAIを安全に使い続けるための仕組みを学ぶ。", "flow", ["方針", "体制", "審査", "監視", "改善"])
    ]
  }
];

function lesson(slug, title, terms, focus, visualType, steps) {
  return {
    slug,
    title,
    terms,
    focus,
    visual: {
      type: visualType,
      steps,
      axis: "比較と関係"
    }
  };
}

function ensureDir(dir) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

function writeFile(file, content) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function json(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function rel(depth, target) {
  return `${"../".repeat(depth)}${target}`;
}

function layout({ depth, title, description, body, extraScript = "" }) {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${esc(description)}">
  <title>${esc(title)} | G検定インタラクティブ学習サイト</title>
  <link rel="stylesheet" href="${rel(depth, "assets/css/styles.css")}">
</head>
<body>
  <a class="skip-link" href="#main">本文へ移動</a>
  <header class="app-header compact-header">
    <div class="brand-block">
      <p class="eyebrow">G検定 Interactive Syllabus</p>
      <h1>${esc(title)}</h1>
      <p class="lead">${esc(description)}</p>
    </div>
    <div class="header-actions">
      <button class="icon-button" type="button" id="themeToggle" aria-label="ライトテーマとダークテーマを切り替え">◐</button>
      <a class="text-button" href="${rel(depth, "index.html")}">トップ</a>
    </div>
  </header>
  <nav class="top-nav" aria-label="主要ナビゲーション">
    <a href="${rel(depth, "index.html")}">学習マップ</a>
    <a href="${rel(depth, "glossary/index.html")}">用語集</a>
    <a href="${rel(depth, "review/index.html")}">横断復習</a>
    <a href="${rel(depth, "sources/index.html")}">参照資料</a>
  </nav>
  <main id="main">
${body}
  </main>
  <footer class="app-footer">
    <p>公式資料の代替ではなく、G検定学習を補助する独自教材です。</p>
  </footer>
${extraScript}
</body>
</html>
`;
}

function lessonPage(chapter, item, index) {
  const flat = allLessons();
  const currentIndex = flat.findIndex((entry) => entry.chapter.slug === chapter.slug && entry.lesson.slug === item.slug);
  const prev = flat[currentIndex - 1];
  const next = flat[currentIndex + 1];
  const data = {
    slug: `${chapter.slug}/${item.slug}`,
    title: item.title,
    terms: item.terms,
    visual: item.visual,
    quiz: quizFor(item)
  };
  const body = `    <section class="lesson-shell">
      <div class="breadcrumb"><a href="../../index.html">トップ</a> / <a href="./index.html">${esc(chapter.title)}</a> / ${esc(item.title)}</div>
      <div class="lesson-layout">
        <article class="lesson-main">
          <p class="section-kicker">Lesson ${String(index + 1).padStart(2, "0")}</p>
          <h2>${esc(item.title)}</h2>
          <p>${esc(item.focus)}</p>
          <div class="tag-list">${item.terms.map((term) => `<span class="tag">${esc(term)}</span>`).join("")}</div>

          <section class="lesson-section">
            <h3>学習目標</h3>
            <ul class="plain-list">
              <li>${esc(item.terms[0])}を、試験問題の文脈で説明できる。</li>
              <li>${esc(item.terms.slice(1).join("、"))}との関係を区別できる。</li>
              <li>図表を操作して、概念の変化やトレードオフを読み取れる。</li>
            </ul>
          </section>

          <section class="lesson-section">
            <h3>本文解説</h3>
            <p>${esc(item.focus)}</p>
            <p>G検定では、用語の暗記だけでなく、どの場面でその考え方を使うのかが問われます。このページでは <strong>${esc(item.terms.join("、"))}</strong> を一つの学習単位として扱い、定義、関係、判断の観点をまとめます。</p>
            <p>まず用語の境界を押さえ、次に図表を操作して結果がどう変わるかを観察してください。操作によって値や形が変わる部分が、そのテーマで理解すべき中心です。</p>
          </section>

          <section class="lesson-section visual-lesson" aria-labelledby="visualTitle">
            <h3 id="visualTitle">インタラクティブ図表</h3>
            <div class="visual-workbench lesson-workbench">
              <div class="control-panel" id="lessonControls"></div>
              <div class="visual-output">
                <canvas id="lessonCanvas" width="900" height="500" role="img" aria-label="${esc(item.title)}のインタラクティブ図表"></canvas>
                <div id="lessonSvg" class="svg-visual" aria-label="${esc(item.title)}の構造図"></div>
                <div class="visual-metrics lesson-metrics" id="lessonMetrics" aria-live="polite"></div>
              </div>
            </div>
          </section>

          <section class="lesson-section">
            <h3>確認問題</h3>
            <div class="quiz-area lesson-quiz">
              ${quizFor(item).map((q, qIndex) => `<article class="quiz-card"><h4>Q${qIndex + 1}. ${esc(q.prompt)}</h4><fieldset>${q.options.map((option) => `<label class="quiz-option"><input type="radio" name="${q.id}" value="${esc(option)}"><span>${esc(option)}</span></label>`).join("")}</fieldset></article>`).join("")}
            </div>
            <div class="quiz-actions">
              <button class="primary-button" type="button" id="gradeLessonQuiz">採点する</button>
              <button class="ghost-button" type="button" id="completeLesson">このページを完了</button>
            </div>
            <p class="quiz-result" id="lessonQuizResult" aria-live="polite"></p>
            <p class="progress-state">進捗: <strong id="lessonProgressState">未完了</strong></p>
          </section>
        </article>

        <aside class="lesson-side">
          <h3>このページの用語</h3>
          <ol>
            ${item.terms.map((term) => `<li>${esc(term)}</li>`).join("")}
          </ol>
          <h3>前後の学習</h3>
          <p>${prev ? `<a href="../../chapters/${prev.chapter.slug}/${prev.lesson.slug}.html">前: ${esc(prev.lesson.title)}</a>` : "前のページはありません。"}</p>
          <p>${next ? `<a href="../../chapters/${next.chapter.slug}/${next.lesson.slug}.html">次: ${esc(next.lesson.title)}</a>` : "次のページはありません。"}</p>
        </aside>
      </div>
    </section>
    <script type="application/json" id="lessonData">${json(data)}</script>`;
  return layout({
    depth: 2,
    title: item.title,
    description: item.focus,
    body,
    extraScript: `  <script src="../../assets/js/lesson.js" defer></script>`
  });
}

function quizFor(item) {
  const [a, b, c] = item.terms;
  return [
    {
      id: `${item.slug}-q1`,
      prompt: `${a}を学ぶとき、最も重要な見方はどれですか。`,
      options: [`${a}の定義と使う場面を区別する`, "用語を英字順に暗記する", "図表を見ずに数値だけを覚える", "関連語をすべて同じ意味として扱う"],
      answer: `${a}の定義と使う場面を区別する`
    },
    {
      id: `${item.slug}-q2`,
      prompt: `${b || a}と${c || a}の関係を理解するために有効な学習はどれですか。`,
      options: ["操作できる図表で変化を見る", "公式資料を転載する", "ページタイトルだけ読む", "選択肢をランダムに選ぶ"],
      answer: "操作できる図表で変化を見る"
    }
  ];
}

function chapterIndex(chapter) {
  const body = `    <section class="layout chapter-index">
      <div class="section-heading">
        <p class="section-kicker">Chapter</p>
        <h2>${esc(chapter.title)}</h2>
        <p>${esc(chapter.summary)}</p>
      </div>
      <div class="lesson-grid">
        ${chapter.lessons.map((item, index) => `<a class="lesson-card" href="./${item.slug}.html"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(item.title)}</h3><p>${esc(item.focus)}</p><div class="tag-list">${item.terms.slice(0, 3).map((term) => `<em>${esc(term)}</em>`).join("")}</div></a>`).join("")}
      </div>
    </section>`;
  return layout({ depth: 2, title: chapter.title, description: chapter.summary, body });
}

function homePage() {
  const totalLessons = chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  const body = `    <section class="dashboard-band">
      <div>
        <p class="section-kicker">Full syllabus build</p>
        <h2>用語・内容単位で学ぶG検定教材</h2>
        <p>トップページだけで終わらせず、シラバスの重要項目を独立ページ化しました。各ページには本文、用語、操作できる図表、確認問題があります。</p>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>${chapters.length}</span><small>章</small></div>
        <div class="metric"><span>${totalLessons}</span><small>学習ページ</small></div>
        <div class="metric"><span>全</span><small>ページ図表つき</small></div>
      </div>
    </section>
    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Syllabus map</p>
        <h2>章別学習マップ</h2>
        <p>章を選び、用語・内容単位のページへ進んでください。</p>
      </div>
      <div class="module-grid">
        ${chapters.map((chapter) => `<a class="module-card module-link" href="./chapters/${chapter.slug}/index.html"><h3>${esc(chapter.title)}</h3><p>${esc(chapter.summary)}</p><div class="module-meta"><span>${chapter.lessons.length}ページ</span><span>図表・小テスト</span></div></a>`).join("")}
      </div>
    </section>
    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Interactive coverage</p>
        <h2>図表の種類</h2>
        <p>分布、散布図、分類境界、ネットワーク、Attention、フロー、マトリクス、比較チャートを学習内容に応じて使い分けます。</p>
      </div>
      <div class="source-grid">
        <article><h3>数理・統計</h3><p>平均、分散、相関、評価指標は操作できるグラフで学びます。</p></article>
        <article><h3>技術構造</h3><p>ニューラルネットワーク、CNN、Attentionは構造図で関係を見ます。</p></article>
        <article><h3>法律・倫理</h3><p>判断フローとリスクマトリクスで確認手順として学びます。</p></article>
      </div>
    </section>`;
  return layout({
    depth: 0,
    title: "G検定インタラクティブ学習サイト",
    description: "シラバスの重要用語と内容単位で学べる多ページ静的HTML教材。",
    body,
    extraScript: `  <script>document.getElementById("themeToggle")?.addEventListener("click",()=>{const n=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=n;localStorage.setItem("gken-theme",n)});const s=localStorage.getItem("gken-theme");if(s)document.documentElement.dataset.theme=s;</script>`
  });
}

function glossaryPage() {
  const terms = allLessons().flatMap(({ chapter, lesson }) => lesson.terms.map((term) => ({ term, chapter: chapter.title, title: lesson.title, href: `../chapters/${chapter.slug}/${lesson.slug}.html` })));
  const seen = new Set();
  const unique = terms.filter((item) => {
    if (seen.has(item.term)) return false;
    seen.add(item.term);
    return true;
  }).sort((a, b) => a.term.localeCompare(b.term, "ja"));
  const body = `    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Glossary</p>
        <h2>用語集</h2>
        <p>${unique.length}語を、該当する学習ページへリンクします。</p>
      </div>
      <div class="glossary-list">${unique.map((item) => `<article><h3>${esc(item.term)}</h3><p>${esc(item.chapter)} / ${esc(item.title)}</p><a href="${item.href}">学習ページへ</a></article>`).join("")}</div>
    </section>`;
  return layout({ depth: 1, title: "用語集", description: "G検定の重要用語から学習ページへ移動できます。", body });
}

function reviewPage() {
  const body = `    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Review</p>
        <h2>横断復習</h2>
        <p>章をまたいで、用語の対応関係と弱点を確認します。</p>
      </div>
      <div class="lesson-grid">
        ${chapters.map((chapter) => `<a class="lesson-card" href="../chapters/${chapter.slug}/index.html"><h3>${esc(chapter.title)}</h3><p>${esc(chapter.lessons.slice(0, 3).map((l) => l.title).join(" / "))} などを復習します。</p><span>${chapter.lessons.length}ページ</span></a>`).join("")}
      </div>
    </section>`;
  return layout({ depth: 1, title: "横断復習", description: "全章の復習導線です。", body });
}

function sourcesPage() {
  const body = `    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Sources</p>
        <h2>参照資料と方針</h2>
        <p>公式資料の丸写しではなく、シラバス項目に沿って独自教材として再構成しています。</p>
      </div>
      <div class="source-grid">
        <article><h3>JDLA公式 G検定とは</h3><p>試験範囲、受験概要、シラバスへの導線を確認します。</p><a href="https://www.jdla.org/certificate/general/" target="_blank" rel="noopener">公式ページ</a></article>
        <article><h3>シラバスG2024#6</h3><p>現在の学習項目の基準として扱います。更新時は教材ページも見直します。</p></article>
        <article><h3>法律・倫理</h3><p>官公庁の一次資料を優先し、制度改訂のたびに確認します。</p></article>
      </div>
    </section>`;
  return layout({ depth: 1, title: "参照資料", description: "教材作成時の参照元と更新方針です。", body });
}

function allLessons() {
  return chapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({ chapter, lesson })));
}

function generate() {
  ensureDir("chapters");
  chapters.forEach((chapter) => {
    writeFile(`chapters/${chapter.slug}/index.html`, chapterIndex(chapter));
    chapter.lessons.forEach((item, index) => {
      writeFile(`chapters/${chapter.slug}/${item.slug}.html`, lessonPage(chapter, item, index));
    });
  });
  writeFile("index.html", homePage());
  writeFile("glossary/index.html", glossaryPage());
  writeFile("review/index.html", reviewPage());
  writeFile("sources/index.html", sourcesPage());
  writeFile("content/syllabus-map.json", JSON.stringify(chapters, null, 2));
}

generate();
console.log(`Generated ${chapters.length} chapters and ${allLessons().length} lesson pages.`);
