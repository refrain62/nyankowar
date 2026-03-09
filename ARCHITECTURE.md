# ねこねこ大戦争: アーキテクチャ設計書

## 0. 技術スタック (Tech Stack)
- **UI:** React 19 / TypeScript
- **Linter/Formatter:** Biome
- **描画:** HTML5 Canvas API
- **音声:** Web Audio API (Stable Interface & ポーズ対応)
- **設計思想:** **Controller-System-View (CSV Pattern)**

## 1. 責任の分離 (Separation of Concerns)
本プロジェクトは、以下の 3 つの主要レイヤーに厳密に分離されています。

### ① View Layer (`Game.tsx`)
- **役割:** ユーザーインターフェースの配置、イベントの受け口。
- **特徴:** 独自のロジックを持たず、全てのユーザーアクションを `useGameController` に委譲します。

### ② Controller Layer (`useGameController.ts`)
- **役割:** ユーザーアクション（召喚、レベルアップ、ポーズ等）の解釈と実行。
- **特徴:** `Game.tsx` から抽出されたアクションハンドラ。状態の遷移（FSM）や、オーディオ・ゲームループへの命令を統制します。

### ③ System Layer (`gameSystems.ts` / `useGameLoop.ts`)
- **役割:** ゲーム世界の物理演算、経済、戦闘、スポーン。
- **特徴:** React のレンダリングサイクルから独立した純粋な計算モジュール群。`stateRef` を直接操作し、1フレームごとに世界を更新します。

## 2. 実装の詳細
### ① 有限状態マシン (FSM)
`transitionTo` 関数により、タイトル、ステージ選択、プレイ中、ポーズ中、勝敗の各状態を管理。状態遷移に伴う副作用（BGM開始・停止）を一元的にハンドリングします。

### ② 演算ロジックのサブモジュール化
`gameSystems.ts` 内に、以下の独立したシステムを定義しています。
- **updateEconomy:** 所持金とキャノンのチャージ。
- **updateCooldowns:** ユニット生産の制限解除。
- **spawnEnemies:** ステージ難易度に応じた敵の自動生成。
- **processUnitsAndCombat:** 移動、ダメージ計算、城の陥落判定。

### ③ 音響ライフサイクル
`useGameAudio` による Stable なインターフェースを提供。BGM のステップ保持機能を備え、ポーズ・再開に対応しています。

## 3. 利点
- **保守性:** アニメーションを修正したい場合は `renderer`、戦闘バランスを調整したい場合は `gameSystems` と、修正箇所が明確に分離されています。
- **スケーラビリティ:** 新しい「アイテム」や「スキル」などの新システムを追加する際、既存のコードへの影響を最小限に抑えつつ、独立したシステムとして追加可能です。
- **安定性:** React の副作用に頼らない設計により、高いパフォーマンスと予測可能な動作を実現しています。
