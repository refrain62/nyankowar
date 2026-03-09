import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PauseOverlay } from "../components/UI/PauseOverlay";
import { ResultOverlay } from "../components/UI/ResultOverlay";
import { StageSelectOverlay } from "../components/UI/StageSelectOverlay";
import { STAGES } from "../constants/stages";

/**
 * 【責任】各オーバーレイUIのユーザーインタラクションと状態遷移の検証。
 * 「正しく」などの曖昧な表現を排除し、コールバックの実行回数や引数の値を期待値として定義します。
 */
describe("UI Overlays", () => {
	/**
	 * ステージ選択オーバーレイのテスト。
	 * 期待値: 第1章ボタンをクリックした際、onSelectStage が引数 STAGES[1] で 1回呼び出されること。
	 */
	it("StageSelectOverlay: 第1章を選択した際に、対応するステージデータでコールバックが実行されること", () => {
		const onSelect = vi.fn();
		render(
			<StageSelectOverlay onSelectStage={onSelect} onBackToTitle={() => {}} />,
		);

		const stage1Button = screen.getByText(/第1章/);
		fireEvent.click(stage1Button);
		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(STAGES[1]);
	});

	/**
	 * ポーズオーバーレイのボタン検証。
	 * 期待値: RESUME, RESTART, QUIT の各ボタン押下時に、対応するプロップス関数が 1回ずつ呼び出されること。
	 */
	it("PauseOverlay: RESUME, RESTART, QUITボタン押下時にそれぞれのコールバックが1回呼び出されること", () => {
		const onResume = vi.fn();
		const onRestart = vi.fn();
		const onQuit = vi.fn();

		render(
			<PauseOverlay
				currentStage={STAGES[1]}
				onResume={onResume}
				onRestart={onRestart}
				onQuit={onQuit}
			/>,
		);

		// RESUMEボタンのクリック
		fireEvent.click(screen.getByText("RESUME"));
		expect(onResume).toHaveBeenCalledTimes(1);

		// RESTARTボタンのクリック
		fireEvent.click(screen.getByText("RESTART"));
		expect(onRestart).toHaveBeenCalledTimes(1);
		expect(onRestart).toHaveBeenCalledWith(STAGES[1]);

		// QUITボタンのクリック
		fireEvent.click(screen.getByText("QUIT"));
		expect(onQuit).toHaveBeenCalledTimes(1);
	});

	/**
	 * リザルトオーバーレイのボタン検証。
	 * 期待値: BACK TO MENUボタン押下時に、onBackToMenu が 1回呼び出されること。
	 */
	it("ResultOverlay: BACK TO MENUボタン押下時に、メニュー遷移用コールバックが1回呼び出されること", () => {
		const onBack = vi.fn();
		render(<ResultOverlay gameState="win" onBackToMenu={onBack} />);

		fireEvent.click(screen.getByText("BACK TO MENU"));
		expect(onBack).toHaveBeenCalledTimes(1);
	});
});
