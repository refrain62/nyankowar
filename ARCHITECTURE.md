# ねこねこ大戦争: アーキテクチャ設計書 (Final + QA)

## 0. 技術スタック (Tech Stack)
- **UI:** React 19 / TypeScript
- **設計:** Controller-System-View (CSV)
- **品質保証:** Hybrid Testing Strategy (Unit + E2E)

## 1. テスト戦略 (Testing Strategy)
本プロジェクトでは、「正しく」「適切に」といった曖昧な評価基準を廃止し、定量的かつ観測可能な状態（数値・状態遷移）を期待値として定義します。

### ① ロジックの検証 (Vitest + React Testing Library)
- **期待値の定義例:**
    - 「updateEconomyを実行後、0.5秒間で所持金が正確に (30 + Lv*20) * 0.5 円増加していること」
    - 「射程 100px のとき、距離 100.1px では 1px 移動し、99.9px では座標変化量が 0 になること」
    - 「GaugeButton の percent=30 のとき、background CSS が正確に 30% の位置で色相変化していること」
    - 「HPが0以下になった瞬間、ユニット配列から該当IDが削除され、lengthが1減少すること」

### ③ 実機挙動の検証 (Playwright)
- **期待値の定義例:**
    - 「Canvasの (x, y) 座標のピクセル色が、BGM ON時に特定の色相（エフェクト発生）と一致すること」
    - 「PAUSEボタン押下後、次のフレームで全ユニットの X 座標の変化量が 0 であること」
    - 「AudioContext.state がユーザーの初回の操作（Click）後に 'running' に遷移していること」

### ④ 型安全性と CI/CD (Type Safety & CI/CD)
- **厳格な型定義:** `any` の使用を極力排除し、`RefObject` などの React Hooks における Null 安全性を型レベルで保証。
- **ビルドの不変性:** 環境に依存せず、常に `tsc -b && vite build` が 0 エラーで完了することを CI 上で保証し、デプロイ後のランタイムエラーを未然に防止。

## 2. 責任の分離 (Separation of Concerns)
- **View Layer**: Playwright によるピクセル・状態遷移検証の対象。
- **Controller Layer**: RTL による命令発行の正確性検証の対象。
- **System Layer**: ロジック関数に対する純粋な数値計算検証の対象。

## 3. 実装の哲学
### 明示的期待値 (Concrete Expectations)
「動いているように見える」はテストではありません。「期待した瞬間に、期待した数値になっていること」を自動検証し続けることで、人間の主観による見落としを完全に排除します。
