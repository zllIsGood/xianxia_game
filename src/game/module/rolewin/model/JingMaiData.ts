/**
 * name
 */
class JingMaiData {

	public level: number;
	public stage: number;

	constructor() {

	}

	parser(bytes: GameByteArray): void {
		this.level = bytes.readInt();
		this.stage = bytes.readInt();
	}

	public jingMaiCanUp(): boolean {
		let stagesConfig: JingMaiStageConfig = GlobalConfig.JingMaiStageConfig[this.stage];
		if(stagesConfig.stage >= GlobalConfig.JingMaiCommonConfig.stageMax) return false;

		let lvConfig: JingMaiLevelConfig = GlobalConfig.JingMaiLevelConfig[this.level];
		let count: number = UserBag.ins().getItemCountById(0, lvConfig.itemId);
		return count >= lvConfig.count;
	}
}