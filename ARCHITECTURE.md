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

### ② コンポーネントのカタログ化とインタラクション検証 (Storybook)
- **Storybook による View 単体テスト:**
    - UIコンポーネントを独立した環境（Storybook）で描画し、視覚的・機能的状態を網羅。
    - `@storybook/test-runner` による自動インタラクションテスト（`play` 関数）を実行。
- **期待値の定義例:**
    - 「GaugeButton: `percent=30` のとき、background CSS が正確に `linear-gradient(... 30%, ... 30%)` を含んでいること」
    - 「TitleOverlay: 背景色が正確に `rgba(255, 255, 255, 0.9)` であり、クリック時に `onStart` が1回呼び出されること」

### ③ 実機挙動の検証 (Playwright)
- **期待値の定義例:**
    - 「Canvasの (x, y) 座標のピクセル色が、BGM ON時に特定の色相（エフェクト発生）と一致すること」
    - 「PAUSEボタン押下後、次のフレームで全ユニットの X 座標の変化量が 0 であること」
    - 「AudioContext.state がユーザーの初回の操作（Click）後に 'running' に遷移していること」
- **CI環境への適合性:**
    - GitHub Actions 等のコンテナ環境では CPU リソースが制限され、ゲームループ内の `dt` が上限値（100ms）に達しやすいため、現実の時間よりもゲーム進行が遅延する場合がある。
    - この挙動を「仕様上の制約」として許容し、E2Eテストにおいては、リソース枯渇時でも完遂できるよう、タイムアウト値を通常の2〜3倍（にゃんこ砲チャージ待機: 80s、勝利条件: 150s等）に緩和する。
    - また、勝利・敗北確定時に React コンポーネントがアンマウントされ、操作対象のボタンが DOM から消失する挙動に対し、`isVisible()` による存在確認と早期リターンを組み合わせた堅牢なポーリングループを実装し、不要なタイムアウト待機を排除する。

### ④ 型安全性と CI/CD (Type Safety & CI/CD)
- **厳格な型定義:** `any` の使用を完全に排除。`useGameController.test.ts` を含む全テストコードにおいて `any` を排除し、適切なインターフェースまたは `as unknown as Type` による安全な型キャスト（必要な場合のみ）を採用。
- **Git Hook による物理的ガードレール:** 
    - Husky を使用し、`git commit` 時は `pnpm run lint` を実行し、開発リズムを損なわずスタイルを矯正。
    - `git push` の直前には `pnpm run lint` と `pnpm run test` を強制し、最終的な品質保証を完遂。
    - エラーが1件でも存在する場合、Git 操作を中断させ、不適切なコードの混入を防ぐ。

- **Lint とフォーマットの自動検証:** Biome による import ソート、フォーマット、および `noExplicitAny` ルールの厳格な適用。
- **CI 自動検証パイプライン:** GitHub Actions により、`push` および `pull_request` ごとに `Lint` (Biome) と `Unit Test` (Vitest) を個別ジョブとして実行。
- **構成管理の最適化:** AI エージェントのコンテキスト効率を最大化するため、`.geminiignore` を用いて、動的に生成される大規模ファイル（バイナリ、JSON等）を解析対象から除外する。ただし、`.md` 形式のエラーコンテキストは保持し、AI が直接失敗原因（期待値と実測値の乖離）を数値で特定可能にする。
- **ビルドの不変性:** `Lint` および `Test` ジョブがすべてパスした場合にのみ `Production Build` を実行し、デプロイ品質を 100% 維持。

## 2. UIコンポーネント開発の掟 (Rules for UI Components)
全てのUIコンポーネント（Atomic Components）は、以下の三原則を守らなければならない。
1. **ストーリーの完備:** `src/components/` 配下の全コンポーネントは、対応する `.stories.tsx` を持つこと。
2. **網羅的な状態カタログ:** 正常系（Default）だけでなく、`disabled`, `active`, `error` 等、UIが取りうるすべての主要な状態をストーリーとして定義すること。
3. **自動インタラクションテストの義務化:** 各ストーリーの `play` 関数内で、具体的な数値（座標、CSS値）や `vi.fn()` / `fn()` を用いた挙動の自動検証を記述すること。「正しく描画されている」といった曖昧な評価ではなく、ブラウザ上の実測値に基づいて判定を行う。

## 3. 責任の分離 (Separation of Concerns)
- **View Layer**: Playwright によるピクセル・状態遷移検証の対象。
- **UI Component Layer**: Storybook + Vitest による単体機能検証の対象。
- **Controller Layer**: RTL による命令発行の正確性検証の対象。
- **System Layer**: ロジック関数に対する純粋な数値計算検証の対象。

## 4. 実装の哲学
### 明示的期待値 (Concrete Expectations)
「動いているように見える」はテストではありません。Storybook においても、「期待した瞬間に、背景色が `rgb(46, 204, 113)` になっていること」や「ボタンクリック時に `onStart` が1回呼び出されること」を数値・状態で自動検証し続けることで、人間の主観による見落としを完全に排除します。
