import { expect, test } from "@playwright/test";

/**
 * 【責任】ゲーム全体のユーザーシナリオに基づく定量的E2E検証。
 * 全ての期待値は「状態」「数値」「座標」に基づいて定義します。
 */
test.describe("ねこねこ大戦争 E2Eシナリオ", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("ナビゲーション: タイトル、ステージ選択、バトルの各画面間を正しく遷移できること", async ({
		page,
	}) => {
		// タイトル -> ステージ選択
		await page.getByText("CLICK TO START").click();
		await expect(page.getByText("ステージ選択")).toBeVisible();

		// ステージ選択 -> タイトル (戻る)
		await page.getByText("タイトルへ戻る").click();
		await expect(page.locator("h1")).toHaveText("ねこねこ大戦争");

		// タイトル -> ステージ選択 -> 第2章バトル開始
		await page.getByText("CLICK TO START").click();
		await page.getByText("第2章").click();
		await expect(page.getByText("PAUSE (P)")).toBeVisible();

		// バトル -> ステージ選択 (QUIT)
		await page.getByText("QUIT").click();
		await expect(page.getByText("ステージ選択")).toBeVisible();
	});

	test("経済システム: 働きネコのレベルアップにより、レベル表記とアップグレードコストが更新されること", async ({
		page,
	}) => {
		await page.getByText("CLICK TO START").click();
		await page.getByText("第1章").click();

		// 初期状態: Lv.1, 次のコスト $200
		const upgradeButton = page
			.locator("button")
			.filter({ hasText: "働きネコ Lv.1" });
		await expect(upgradeButton).toBeDisabled();

		// 期待値: 4秒以上経過すると所持金が $200 に達し、ボタンが活性化すること (50円/秒)
		await expect(upgradeButton).toBeEnabled({ timeout: 5000 });

		// アクション: アップグレード実行
		await upgradeButton.click();

		// 期待値: レベルが Lv.2 に上がり、次のコストが $400 に更新されること
		// トカゲ ($400) と重複しないよう、働きネコを含めてフィルタリング
		const lv2Button = page
			.locator("button")
			.filter({ hasText: "働きネコ Lv.2" })
			.filter({ hasText: "$400" });

		await expect(lv2Button).toBeVisible();

		// 所持金が減ったため、再度非活性化することを確認
		await expect(lv2Button).toBeDisabled();
	});

	test("にゃんこ砲: 100%チャージ後に発射可能になり、発射後にチャージが0%に戻ること", async ({
		page,
	}) => {
		// 30秒以上の待機が必要なため、テストタイムアウトを延長
		// CI環境での実行遅延（dtの100msキャップ等）を考慮し、余裕を持って100秒に設定
		test.setTimeout(100000);

		await page.getByText("CLICK TO START").click();
		await page.getByText("第1章").click();

		const cannonButton = page
			.locator("button")
			.filter({ hasText: "にゃんこ砲" });

		// 初期状態は 0%
		await expect(cannonButton).toContainText("(0%)");
		await expect(cannonButton).toBeDisabled();

		// 期待値: 約30秒で 100% に達する設定 (秒間3.3%)
		// CI環境の負荷を考慮し、タイムアウトを80秒に設定
		await expect(cannonButton).toBeEnabled({ timeout: 80000 });
		await expect(cannonButton).toContainText("(100%)");

		// アクション: 発射
		await cannonButton.click();

		// 期待値: 発射直後に非活性化し、チャージが 0% にリセットされること
		await expect(cannonButton).toBeDisabled();
		await expect(cannonButton).toContainText("(0%)");
	});

	test("ポーズ機能: 各種メニューボタン（RESUME, QUIT）が正しく動作すること", async ({
		page,
	}) => {
		await page.getByText("CLICK TO START").click();
		await page.getByText("第1章").click();

		// ポーズ画面を開く
		await page.getByText("PAUSE (P)").click();
		// オーバーレイ内の見出しを確認
		await expect(page.locator("h2", { hasText: "PAUSE" })).toBeVisible();

		// RESUME でゲームに戻る
		await page.getByText("RESUME").click();
		await expect(page.locator("h2", { hasText: "PAUSE" })).not.toBeVisible();
		await expect(page.getByText("PAUSE (P)")).toBeVisible();

		// 再度ポーズして QUIT でステージ選択に戻る
		await page.getByText("PAUSE (P)").click();
		await page.getByText("QUIT").click();
		await expect(page.getByText("ステージ選択")).toBeVisible();
	});

	test("サウンド設定: SOUNDボタン押下で、ボタンのラベルと背景色が変化すること", async ({
		page,
	}) => {
		const soundButton = page.locator("button", { hasText: /^SOUND:/ });

		await expect(soundButton).toHaveText("SOUND: OFF");
		await expect(soundButton).toHaveCSS("background-color", "rgb(231, 76, 60)");

		await soundButton.click();

		await expect(soundButton).toHaveText("SOUND: ON");
		await expect(soundButton).toHaveCSS(
			"background-color",
			"rgb(46, 204, 113)",
		);
	});

	test("勝利シナリオ: ユニットを召喚し続け、敵の拠点を破壊して VICTORY が表示されること", async ({
		page,
	}) => {
		// CI環境での実行遅延を考慮し、タイムアウトを150秒に設定
		test.setTimeout(150000);

		await page.getByText("CLICK TO START").click();
		await page.getByText("第1章").click();

		const basicButton = page
			.locator("button")
			.filter({ hasText: "にゃんこ" })
			.filter({ hasText: "$50" });
		const cowButton = page
			.locator("button")
			.filter({ hasText: "ウシねこ" })
			.filter({ hasText: "$150" });

		// ユニットを定期的に召喚するループ
		// CI環境での資金蓄積速度低下を補うため、チェック間隔を500msに短縮し、より攻撃的に召喚
		const spawnUnits = async () => {
			for (let i = 0; i < 200; i++) {
				// 既に勝利または敗北画面が出ていたら即座に終了
				if (
					(await page.getByText("VICTORY").isVisible()) ||
					(await page.getByText("DEFEAT").isVisible())
				) {
					break;
				}

				// ボタンが存在するか確認（アンマウント対策）
				if (!(await basicButton.isVisible())) {
					break;
				}

				if (await cowButton.isEnabled()) {
					await cowButton.click();
				} else if (await basicButton.isEnabled()) {
					await basicButton.click();
				}
				await page.waitForTimeout(500);
			}
		};

		await spawnUnits();

		// 期待値: 最終的に VICTORY オーバーレイが表示されること
		// 拠点の破壊に時間がかかる場合を考慮し、タイムアウトを120秒に設定
		await expect(page.getByText("VICTORY")).toBeVisible({ timeout: 120000 });

		// BACK TO MENU で戻れること
		await page.getByText("BACK TO MENU").click();
		await expect(page.getByText("ステージ選択")).toBeVisible();
	});

	test("敗北シナリオ: 第4章で何もせず待機し、自軍の拠点が早期に破壊されて DEFEAT が表示されること", async ({
		page,
	}) => {
		// 第4章は敵の出現頻度が高く、HP/攻撃力倍率も高いため、早期決着が期待できる
		test.setTimeout(120000);

		await page.getByText("CLICK TO START").click();
		await page.getByText("第4章").click();

		// 何も召喚せずに待機
		// 期待値: 最終的に DEFEAT オーバーレイが表示されること
		await expect(page.getByText("DEFEAT")).toBeVisible({ timeout: 90000 });

		// BACK TO MENU で戻れること
		await page.getByText("BACK TO MENU").click();
		await expect(page.getByText("ステージ選択")).toBeVisible();
	});
});
