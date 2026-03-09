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
	it("percent=50を与えた際に、指定されたラベル 'Test Button' が描画されていること", () => {
		render(
			<GaugeButton
				label="Test Button"
				percent={50}
				onClick={() => {}}
				disabled={false}
				readyColor="green"
				gaugeColor="blue"
				width="100px"
			/>,
		);

		const label = screen.getByText("Test Button");
		expect(label).toBeInTheDocument();
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
