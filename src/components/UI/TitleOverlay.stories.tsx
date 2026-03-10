import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { TitleOverlay } from "./TitleOverlay";

const meta: Meta<typeof TitleOverlay> = {
	title: "UI/TitleOverlay",
	component: TitleOverlay,
	parameters: {
		layout: "fullscreen",
	},
	args: {
		onStart: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof TitleOverlay>;

/**
 * タイトル画面の初期表示
 * タイトルテキストが表示され、アニメーション付きの「CLICK TO START」ボタンが存在することを検証します。
 */
export const Default: Story = {
	args: {
		onStart: () => {},
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);

		// タイトルテキストの存在確認
		const title = canvas.getByText("ねこねこ大戦争");
		expect(title).toBeInTheDocument();

		// タイトル部分のスタイル検証 (背景色が rgba(255,255,255,0.9) であること)
		const titleContainer = title.parentElement;
		if (titleContainer) {
			const style = window.getComputedStyle(titleContainer);
			expect(style.backgroundColor).toBe("rgba(255, 255, 255, 0.9)");
		}

		// STARTボタンの存在確認とクリックシミュレーション
		const startMessage = canvas.getByText("CLICK TO START");
		expect(startMessage).toBeInTheDocument();

		// 全体がボタンになっているため、クリックしてアクションが呼ばれるか確認
		const overlayButton = canvas.getByRole("button");
		await userEvent.click(overlayButton);
		expect(args.onStart).toHaveBeenCalled();
	},
};
