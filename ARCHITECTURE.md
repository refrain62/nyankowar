# ねこねこ大戦争: アーキテクチャ設計書 (Final)

## 0. 技術スタック (Tech Stack)
- **UI:** React 19 / TypeScript
- **ビルド・品質:** Vite 8 / Biome
- **描画:** HTML5 Canvas API (数式ベース)
- **音声:** Web Audio API (リアルタイム合成)
- **設計思想:** **Controller-System-View (CSV Pattern) & Event-Driven FSM**

## 1. 責任の分離 (Separation of Concerns)
プロジェクトは以下の3つの役割に厳密に分離され、お互いに疎結合な状態を維持しています。

### ① View Layer (`Game.tsx`, `renderer.ts`)
- **役割:** ユーザーインターフェースの配置と描画。
- **特徴:** 「純粋（Pure）」な層。計算を行わず、渡されたデータを可視化することに専念します。

### ② Controller Layer (`useGameController.ts`)
- **役割:** ユーザーアクションの解釈と状態遷移の統制。
- **特徴:** ゲームの「脳」。状態（FSM）を切り替え、音響やシステムへ命令を飛ばします。

### ③ System Layer (`gameSystems.ts`, `useGameLoop.ts`)
- **役割:** 世界の更新（物理演算・経済・戦闘）。
- **特徴:** Reactのサイクルから独立。高速な `requestAnimationFrame` に同期して `stateRef` を直接操作します。

## 2. 視覚と音響のエンジニアリング
### ① 数式描画アニメーション
全てのユニットは `timestamp` を引数に持つ純粋関数で描画されます。`Math.sin` や `BezierCurve` を駆使し、フレームレートに依存しない滑らかな動きと、画像を使わない豊かな表現（火炎、エフェクト等）を両立しています。

### ② リアルタイム音響合成
Web Audio API の `OscillatorNode` を直接操作。BGM のステップ管理（`bgmStepRef`）により、一時停止からの正確な再開を実現しています。

## 3. 状態管理の哲学
### ① useEffect-free
React の `useEffect` は「副作用の同期」ではなく、Canvas や Web Audio などの「外部リソースとの接続・破棄」のみに使用。ゲームの状態変化は全てイベント駆動で行われます。

### ② 自己説明的なコード
全ファイルに senior engineer 視点での詳細コメントを完備。各座標や周波数パラメータの意味が明文化されており、高いオンボーディング性と保守性を備えています。
