import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ControlPanel } from "../components/UI/ControlPanel";
import { TitleOverlay } from "../components/UI/TitleOverlay";

describe("UI Components", () => {
	it("TitleOverlay: クリックするとonStartが呼ばれること", () => {
		const onStart = vi.fn();
		render(<TitleOverlay onStart={onStart} />);
		fireEvent.click(screen.getByText("CLICK TO START"));
		expect(onStart).toHaveBeenCalled();
	});

	it("ControlPanel: お金が足りないボタンがdisabledになること", () => {
		const onSpawn = vi.fn();
		const onUpgrade = vi.fn();
		const onCannon = vi.fn();
		const mockUi = {
			money: 0, // お金がない
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

		// BASICボタン（$50）はdisabled
		const spawnButton = screen.getByText(/\$50/).closest("button");
		expect(spawnButton).toBeDisabled();

		// アップグレードボタン（$200）もdisabled
		const upgradeButton = screen.getByText(/働きネコ/).closest("button");
		expect(upgradeButton).toBeDisabled();
	});
});
