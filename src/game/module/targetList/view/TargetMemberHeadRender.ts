class TargetMemberHeadRender extends WorldBossHeadRender {

	public constructor() {
		super();
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	public dataChanged(): void {
		super.dataChanged();
		this.removeAttEffect();
	}

	public onTap(e: egret.TouchEvent): void {
		if (!isNaN(this.data)) {
			this.showEffect();
			SysSetting.ins().setValue("mapClickTx", 0);
			SysSetting.ins().setValue("mapClickTy", 0);

			//3v3战场攻击采集，则判断是否开始
			if (KfArenaSys.ins().isKFArena) {
				if (!KfArenaSys.ins().checkFBOperat(KfArenaSys.ins().flagHandle == parseInt(this.data)))return;
				let role: CharRole = EntityManager.ins().getNoDieRole();
				if (role && role.isSafety()) {
					let targetPos: XY = GlobalConfig.CrossArenaBase.readyPos[KfArenaSys.ins().readyIndex - 1].tranferPoint;
					GameMap.moveTo((targetPos.x + 0.5) * GameMap.CELL_SIZE >> 0, (targetPos.y) * GameMap.CELL_SIZE >> 0);
					//注册一个委托任务
					EntrustManager.ins().regEntrusTask(EntrustType.Transfer, this.touchDo, this);
					return;
				}
			}

			this.touchDo();
		}

	}

	private touchDo(): void {
		if (KFBossSys.ins().flagHandle == parseInt(this.data)) {
			if (KFBossSys.ins().flagCD - egret.getTimer() > 0) {
				UserTips.ins().showTips(`|C:${ColorUtil.RED}&T:旗子未刷新！|`);
			}
			else {
				KFBossSys.ins().sendCollectFlag();//跨服boss采旗
			}

		}
		else if (KfArenaSys.ins().flagHandle == parseInt(this.data)) {
			if (KfArenaSys.ins().flagCD - egret.getTimer() > 0) {
				UserTips.ins().showTips(`|C:${ColorUtil.RED}&T:天书未刷新！|`);
				return
			}

			KfArenaSys.ins().sendCollectFlag();//跨服竞技场采旗


		} else GameLogic.ins().postChangeAttrPoint(this.data);
	}
}