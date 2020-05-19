/* 新手引导配置 */
interface GuideConfig {
	guideId: number;
	stepId: number;
	type: number;//0：强制引导 1：非强制引导
	start: GuideCondition;
	overs: GuideCondition[];
	view: string;
	target: string;
	tips: string;
	direction: number;
}