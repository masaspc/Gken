const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const practiceQuestionsPath = path.join(root, "content", "gtest-questions.json");
const practiceQuestions = fs.existsSync(practiceQuestionsPath)
  ? JSON.parse(fs.readFileSync(practiceQuestionsPath, "utf8"))
  : [];
const lessonContentPath = path.join(root, "content", "lesson-content.json");
const lessonContent = fs.existsSync(lessonContentPath)
  ? JSON.parse(fs.readFileSync(lessonContentPath, "utf8"))
  : {};

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
  const authored = lessonContent[slug] || {};
  return {
    slug,
    title,
    terms,
    focus: authored.focus || focus,
    explanation: authored.explanation || [],
    visual: visualFor(slug, title, visualType, authored.visual)
  };
}

function visualFor(slug, title, visualType, authoredVisual) {
  if (authoredVisual) return authoredVisual;
  if (visualType === "distribution") {
    return { type: "distribution", title, concept: "平均・分散・サンプル数" };
  }
  if (visualType === "scatter") {
    if (["regression", "correlation", "overfitting", "machine-learning-rise", "gradient-descent", "loss-functions"].includes(slug)) {
      return { type: "regression", title, concept: "説明変数と目的変数の関係" };
    }
    return { type: "none", reason: "数値散布図より本文で概念の区別を読むテーマ" };
  }
  if (visualType === "boundary") {
    if (["classification", "evaluation-metrics", "metrics-math", "perceptron"].includes(slug)) {
      return { type: "classification", title, concept: "しきい値・決定境界・混同行列" };
    }
    return { type: "none", reason: "分類境界ではなく社会的な判断観点を整理するテーマ" };
  }
  if (visualType === "network") {
    return {
      type: "network",
      title,
      layers: [
        { name: "入力", units: 4 },
        { name: "特徴抽出", units: title.includes("全結合") ? 6 : 5 },
        { name: "出力", units: title.includes("分類") ? 3 : 2 }
      ]
    };
  }
  if (visualType === "attention") {
    return {
      type: "attention",
      title,
      tokens: title.includes("Transformer")
        ? ["私は", "昨日", "読んだ", "本を", "要約する"]
        : ["猫が", "魚を", "静かに", "食べた", "。"]
    };
  }
  if (visualType === "flow") {
    return { type: "none", reason: "手書きの手順データがないため図表を表示しない" };
  }
  if (visualType === "bars") {
    return { type: "none", reason: "比較表の著作データがないため図表を表示しない" };
  }
  if (visualType === "matrix") {
    return { type: "none", reason: "対応表の著作データがないため図表を表示しない" };
  }
  return { type: "none", reason: "このページは本文と確認問題で扱う" };
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
    <a href="${rel(depth, "dashboard/index.html")}">ダッシュボード</a>
    <a href="${rel(depth, "mock/index.html")}">模試</a>
    <a href="${rel(depth, "review/index.html")}">復習</a>
    <a href="${rel(depth, "search/index.html")}">検索</a>
    <a href="${rel(depth, "practice/index.html")}">4択演習</a>
    <a href="${rel(depth, "glossary/index.html")}">用語集</a>
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
  const quiz = quizFor(item, chapter);
  const explanation = explanationFor(item, quiz);
  const visualSection = lessonVisualSection(item);
  const data = {
    slug: `${chapter.slug}/${item.slug}`,
    title: item.title,
    terms: item.terms,
    visual: item.visual,
    quiz
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
              <li>${esc(relatedTerms(item.terms))}との関係を区別できる。</li>
              <li>${esc(visualGoal(item.visual.type))}</li>
            </ul>
          </section>

          <section class="lesson-section">
            <h3>本文解説</h3>
            ${explanation.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
          </section>

${visualSection}

          <section class="lesson-section">
            <h3>確認問題</h3>
            <div class="quiz-area lesson-quiz">
              ${quiz.map((q, qIndex) => `<article class="quiz-card" data-quiz-id="${esc(q.id)}"><h4>Q${qIndex + 1}. ${esc(q.prompt)}</h4><fieldset>${q.options.map((option, optionIndex) => `<label class="quiz-option"><input type="radio" name="${q.id}" value="${esc(option)}"><span class="option-marker">${String.fromCharCode(65 + optionIndex)}</span><span>${esc(option)}</span></label>`).join("")}</fieldset><div class="quiz-feedback" data-feedback-for="${esc(q.id)}" aria-live="polite"></div></article>`).join("")}
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
          <h3>関連する練習問題</h3>
          <p><a href="../../practice/index.html?cat=${encodeURIComponent(chapter.quizCat)}">この章の4択演習を開く</a></p>
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
    extraScript: `  <script src="../../assets/js/visualizations.js" defer></script>
  <script src="../../assets/js/store.js" defer></script>
  <script src="../../assets/js/learning.js" defer></script>
  <script src="../../assets/js/lesson.js" defer></script>`
  });
}

function lessonVisualSection(item) {
  const visual = item.visual || { type: "none" };
  if (!hasVisual(visual)) {
    return `          <section class="lesson-section">
            <h3>このページの整理</h3>
            <p>このテーマは無理に図表化せず、定義・判断条件・確認問題を中心に学習します。</p>
          </section>`;
  }
  if (["comparison-table", "relation-table"].includes(visual.type)) {
    return `          <section class="lesson-section lesson-table-section" aria-labelledby="visualTitle">
            <h3 id="visualTitle">${esc(visual.type === "comparison-table" ? "比較表" : "論点の整理")}</h3>
            ${htmlTable(visual)}
          </section>`;
  }
  if (["flow", "network"].includes(visual.type)) {
    return `          <section class="lesson-section visual-lesson static-visual-section" aria-labelledby="visualTitle">
            <h3 id="visualTitle">${esc(visual.type === "flow" ? "処理の流れ" : "層構造")}</h3>
            <div class="static-figure">
              <canvas id="lessonCanvas" class="figure-canvas-proxy" width="900" height="500" aria-hidden="true"></canvas>
              <div id="lessonSvg" class="svg-visual" aria-label="${esc(item.title)}の構造図"></div>
              <div class="visual-metrics lesson-metrics" id="lessonMetrics" aria-live="polite"></div>
            </div>
          </section>`;
  }
  return `          <section class="lesson-section visual-lesson" aria-labelledby="visualTitle">
            <h3 id="visualTitle">操作して理解する</h3>
            <div class="visual-workbench lesson-workbench">
              <div class="control-panel" id="lessonControls"></div>
              <div class="visual-output">
                <canvas id="lessonCanvas" width="900" height="500" role="img" aria-label="${esc(item.title)}のインタラクティブ図表"></canvas>
                <div id="lessonSvg" class="svg-visual" aria-label="${esc(item.title)}の構造図"></div>
                <div class="visual-metrics lesson-metrics" id="lessonMetrics" aria-live="polite"></div>
              </div>
            </div>
          </section>`;
}

function htmlTable(visual) {
  const columns = visual.columns || [];
  const rows = visual.rows || [];
  return `<div class="lesson-table-wrap">
              <table class="lesson-table">
                <caption>${esc(visual.title || "整理表")}</caption>
                <thead><tr>${columns.map((column) => `<th scope="col">${esc(column)}</th>`).join("")}</tr></thead>
                <tbody>${rows.map((row) => `<tr>${columns.map((column, index) => `<td>${esc(Array.isArray(row) ? row[index] : row[column] || "")}</td>`).join("")}</tr>`).join("")}</tbody>
              </table>
            </div>`;
}

function quizFor(item, chapter) {
  const matches = matchingQuestions(item, chapter).slice(0, 3);
  if (matches.length) {
    return matches.map((q, index) => ({
      id: `${item.slug}-practice-${index}`,
      qid: q.id,
      cat: q.cat,
      q: q.q,
      c: q.c,
      a: q.a,
      e: q.e,
      prompt: q.q,
      options: q.c,
      answer: q.c[q.a],
      explanation: q.e
    }));
  }
  return [{
    id: `${item.slug}-fallback`,
    prompt: `${item.title}について、最も適切な説明はどれですか。`,
    options: [
      item.focus,
      "関連用語をすべて同じ意味として扱う。",
      "数値や図表だけを暗記し、意味は確認しない。",
      "試験範囲とは無関係な一般論として扱う。"
    ],
    answer: item.focus,
    explanation: item.focus
  }];
}

function matchingQuestions(item, chapter) {
  const terms = [item.title, ...item.terms].filter(Boolean);
  const cat = chapterCategory(chapter.title);
  return practiceQuestions
    .map((q) => {
      const haystack = `${q.cat} ${q.q} ${q.c.join(" ")} ${stripHtml(q.e)}`;
      const termScore = terms.reduce((score, term) => score + (haystack.includes(term) ? 3 : 0), 0);
      const catScore = q.cat.includes(cat) ? 1 : 0;
      return { q, score: termScore + catScore };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.q);
}

function explanationFor(item, quiz) {
  if (item.explanation && item.explanation.length >= 2) return item.explanation;
  const paragraphs = [item.focus];
  const useful = quiz
    .map((question) => stripHtml(question.explanation || ""))
    .filter(Boolean)
    .map((text) => shorten(text, 170));
  if (useful[0]) paragraphs.push(`確認問題では、${useful[0]}`);
  if (useful[1]) paragraphs.push(`別の出題では、${useful[1]}`);
  if (paragraphs.length < 2) {
    paragraphs.push(`${item.title}は、用語の定義だけでなく、どの条件で使われるかを問われやすい項目です。`);
  }
  return paragraphs;
}

function chapterCategory(title) {
  if (title.includes("人工知能とは")) return "第1章";
  if (title.includes("動向")) return "第2章";
  if (title.includes("機械学習")) return "第3章";
  if (title.includes("概要") && title.includes("ディープ")) return "第4章";
  if (title.includes("要素技術")) return "第5章";
  if (title.includes("応用")) return "第6章";
  if (title.includes("社会実装")) return "第7章";
  if (title.includes("法律") || title.includes("倫理")) return "第8章";
  if (title.includes("数理")) return "第9章";
  return "";
}

function stripHtml(value) {
  return String(value).replace(/<[^>]*>/g, "");
}

function shorten(value, length) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function chapterIndex(chapter) {
  const body = `    <section class="layout chapter-index">
      <div class="section-heading">
        <p class="section-kicker">Chapter</p>
        <h2>${esc(chapter.title)}</h2>
        <p>${esc(chapter.summary)}</p>
      </div>
      <div class="lesson-grid">
        ${chapter.lessons.map((item, index) => `<a class="lesson-card" href="./${item.slug}.html"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(item.title)}</h3><p>${esc(item.focus)}</p><div class="tag-list">${tagTerms(item.terms).map((term) => `<em>${esc(term)}</em>`).join("")}</div></a>`).join("")}
      </div>
    </section>`;
  return layout({ depth: 2, title: chapter.title, description: chapter.summary, body });
}

function visualGoal(type) {
  if (type === "none") return "本文と確認問題から、定義・判断条件・典型的な出題観点を説明できる。";
  if (["distribution", "regression", "classification", "attention"].includes(type)) {
    return "パラメータを動かし、計算結果・指標・重みの変化を読み取れる。";
  }
  if (type === "network") return "構造図から、層・ユニット・接続の役割を読み取れる。";
  if (type === "flow") return "判断フローから、確認すべき順序と分岐の意味を説明できる。";
  return "対応表から、概念どうしの関係と区別ポイントを説明できる。";
}

function hasVisual(visual) {
  return visual && visual.type && visual.type !== "none";
}

function relatedTerms(terms) {
  return terms.filter((_, index) => index > 0).join("、") || terms[0];
}

function tagTerms(terms) {
  return terms.filter((_, index) => index < 3);
}

function homePage() {
  const totalLessons = chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  const visualLessons = allLessons().filter(({ lesson }) => hasVisual(lesson.visual)).length;
  const body = `    <section class="dashboard-band">
      <div>
        <p class="section-kicker">Full syllabus build</p>
        <h2>用語・内容単位で学ぶG検定教材</h2>
        <p>トップページだけで終わらせず、シラバスの重要項目を独立ページ化しました。図表は有効なテーマに限定し、本文・用語・確認問題と合わせて学びます。</p>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>${chapters.length}</span><small>章</small></div>
        <div class="metric"><span>${totalLessons}</span><small>学習ページ</small></div>
        <div class="metric"><span>${visualLessons}</span><small>図表つきページ</small></div>
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
        <p>分布、回帰、分類境界、ネットワーク、Attention、フロー、比較表、対応表を、学習内容に合う場合だけ使います。</p>
      </div>
      <div class="source-grid">
        <article><h3>数理・統計</h3><p>平均、分散、相関、評価指標は操作できるグラフで学びます。</p></article>
        <article><h3>技術構造</h3><p>ニューラルネットワーク、CNN、Attentionは構造図で関係を見ます。</p></article>
        <article><h3>法律・倫理</h3><p>表やフローが有効な論点だけ可視化し、無理な数値化はしません。</p></article>
      </div>
    </section>
    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Learning tools</p>
        <h2>合格支援ツール</h2>
        <p>進捗、復習、模試、検索をまとめて使い、次にやるべき学習へ進めます。</p>
      </div>
      <div class="source-grid">
        <article><h3>ダッシュボード</h3><p>弱点カテゴリ、復習待ち、試験日からの今日のノルマを確認します。</p><a href="./dashboard/index.html">開く</a></article>
        <article><h3>100分模試</h3><p>全カテゴリ横断の本番形式で解き、カテゴリ別の正答率を確認します。</p><a href="./mock/index.html">開始する</a></article>
        <article><h3>今日の復習</h3><p>間隔反復とブックマークから、見直すべき問題だけを解きます。</p><a href="./review/index.html">復習する</a></article>
      </div>
    </section>
    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Practice bank</p>
        <h2>本番形式の4択演習</h2>
        <p>既存の gtest-quiz.html から抽出した567問を、カテゴリ別に解ける演習ページとして組み込みます。</p>
      </div>
      <a class="primary-button" href="./practice/index.html">4択トレーニングを開く</a>
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
        <p class="section-kicker">Spaced review</p>
        <h2>今日の復習</h2>
        <p>間隔反復で期限が来た問題と、ブックマークした問題だけを解き直します。</p>
      </div>
      <div class="dashboard-metrics" id="reviewSummary"></div>
      <section class="practice-setup" id="reviewSetup">
        <div class="practice-toolbar">
          <button class="primary-button" type="button" id="startDueReview">期限到来の問題を復習</button>
          <button class="ghost-button" type="button" id="startBookmarkReview">ブックマークだけ演習</button>
        </div>
      </section>
      <section class="practice-stage" id="reviewStage" hidden>
        <p class="practice-meta" id="reviewMeta"></p>
        <h3 class="practice-question" id="reviewQuestion"></h3>
        <div class="practice-options" id="reviewOptions"></div>
        <div class="practice-feedback" id="reviewFeedback" aria-live="polite"></div>
        <div class="practice-toolbar"><button class="primary-button" type="button" id="reviewNext" disabled>次へ</button></div>
      </section>
      <section class="practice-result" id="reviewResult" hidden></section>
    </section>`;
  return layout({
    depth: 1,
    title: "今日の復習",
    description: "SRSとブックマークによる復習ページです。",
    body,
    extraScript: `  <script src="../assets/js/store.js" defer></script>
  <script src="../assets/js/learning.js" defer></script>
  <script src="../assets/js/review.js" defer></script>`
  });
}

function dashboardPage() {
  const body = `    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Dashboard</p>
        <h2>学習ダッシュボード</h2>
        <p>レッスン進捗、問題カバレッジ、弱点カテゴリ、模試履歴、試験日からの学習ノルマを確認します。</p>
      </div>
      <div class="dashboard-metrics" id="dashboardMetrics"></div>
      <section class="dashboard-panel">
        <h3>カテゴリ別正答率</h3>
        <div class="category-stats" id="categoryStats"></div>
      </section>
      <section class="dashboard-panel">
        <h3>試験日からの学習プラン</h3>
        <div class="practice-toolbar">
          <label class="control-field"><span>受験日</span><input id="examDate" type="date"></label>
          <button class="primary-button" type="button" id="savePlan">保存</button>
        </div>
        <p id="planSummary" class="progress-state"></p>
      </section>
      <section class="dashboard-panel">
        <h3>模試履歴</h3>
        <div id="examHistory"></div>
      </section>
      <section class="dashboard-panel">
        <h3>進捗のバックアップ</h3>
        <div class="practice-toolbar">
          <button class="ghost-button" type="button" id="exportProgress">エクスポート</button>
          <label class="ghost-button import-button">インポート<input id="importProgress" type="file" accept="application/json"></label>
        </div>
        <p id="importStatus" class="progress-state"></p>
      </section>
    </section>`;
  return layout({
    depth: 1,
    title: "学習ダッシュボード",
    description: "G検定学習の進捗と弱点を確認するダッシュボードです。",
    body,
    extraScript: `  <script src="../assets/js/store.js" defer></script>
  <script src="../assets/js/learning.js" defer></script>
  <script src="../assets/js/dashboard.js" defer></script>`
  });
}

function mockPage() {
  const body = `    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Mock exam</p>
        <h2>100分 模試モード</h2>
        <p>全カテゴリから横断出題します。解答中は正誤を表示せず、提出後にカテゴリ別の弱点を分析します。</p>
      </div>
      <section class="practice-setup" id="mockSetup">
        <h3>出題設定</h3>
        <p id="mockConfig">読み込み中</p>
        <button class="primary-button" type="button" id="mockStart">模試を開始</button>
      </section>
      <section class="mock-stage" id="mockStage" hidden>
        <div class="mock-toolbar">
          <strong id="mockTimer">100:00</strong>
          <button class="ghost-button" type="button" id="mockFlag">後で見直す</button>
          <button class="primary-button" type="button" id="mockSubmit">提出</button>
        </div>
        <div class="mock-layout">
          <article class="practice-stage">
            <p class="practice-meta" id="mockMeta"></p>
            <h3 class="practice-question" id="mockQuestion"></h3>
            <div class="mock-options" id="mockOptions"></div>
            <div class="practice-toolbar">
              <button class="ghost-button" type="button" id="mockPrev">前へ</button>
              <button class="primary-button" type="button" id="mockNext">次へ</button>
            </div>
          </article>
          <aside class="mock-palette" id="mockPalette" aria-label="問題パレット"></aside>
        </div>
      </section>
      <section class="practice-result" id="mockResult" hidden></section>
    </section>`;
  return layout({
    depth: 1,
    title: "100分 模試モード",
    description: "本番形式に近い横断模試ページです。",
    body,
    extraScript: `  <script src="../assets/js/store.js" defer></script>
  <script src="../assets/js/learning.js" defer></script>
  <script src="../assets/js/mock.js" defer></script>`
  });
}

function searchPage() {
  const body = `    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">Search</p>
        <h2>サイト内検索</h2>
        <p>レッスン、用語、問題を横断して検索できます。</p>
      </div>
      <label class="search-box"><span>検索語</span><input id="siteSearch" type="search" placeholder="例: Attention、著作権、混同行列"></label>
      <div class="search-results" id="searchResults"></div>
    </section>`;
  return layout({
    depth: 1,
    title: "サイト内検索",
    description: "教材と問題を横断検索します。",
    body,
    extraScript: `  <script src="../assets/js/store.js" defer></script>
  <script src="../assets/js/learning.js" defer></script>
  <script src="../assets/js/search.js" defer></script>`
  });
}

function practicePage() {
  const body = `    <section class="layout">
      <div class="section-heading">
        <p class="section-kicker">4-choice training</p>
        <h2>G検定 4択トレーニング</h2>
        <p>既存の gtest-quiz.html を参考に、567問の4択演習をカテゴリ別に解けるようにしました。解答後すぐに正誤と解説を確認できます。</p>
      </div>

      <section class="practice-setup" id="practiceSetup">
        <h3>出題カテゴリ</h3>
        <div class="chip-row" id="practiceCats"></div>
        <div class="practice-toolbar">
          <button class="primary-button" type="button" id="practiceStart">開始する</button>
          <span id="practiceCount">読み込み中</span>
        </div>
      </section>

      <section class="practice-stage" id="practiceStage" hidden>
        <p class="practice-meta" id="practiceMeta"></p>
        <h3 class="practice-question" id="practiceQuestion"></h3>
        <div class="practice-options" id="practiceOptions"></div>
        <div class="practice-feedback" id="practiceFeedback" aria-live="polite"></div>
        <div class="practice-toolbar">
          <button class="primary-button" type="button" id="practiceNext" disabled>次へ</button>
        </div>
      </section>

      <section class="practice-result" id="practiceResult" hidden></section>
      <div class="practice-toolbar">
        <button class="ghost-button" type="button" id="retryWrong" disabled>間違えた問題だけ再挑戦</button>
        <button class="ghost-button" type="button" id="practiceRestart">設定に戻る</button>
      </div>
    </section>`;
  return layout({
    depth: 1,
    title: "G検定 4択トレーニング",
    description: "既存の4択演習コンテンツを統合した本番形式の練習ページです。",
    body,
    extraScript: `  <script src="../assets/js/store.js" defer></script>
  <script src="../assets/js/learning.js" defer></script>
  <script src="../assets/js/practice.js" defer></script>`
  });
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

function searchIndex() {
  const lessonItems = allLessons().map(({ chapter, lesson }) => ({
    kind: "レッスン",
    title: lesson.title,
    body: `${chapter.title} ${lesson.focus} ${lesson.terms.join(" ")}`,
    url: `../chapters/${chapter.slug}/${lesson.slug}.html`
  }));
  const termItems = allLessons().flatMap(({ chapter, lesson }) => lesson.terms.map((term) => ({
    kind: "用語",
    title: term,
    body: `${chapter.title} / ${lesson.title}`,
    url: `../chapters/${chapter.slug}/${lesson.slug}.html`
  })));
  const questionItems = practiceQuestions.map((question) => ({
    kind: "問題",
    title: question.q,
    body: `${question.cat} ${question.c.join(" ")} ${stripHtml(question.e || "")}`,
    url: `../practice/index.html?cat=${encodeURIComponent(question.cat)}`
  }));
  return [...lessonItems, ...termItems, ...questionItems];
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
  writeFile("dashboard/index.html", dashboardPage());
  writeFile("mock/index.html", mockPage());
  writeFile("glossary/index.html", glossaryPage());
  writeFile("review/index.html", reviewPage());
  writeFile("search/index.html", searchPage());
  writeFile("practice/index.html", practicePage());
  writeFile("sources/index.html", sourcesPage());
  writeFile("content/syllabus-map.json", JSON.stringify(chapters, null, 2));
  writeFile("content/search-index.json", JSON.stringify(searchIndex(), null, 2));
}

generate();
console.log(`Generated ${chapters.length} chapters and ${allLessons().length} lesson pages.`);
