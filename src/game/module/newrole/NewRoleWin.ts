/**
 * 伙伴窗口
 */
class NewRoleWin extends BaseEuiView {

	public needTxt: eui.Label;
	public roles: eui.Component[];
	/** 性别按钮 */
	// public sexBtn0: eui.ToggleButton;
	// public sexBtn1: eui.ToggleButton;
	/** 开启按钮 */
	public openBtn: eui.Button;

	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	private roleBody: string[] = [
		"partner_wanyanzheng", //战士
		"partner_wenjing",//法师
		"partner_sikongqi"];//术士

	// private roleWeapon: string[] = [
	// 	"", //战士
	// 	"", //法师
	// 	""];//术士
	private rolePos: number[][] = [
		[60, 260, 1, 3],//x,y,scale,layer
		[-60, 340, 0.7, 2],
		[336, 340, 0.7, 2]
	];

	/** 当前选中的职业 */
	private _job: number;

	private beginPoint: number = 0;

	private stop: boolean;

	private canOpen: boolean;

	private roleGroup: eui.Group;
	constructor() {
		super();
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "OpenRoleSkin";

		this.roles = [this['role0'], this['role1'], this['role2']];

		// let element: Role = SubRoles.ins().getSubRoleByIndex(0);
		// if (element && element.sex) {
		// 	this.sexBtn0.selected = true;
		// 	this.sexBtn1.selected = false;
		// } else {
		// 	this.sexBtn0.selected = false;
		// 	this.sexBtn1.selected = true;
		// }
		this.updateRole();
	}

	private updateRole(): void {
		for (let i = 0; i < this.roles.length; i++) {
			this.setRole(this.roles[i], i);
		}
	}

	private setRole(role: eui.Component, job: number): void {
		// let sex: number = this.sexBtn0.selected ? 0 : 1;
		// role['weapon'].source = this.roleWeapon[job];
		role['job'].source = JobTitleImg[job + 1];

		let b: boolean;
		let len: number = SubRoles.ins().subRolesLen;
		for (let i = 0; i < len; i++) {
			let element: Role = SubRoles.ins().getSubRoleByIndex(i);
			if (element.job == job + 1) {
				b = true;
				// sex = element.sex;
				break;
			}
		}
		role['body'].source = this.roleBody[job];
		role['openedImg'].visible = b;
	}

	private setNeedTxt(): void {
		let openIndex: number = SubRoles.ins().subRolesLen;
		let config: NewRoleConfig = GlobalConfig.NewRoleConfig[openIndex];
		let str: string = "";
		let color: number;
		let meetVIP: boolean;
		if (config.zsLevel) {
			str = `${config.zsLevel}转`;
			this.canOpen = UserZs.ins().lv >= config.zsLevel;
			color = this.canOpen ? 0x35e62d : 0xf3311e;
			str = `<font color="#${color.toString(16)}">${str}</font>`;
		}
		else {
			str = `${config.level}级`;
			this.canOpen = Actor.level >= config.level;
			color = this.canOpen ? 0x35e62d : 0xf3311e;
			str = `<font color="#${color.toString(16)}">${str}</font>`;
		}
		if (config.vip) {
			meetVIP = (UserVip.ins().lv >= config.vip);
			this.canOpen = this.canOpen || meetVIP;
			color = meetVIP ? 0x35e62d : 0xf3311e;
			str = str + ` 或 <font color="#${color.toString(16)}">${UserVip.formatLvStr(config.vip)}</font>`;
		}
		this.needTxt.textFlow = (new egret.HtmlTextParser()).parser(`解锁需要：${str}`);
	}

	private selectJob(job: number, teleport: boolean = false): void {
		for (let i: number = 0; i < 3; i++) {
			let index: number = (job + job + i) % 3;
			if (teleport) {
				this.roles[i].x = this.rolePos[index][0];
				this.roles[i].y = this.rolePos[index][1];
				this.roles[i].scaleX = this.roles[i].scaleY = this.rolePos[index][2];
			}
			else {
				egret.Tween.removeTweens(this.roles[i]);
				let t: egret.Tween = egret.Tween.get(this.roles[i]);
				t.to({
					x: this.rolePos[index][0],
					y: this.rolePos[index][1],
					scaleX: this.rolePos[index][2],
					scaleY: this.rolePos[index][2]
				}, 500).call(() => {
					this.roles[i].touchEnabled = index != 0;

				}, this);
			}
			if (index == 0) {
				this.roleGroup.addChild(this.roles[i]);
				this.openBtn.visible = !this.roles[i]['openedImg'].visible;
			}
		}
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this, this.onTap);
		this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
		this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMove, this);

		this.updateRole();
		this.setNeedTxt();

		let arr: number[] = [0, 1, 2];
		let len: number = SubRoles.ins().subRolesLen;
		for (let i = 0; i < len; i++) {
			let element: Role = SubRoles.ins().getSubRoleByIndex(i);
			let index: number = arr.indexOf(element.job - 1);
			if (index > -1)
				arr.splice(index, 1);
		}
		this.job = arr[0];
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this, this.onTap);
		this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
		this.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMove, this);
	}

	private onBegin(e: egret.TouchEvent): void {
		if (this.stop) return;
		this.beginPoint = e.stageX;
	}
	private onMove(e: egret.TouchEvent): void {

		if (this.beginPoint == 0)
			return;
		//取触控点移动的偏移量
		let offset: number = e.stageX - this.beginPoint;
		if (Math.abs(offset) < 5)
			return;
		//计算下一职业
		let nextJob: number = this.job - (offset / Math.abs(offset));
		nextJob = nextJob > 2 ? nextJob - 3 : (nextJob < 0 ? nextJob + 3 : nextJob);

		this.addTouchEndEvent(this, this.onEnd);

		if (Math.abs(offset) >= 120) {
			this.job = nextJob;
			this.beginPoint = 0;
			this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onEnd, this);
			return;
		}

		for (let i = 0; i < 3; i++) {
			let element: eui.Component = this.roles[i];
			//计算下一索引
			let nextIndex: number = (nextJob + nextJob + i) % 3;
			//记录当前索引
			let curIndex: number = (this.job + this.job + i) % 3;
			let radian: number = MathUtils.getRadian2(
				this.rolePos[curIndex][0], this.rolePos[curIndex][1],
				this.rolePos[nextIndex][0], this.rolePos[nextIndex][1]);
			let angle: number = MathUtils.getAngle(radian);
			let p = MathUtils.getDirMove(angle, Math.abs(offset));
			element.x = this.rolePos[curIndex][0] + p.x;
			element.y = this.rolePos[curIndex][1] + p.y;

			let scale: number = Math.abs(offset) / MathUtils.getDistance(this.rolePos[curIndex][0], this.rolePos[curIndex][1], this.rolePos[nextIndex][0], this.rolePos[nextIndex][1]);
			element.scaleX = element.scaleY = this.rolePos[curIndex][2] - (this.rolePos[curIndex][2] - this.rolePos[nextIndex][2]) * scale;
		}
	}
	private onEnd(e: egret.TouchEvent): void {
		this.job = this.job;
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onEnd, this);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.openBtn:
				if (!this.canOpen) {
					// UserTips.ins().showTips("|C:0xf3311e&T:不满足解锁条件|");
					let openIndex: number = SubRoles.ins().subRolesLen;
					let config: NewRoleConfig = GlobalConfig.NewRoleConfig[openIndex];
					let win = WarnWin.show(`VIP等级不足，${UserVip.formatLvStr(config.vip)}可以提前开启第${openIndex + 1}角色，是否前往开启？`, null, null,
						() => {
							ViewManager.ins().open(VipWin, config.vip);
						}, this);
					win.setBtnLabel(`取消`, `前往`);
					return;
				}
				if(UserTask.ins().taskTrace.id < 100023){
					UserTips.ins().showTips("请完成新手任务后再开启");
					return;
				}
				GameLogic.ins().sendNewRole(this.job + 1, this.sex);
				ViewManager.ins().close(LimitTaskView);
			//创建之后关闭界面
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;

			// case this.sexBtn0:
			// 	this.sexBtn1.selected = false;
			// 	this.updateRole();
			// 	break;
			// case this.sexBtn1:
			// 	this.sexBtn0.selected = false;
			// 	this.updateRole();
			// 	break;

			default:
				let index: number = this.roles.indexOf(e.target);
				if (index > -1 && !this.stop) {
					this.job = index;
				}
		}
	}

	public get job(): number {
		return this._job;
	}
	public set job(value: number) {
		this._job = value;

		this.stop = true;

		this.selectJob(value);

		TimerManager.ins().doTimer(500, 1, () => {
			this.stop = false;
		}, this);
	}

	private get sex(): number {
		return [0, 0, 1, 1][this.job + 1];
	}

	public static openCheck(...param): boolean {
		if (SubRoles.ins().subRolesLen >= 3) {
			return false;
		} else {
			ViewManager.ins().close(LiLianWin);
			// ViewManager.ins().close(LimitTaskView);
			return true;
		}

	}
}
ViewManager.ins().reg(NewRoleWin, LayerManager.UI_Main);