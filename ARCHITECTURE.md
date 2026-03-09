# ねこねこ大戦争: アーキテクチャ設計書 (Final + QA)

## 0. 技術スタック (Tech Stack)
- **UI:** React 19 / TypeScript
- **設計:** Controller-System-View (CSV)
- **品質保証:** **Hybrid Testing Strategy (Unit + E2E)**

## 1. テスト戦略 (Testing Strategy)
本プロジェクトでは、速度と精度のバランスをとるために以下の二段構えのテストを実施しています。

### ① ロジックの検証 (Vitest + React Testing Library)
- **対象:** `gameSystems.ts`, `useGameController.ts`, `useGameAudio.ts`
- **目的:** 経済計算や戦闘判定、状態遷移などの「数学的・論理的正しさ」を高速に保証。
- **特徴:** 仮想DOM (JSDOM) 上で動作し、CI環境でも数秒で実行完了。

### ② 実機挙動の検証 (Playwright) [NEW]
- **対象:** ゲーム全体のユーザーフロー、Canvas 描画結果
- **目的:** ブラウザ実機において「Canvas に正しくキャラが表示されているか」「BGM は鳴っているか」「画面遷移はスムーズか」という、RTL では不可能な「体験の正しさ」を保証。
- **特徴:** ヘッドレスブラウザによる E2E 検証。ビジュアルレグレッションテスト（画像比較）を含む。

## 2. 責任の分離 (Separation of Concerns)
- **View Layer (`Game.tsx`)**: Playwright の主な検証対象。
- **Controller Layer (`useGameController.ts`)**: RTL と Playwright 両方の検証対象。
- **System Layer (`gameSystems.ts`)**: RTL の主な検証対象。

## 3. 実装の哲学
### useEffect-free & Event-Driven
副作用を排除し、全てを明示的なイベント（ボタンクリック等）に紐付けることで、自動テストプログラム（Playwright）からの操作が極めて容易になっています。「いつ、何が起きるか」が明確な設計は、高いテスト適格性（Testability）に直結します。
