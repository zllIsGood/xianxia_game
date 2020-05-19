/**
 * 主城入口
 */
class CityIconRule extends RuleIconBase {
	public constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Actor.ins().postLevelChange,
		];
	}

	checkShowIcon(): boolean {
		return OpenSystem.ins().checkSysOpen(SystemType.CITYMONSTER) && !CityCC.ins().isCity && !GameLogic.IS_OPEN_SHIELD;
	}

	checkShowRedPoint(): number {
		return 0;
	}

	tapExecute(): void {
		if (!GameServer.serverOpenDay) {
			UserTips.ins().showTips(`|C:0xff0000&T:暂未开放，开服第二天开启`);
			return;
		}
		if (!OpenSystem.ins().checkSysOpen(SystemType.CITY))
			return;



		if (CityCC.ins().enterCD < 1) {
			CityCC.ins().sendEnter();
		}
		else
			UserTips.ins().showTips(`冷却中，${CityCC.ins().enterCD}秒后可进入主城`);
	}

	getEffName(redPointNum: number): string {
		return undefined;
	}
}