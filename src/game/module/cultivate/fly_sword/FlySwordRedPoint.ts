class FlySwordRedPoint extends BaseSystem {

	public totalRedPoint: boolean[] = [];
	public levelRedPoint: boolean[][] = [];
	public appearanceRedPoint: boolean[][] = [];

	public constructor() {
		super();

		this.associated(
			this.postTotalRedPoint,
			this.postLevelRedPoint,
			this.postAppearanceRedPoint,
		);

		this.associated(
			this.postLevelRedPoint,
			Actor.ins().postLevelChange,
			UserBag.ins().postItemAdd,
			UserBag.ins().postItemDel,
			GameLogic.ins().postChildRole,
			FlySword.ins().postData,
			FlySword.ins().postUserDan,
			FlySword.ins().postUpgradeLevel,
			FlySword.ins().postOpenFlySword,
		);

		this.associated(
			this.postAppearanceRedPoint,
			UserBag.ins().postItemAdd,
			UserBag.ins().postItemDel,
			GameLogic.ins().postChildRole,
			FlySword.ins().postData,
			FlySword.ins().postActivation,
			FlySword.ins().postUpgradeLevel,
			FlySword.ins().postOpenFlySword,
			FlySword.ins().postChangeAppearance,
		);
	}

	public static ins(): FlySwordRedPoint {
		return super.ins() as FlySwordRedPoint;
	}

	@callLater
	public postTotalRedPoint(): void {
		this.totalRedPoint = [false, false, false];
		if (FlySword.ins().isOpen()) {
			for (let i: number = 0; i < 3; i++) {
				let model = FlySword.ins().getModel(i);
				if (!model)
					continue;
				this.totalRedPoint[i] = this.levelRedPoint[i].concat(this.appearanceRedPoint[i]).indexOf(true) != -1;
			}
		}
	}

	@callLater
	public postLevelRedPoint(): void {
		for (let i: number = 0; i < 3; i++) {
			let model = FlySword.ins().getModel(i);
			this.levelRedPoint[i] = [];
			this.levelRedPoint[i][CultivateDanType.Level] = model ? model.levelModel.levelData.getIsUpgrade() || FlySword.ins().isCanOpen(i) : false;
			this.levelRedPoint[i][CultivateDanType.Growth] = model ? model.levelModel.growthData.isCanUpgrade() : false;
			this.levelRedPoint[i][CultivateDanType.Qualification] = model ? model.levelModel.qualificationData.isCanUpgrade() : false;
		}
	}

	@callLater
	public postAppearanceRedPoint(): void {
		for (let i: number = 0; i < 3; i++) {
			let model = FlySword.ins().getModel(i);
			this.appearanceRedPoint[i] = model ? model.appearanceModel.getAllCanActivationState() : [];
		}
	}

}

namespace GameSystem {
	export let  flySwordRedPoint = FlySwordRedPoint.ins.bind(FlySwordRedPoint);
}