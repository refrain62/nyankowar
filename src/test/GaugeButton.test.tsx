import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GaugeButton } from "../components/UI/GaugeButton";

/**
 * 【責任】ゲージ付きボタンコンポーネントの表示状態とユーザーインタラクションの検証。
 * 「正しく」などの表現を排除し、レンダリングされた要素の有無やプロパティの状態で期待値を定義します。
 */
describe("GaugeButton", () => {
	/**
	 * percent 引数による表示検証。
	 * 期待値: 指定されたラベル "Test Button" がドキュメント内に 1つ存在すること。
	 */
	/**
	 * 背景グラデーション（ゲージの高さ）の CSS 検証。
	 * 期待値:
	 * 1. percent=30 のとき、background プロパティが 'linear-gradient(to top, blue 30%, rgb(149, 165, 166) 30%)' と一致すること。
	 * 2. percent=100 のとき、background プロパティが readyColor ('green') と一致すること。
	 */
	it("percent=30のとき、背景グラデーションのCSSが正確に30%の高さで描画されていること", () => {
		render(
			<GaugeButton
				label="30% Button"
				percent={30}
				onClick={() => {}}
				disabled={false}
				readyColor="green"
				gaugeColor="blue"
				width="100px"
			/>,
		);

		const button = screen.getByRole("button");
		// JSDOMは #95a5a6 を rgb(149, 165, 166) に変換するため、rgb表記で検証
		expect(button.style.background).toBe(
			"linear-gradient(to top, blue 30%, rgb(149, 165, 166) 30%)",
		);
	});

	it("percent=100のとき、背景が単色の readyColor ('green') に切り替わること", () => {
		render(
			<GaugeButton
				label="100% Button"
				percent={100}
				onClick={() => {}}
				disabled={false}
				readyColor="green"
				gaugeColor="blue"
				width="100px"
			/>,
		);

		const button = screen.getByRole("button");
		expect(button.style.background).toBe("green");
	});

	/**
	 * disabled 時のクリック防止検証。
	 * 期待値:
	 * 1. button 要素に disabled 属性が付与されていること。
	 * 2. クリックイベントを発火させても、onClick コールバックが 0回呼び出されること。
	 */
	it("disabled=trueのときに、button要素が非活性状態であり、クリックしてもonClickが1回も呼ばれないこと", () => {
		const onClick = vi.fn();
		render(
			<GaugeButton
				label="Disabled Button"
				percent={100}
				onClick={onClick}
				disabled={true}
				readyColor="green"
				gaugeColor="blue"
				width="100px"
			/>,
		);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledTimes(0);
	});

	/**
	 * 準備完了時のクリック検証。
	 * 期待値:
	 * 1. button 要素に disabled 属性が付与されていないこと。
	 * 2. クリックイベントを発火させた際に、onClick コールバックが 1回呼び出されること。
	 */
	it("準備完了（percent=100かつ!disabled）のときに、button要素が活性状態であり、クリック時にonClickが1回呼ばれること", () => {
		const onClick = vi.fn();
		render(
			<GaugeButton
				label="Ready Button"
				percent={100}
				onClick={onClick}
				disabled={false}
				readyColor="green"
				gaugeColor="blue"
				width="100px"
			/>,
		);

		const button = screen.getByRole("button");
		expect(button).not.toBeDisabled();
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
