import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, within } from "@storybook/test";
import { GaugeButton } from "./GaugeButton";

const meta: Meta<typeof GaugeButton> = {
	title: "UI/GaugeButton",
	component: GaugeButton,
	args: {
		onClick: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof GaugeButton>;

/**
 * チャージ中の状態 (30%)
 * 背景のグラデーションが下から 30% の位置で切り替わっていることを検証します。
 */
export const Charging: Story = {
	args: {
		label: "にゃんこチャージ中",
		percent: 30,
		disabled: false,
		readyColor: "#2ecc71",
		gaugeColor: "#f1c40f",
		width: "200px",
		onClick: fn(),
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");

		// スタイル計算値の検証 (グラデーション文字列が期待通りか)
		const style = window.getComputedStyle(button);
		// 注意: ブラウザによってスペースの入り方が異なる可能性があるため、含みで検証
		expect(style.background).toContain(
			"linear-gradient(to top, rgb(241, 196, 15) 30%, rgb(149, 165, 166) 30%)",
		);
		expect(style.width).toBe("200px");
	},
};

/**
 * チャージ完了状態 (100%)
 * 背景色が readyColor (#2ecc71) になり、立体感のある影が表示されることを検証します。
 */
export const Ready: Story = {
	args: {
		label: "出撃可能！",
		percent: 100,
		disabled: false,
		readyColor: "#2ecc71",
		gaugeColor: "#f1c40f",
		onClick: fn(),
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");

		const style = window.getComputedStyle(button);
		// 100%時は単色の背景色になる
		expect(style.backgroundColor).toBe("rgb(46, 204, 113)"); // #2ecc71
		expect(style.boxShadow).toContain("rgb(39, 174, 96) 0px 4px"); // 0 4px #27ae60
	},
};

/**
 * 無効状態 (チャージ完了しているがシステム的にロックされている場合)
 * ボタンが disabled 属性を持ち、クリック不可であることを検証します。
 */
export const Disabled: Story = {
	args: {
		label: "ロック中",
		percent: 100,
		disabled: true,
		readyColor: "#2ecc71",
		gaugeColor: "#f1c40f",
		onClick: fn(),
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");

		expect(button).toBeDisabled();
		const style = window.getComputedStyle(button);
		// 100%でも disabled ならグラデーション表示になる仕様
		expect(style.background).toContain(
			"linear-gradient(to top, rgb(241, 196, 15) 100%, rgb(149, 165, 166) 100%)",
		);
	},
};
