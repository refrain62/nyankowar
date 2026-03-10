import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { stage1 } from "../../constants/stages/stage1";
import { PauseOverlay } from "./PauseOverlay";

const meta: Meta<typeof PauseOverlay> = {
	title: "UI/PauseOverlay",
	component: PauseOverlay,
	args: {
		onResume: fn(),
		onRestart: fn(),
		onQuit: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof PauseOverlay>;

/**
 * 通常のポーズ状態
 * 背景が半透明（rgba(0,0,0,0.5)）であり、「PAUSED」という見出しが表示され、
 * RESUME, RESTART, QUIT の3つのボタンが正しく機能することを検証します。
 */
export const Default: Story = {
	args: {
		currentStage: stage1,
		onResume: () => {},
		onRestart: () => {},
		onQuit: () => {},
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);

		// 見出しの確認
		const heading = canvas.getByText("PAUSED");
		expect(heading).toBeInTheDocument();
		expect(window.getComputedStyle(heading).fontSize).toBe("40px");

		// ボタンの存在確認
		const resumeBtn = canvas.getByRole("button", { name: /RESUME/i });
		const restartBtn = canvas.getByRole("button", { name: /RESTART/i });
		const quitBtn = canvas.getByRole("button", { name: /QUIT/i });

		expect(resumeBtn).toBeInTheDocument();
		expect(restartBtn).toBeInTheDocument();
		expect(quitBtn).toBeInTheDocument();

		// RESUMEボタンのクリック検証
		await userEvent.click(resumeBtn);
		expect(args.onResume).toHaveBeenCalled();

		// RESTARTボタンのクリック検証 (引数に currentStage が渡されること)
		await userEvent.click(restartBtn);
		expect(args.onRestart).toHaveBeenCalledWith(stage1);

		// QUITボタンのクリック検証
		await userEvent.click(quitBtn);
		expect(args.onQuit).toHaveBeenCalled();
	},
};
