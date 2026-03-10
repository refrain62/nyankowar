import { test, expect } from '@playwright/test';

/**
 * 【責任】ゲーム全体のユーザーシナリオに基づく定量的E2E検証。
 * 全ての期待値は「状態」「数値」「座標」に基づいて定義します。
 * Canvas内の数値（所持金等）は、それによって変化するUIの状態（ボタンの活性化等）を通じて検証します。
 */
test.describe('ねこねこ大戦争 E2Eシナリオ', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('初期状態: タイトル画面が表示され、クリックでステージ選択画面に遷移すること', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('ねこねこ大戦争');
    
    const startButton = page.getByText('CLICK TO START');
    await startButton.click();

    await expect(page.getByText('ステージ選択')).toBeVisible();
    await expect(page.getByText('第1章')).toBeVisible();
  });

  test('経済システム: ステージ開始後、時間の経過に伴いユニット召喚ボタンが活性化すること', async ({ page }) => {
    // ステージ開始
    await page.getByText('CLICK TO START').click();
    await page.getByText('第1章').click();

    // 初期状態では所持金 $0 のため、コスト $50 の BASIC ボタンは非活性なはず
    const basicButton = page.locator('button').filter({ hasText: 'にゃんこ' }).filter({ hasText: '$50' });
    await expect(basicButton).toBeDisabled();

    // 期待値: 1秒以上経過すると所持金が $50 に達し、ボタンが活性化すること
    // (収入レート 50円/秒)
    await expect(basicButton).toBeEnabled({ timeout: 2000 });
  });

  test('ユニット召喚: 召喚ボタン押下により、クールダウン（非活性化）が発生すること', async ({ page }) => {
    await page.getByText('CLICK TO START').click();
    await page.getByText('第1章').click();

    const basicButton = page.locator('button').filter({ hasText: 'にゃんこ' }).filter({ hasText: '$50' });
    
    // 活性化を待つ
    await expect(basicButton).toBeEnabled({ timeout: 2000 });

    // アクション: 召喚ボタンをクリック
    await basicButton.click();

    // 期待値: クリック直後はクールダウンにより非活性化すること
    await expect(basicButton).toBeDisabled();

    // 期待値: BASICのクールダウンは約2秒(2000ms)。さらに待てば再度活性化することを確認。
    await expect(basicButton).toBeEnabled({ timeout: 3000 });
  });

  test('サウンド設定: SOUNDボタン押下で、ボタンのラベルと背景色が変化すること', async ({ page }) => {
    const soundButton = page.locator('button', { hasText: /^SOUND:/ });
    
    await expect(soundButton).toHaveText('SOUND: OFF');
    await expect(soundButton).toHaveCSS('background-color', 'rgb(231, 76, 60)');

    await soundButton.click();

    await expect(soundButton).toHaveText('SOUND: ON');
    await expect(soundButton).toHaveCSS('background-color', 'rgb(46, 204, 113)');
  });

  test('ポーズ機能: PAUSEボタン押下でポーズオーバーレイが表示されること', async ({ page }) => {
    await page.getByText('CLICK TO START').click();
    await page.getByText('第1章').click();

    await page.getByText('PAUSE (P)').click();

    await expect(page.getByText('PAUSE')).toBeVisible();
    await expect(page.getByText('RESUME')).toBeVisible();
    await expect(page.getByText('RESTART')).toBeVisible();
    await expect(page.getByText('QUIT')).toBeVisible();
  });

});
