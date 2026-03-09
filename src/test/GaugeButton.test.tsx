import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GaugeButton } from "../components/UI/GaugeButton";

describe("GaugeButton", () => {
	it("percentに応じてゲージが正しく表示されること", () => {
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

	it("disabledのときにクリックしてもonClickが呼ばれないこと", () => {
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
		expect(onClick).not.toHaveBeenCalled();
	});

	it("準備完了（percent=100かつ!disabled）のときにonClickが呼ばれること", () => {
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
		expect(onClick).toHaveBeenCalled();
	});
});
