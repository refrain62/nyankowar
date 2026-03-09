import type { StageConfig } from "../../types/game";
import { stage1 } from "./stage1";
import { stage2 } from "./stage2";
import { stage3 } from "./stage3";
import { stage4 } from "./stage4";

/**
 * 全ステージのマスターリスト
 */
export const STAGES: Record<number, StageConfig> = {
	1: stage1,
	2: stage2,
	3: stage3,
	4: stage4,
};
