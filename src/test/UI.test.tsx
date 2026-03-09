import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "../components/UI/ControlPanel";
import { TitleOverlay } from "../components/UI/TitleOverlay";

/**
 * 【責任】主要なUIコンポーネント（タイトル画面、操作パネル）の表示ロジックとインタラクションの検証。
 * 定量的な状態（disabled属性など）を期待値として扱います。
 */
describe("UI Components", () => {
	/**
	 * タイトル画面の検証。
	 * 期待値: 画面上の特定テキストをクリックした際、onStart が 1回呼び出されること。
	 */
	it("TitleOverlay: CLICK TO STARTテキストをクリックすると、開始用コールバックが1回呼び出されること", () => {
		const onStart = vi.fn();
		render(<TitleOverlay onStart={onStart} />);
		fireEvent.click(screen.getByText("CLICK TO START"));
		expect(onStart).toHaveBeenCalledTimes(1);
	});

	/**
	 * 操作パネルの資金不足による制限の検証。
	 * 期待値: 所持金が 0 の状態で、召喚コスト $50 または アップグレードコスト $200 のボタンが disabled であること。
	 */
	it("ControlPanel: 所持金が0の場合、召喚ボタン($50)およびアップグレードボタン($200)が非活性状態(disabled)になること", () => {
		const onSpawn = vi.fn();
		const onUpgrade = vi.fn();
		const onCannon = vi.fn();
		const mockUi = {
			money: 0, // 資金不足の状態をモック
			walletLevel: 1,
			baseHp: 1000,
			enemyBaseHp: 1000,
			cannonCharge: 0,
			gameState: "play",
			cooldownPercents: { BASIC: 100 },
		} as any;

		render(
			<ControlPanel
				ui={mockUi}
				onSpawn={onSpawn}
				onUpgrade={onUpgrade}
				onCannon={onCannon}
			/>,
		);

		// BASICボタン（$50）は資金不足のため非活性
		const spawnButton = screen.getByText(/\$50/).closest("button");
		expect(spawnButton).toBeDisabled();

		// アップグレードボタン（$200）も資金不足のため非活性
		const upgradeButton = screen.getByText(/働きネコ/).closest("button");
		expect(upgradeButton).toBeDisabled();
	});
});
