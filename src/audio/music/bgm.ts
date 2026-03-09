import { playStage1 } from "./bgm/stage1";
import { playStage2 } from "./bgm/stage2";
import { playStage3 } from "./bgm/stage3";
import { playStage4 } from "./bgm/stage4";

/**
 * 【責任】ステージBGMの再生統制。
 * ゲームループから渡される「step」カウントに基づき、
 * 各ステージ専用のシーケンサーを駆動します。
 */
export const playBgmStep = (
	ctx: AudioContext,
	stageId: number,
	step: number,
) => {
	// ステージIDに応じたBGM関数を呼び出し
	switch (stageId) {
		case 1:
			playStage1(ctx, step);
			break;
		case 2:
			playStage2(ctx, step);
			break;
		case 3:
			playStage3(ctx, step);
			break;
		case 4:
			playStage4(ctx, step);
			break;
		default:
			playStage1(ctx, step);
	}
};
