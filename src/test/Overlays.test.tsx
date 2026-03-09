import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { STAGES } from "../constants/stages";
import { PauseOverlay } from "../components/UI/PauseOverlay";
import { ResultOverlay } from "../components/UI/ResultOverlay";
import { StageSelectOverlay } from "../components/UI/StageSelectOverlay";

describe("UI Overlays", () => {
	it("StageSelectOverlay: ステージを選択できること", () => {
		const onSelect = vi.fn();
		render(
			<StageSelectOverlay onSelectStage={onSelect} onBackToTitle={() => {}} />,
		);

		const stage1Button = screen.getByText(/第1章/);
		fireEvent.click(stage1Button);
		expect(onSelect).toHaveBeenCalledWith(STAGES[1]);
	});

	it("PauseOverlay: 再開・再試行・終了ボタンが正しく機能すること", () => {
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

		fireEvent.click(screen.getByText("RESUME"));
		expect(onResume).toHaveBeenCalled();

		fireEvent.click(screen.getByText("RESTART"));
		expect(onRestart).toHaveBeenCalledWith(STAGES[1]);

		fireEvent.click(screen.getByText("QUIT"));
		expect(onQuit).toHaveBeenCalled();
	});

	it("ResultOverlay: BACK TO MENUボタンが機能すること", () => {
		const onBack = vi.fn();
		render(<ResultOverlay gameState="win" onBackToMenu={onBack} />);

		fireEvent.click(screen.getByText("BACK TO MENU"));
		expect(onBack).toHaveBeenCalled();
	});
});
