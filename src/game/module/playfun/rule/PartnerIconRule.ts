/**
 * Created by Administrator on 2016/7/21.
 */
class PartnerIconRule extends RuleIconBase {
	private firstTap: boolean = true;
	private img: eui.Image;
	constructor(t: egret.DisplayObjectContainer) {
		super(t);
		this.updateMessage = [
			Actor.ins().postLevelChange,
			GameLogic.ins().postChildRole,
			UserTask.ins().postUpdteTaskTrace
		];
	}

	checkShowIcon(): boolean {
		return UserTask.ins().taskTrace.id > 100015 && SubRoles.ins().subRolesLen < 3;
	}

	checkShowRedPoint(): number {
		if (this.firstTap && SubRoles.ins().subRolesLen == 1) {
			this.img == void 0 && (this.img = new eui.Image("swyd_huoban_png"));
			this.img.x = 60;
			this.img.y = -50;
			this.tar.addChild(this.img)
		} else if (this.img) {
			DisplayUtils.removeFromParent(this.img);
			this.img = null;
		}
		let count: number = SubRoles.ins().subRolesLen;
		let config: NewRoleConfig = GlobalConfig.NewRoleConfig[count];
		if (!config)
			return 0;
		let lv: number = config.zsLevel ? UserZs.ins().lv : Actor.level;
		let configLv: number = config.zsLevel ? config.zsLevel : config.level;
		if (lv >= configLv || UserVip.ins().lv >= config.vip)
			return UserTask.ins().taskTrace.id < 100023 ? 0 : 1;
		return 0;
	}


	tapExecute(): void {
		ViewManager.ins().open(NewRoleWin);
		this.firstTap = false;
		this.checkShowRedPoint();
	}

	getEffName(redPointNum: number): string {
		if (this.firstTap) {
			this.effX = 38;
			this.effY = 55;
			return "actIconCircle";
		}
		return undefined;
	}
}