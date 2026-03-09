import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "../components/UI/ControlPanel";
import { TitleOverlay } from "../components/UI/TitleOverlay";
import type { UIState } from "../types/game";

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
	 * 所持金がちょうど足りる境界値の検証。
	 * 期待値: 所持金が 50 のとき、コスト 50 の BASIC ボタンが活性状態(enabled)になり、1回クリックできること。
	 */
	it("ControlPanel: 所持金がちょうど50の場合、コスト50のBASICボタンが活性状態(enabled)になること", () => {
		const onSpawn = vi.fn();
		const mockUi: UIState = {
			money: 50,
			walletLevel: 1,
			baseHp: 1000,
			enemyBaseHp: 1000,
			cannonCharge: 0,
			gameState: "play",
			cooldownPercents: { BASIC: 100 },
		};

		render(
			<ControlPanel
				ui={mockUi}
				onSpawn={onSpawn}
				onUpgrade={() => {}}
				onCannon={() => {}}
			/>,
		);

		const spawnButton = screen.getByText(/\$50/).closest("button");
		if (!spawnButton) throw new Error("Spawn button not found");
		expect(spawnButton).not.toBeDisabled();
		fireEvent.click(spawnButton);
		expect(onSpawn).toHaveBeenCalledWith("BASIC");
	});

	/**
	 * クールダウン中の制限検証。
	 * 期待値: 所持金が 1000 あっても、クールダウンが 99% のときはボタンが非活性状態(disabled)になること。
	 */
	it("ControlPanel: 所持金が十分あっても、クールダウンが99%のときはボタンが非活性状態(disabled)になること", () => {
		const mockUi: UIState = {
			money: 1000,
			walletLevel: 1,
			baseHp: 1000,
			enemyBaseHp: 1000,
			cannonCharge: 0,
			gameState: "play",
			cooldownPercents: { BASIC: 99 },
		};

		render(
			<ControlPanel
				ui={mockUi}
				onSpawn={() => {}}
				onUpgrade={() => {}}
				onCannon={() => {}}
			/>,
		);

		const spawnButton = screen.getByText(/\$50/).closest("button");
		expect(spawnButton).toBeDisabled();
	});

	/**
	 * アップグレード上限の検証。
	 * 期待値: walletLevel が 8（最大）のとき、所持金に関わらずアップグレードボタンが非活性状態(disabled)になること。
	 */
	it("ControlPanel: 働きネコのレベルが8の場合、所持金に関わらずボタンが非活性状態(disabled)になること", () => {
		const mockUi: UIState = {
			money: 10000,
			walletLevel: 8,
			baseHp: 1000,
			enemyBaseHp: 1000,
			cannonCharge: 0,
			gameState: "play",
			cooldownPercents: { BASIC: 100 },
		};

		render(
			<ControlPanel
				ui={mockUi}
				onSpawn={() => {}}
				onUpgrade={() => {}}
				onCannon={() => {}}
			/>,
		);

		const upgradeButton = screen.getByText(/働きネコ/).closest("button");
		expect(upgradeButton).toBeDisabled();
	});
});
