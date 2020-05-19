/**
 * Created by MPeter on 2018/1/18.
 * 跨服副本-跨服boss
 */
class KFBossWin extends BaseEuiView {
	/**采旗次数 */
	private flagTimes: eui.Label;
	/**boss次数 */
	private bossTimes: eui.Label;

	private seeRule: eui.Button;
	private closeBtn: eui.Button;

	//入口组件
	private island0: eui.Component;
	private island1: eui.Component;
	private island2: eui.Component;
	private island3: eui.Component;
	private island4: eui.Component;
	private island5: eui.Component;
	private island6: eui.Component;
	private island7: eui.Component;

	private MAX: number = 8;

	public constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = `KFBossSkin`;

		this.MAX = CommonUtils.getObjectLength(GlobalConfig.CrossBossConfig);

		//初始赋值图标
		for (let i: number = 1; i <= this.MAX; i++) {
			this[`island${i}`].island.source = `kf_boss_area${i}`;
			this[`island${i}`].touchChildren = false;
			// this[`island${i}`].touchEnabled = false;
			this[`island${i}`].filters = FilterUtil.ARRAY_GRAY_FILTER;
			let dp = GlobalConfig.CrossBossConfig[i];
			let zsLvlimit: number[] = [dp.levelLimit[0] / 1000 >> 0, dp.levelLimit[1] / 1000 >> 0];
			this[`island${i}`].info.text = `${zsLvlimit[0]}转-${zsLvlimit[1]}转`;
			this[`island${i}`].info.textColor = zsLvlimit[0] <= UserZs.ins().lv && UserZs.ins().lv <= zsLvlimit[1] ? ColorUtil.GREEN : ColorUtil.RED;
			this[`island${i}`].serverInfo.visible = false;
		}
	}
	public open(...param): void {
		this.addTouchEvent(this, this.onTouch);
		this.observe(KFBossSys.ins().postBossInfo, this.refData);
		this.observe(KFBossSys.ins().postBossRevive, this.refData);
		this.observe(KFBossRedpoint.ins().postRedPoint, this.refRedpoint);
		this.upCurState();

		KFBossSys.ins().sendBossInfo();
	}

	public close(...param): void {
		TimerManager.ins().removeAll(this);
	}
	/**更新当前状态 后面会有多种状态*/
	private upCurState(): void {
		if (KFBossSys.ins().fbInfo[6]) this.currentState = `6`;
		else if (KFBossSys.ins().fbInfo[7]) this.currentState = `7`;
		else this.currentState = `5`;

		this.refData();
		this.refRedpoint();
	}
	@callLater
	private refData(): void {
		this.flagTimes.text = KFBossSys.ins().flagTimes + "";
		this.bossTimes.text = KFBossSys.ins().bossTimes + "";

		//////////////////////////////////////////////
		//刷新各个入口的数据
		for (let info of KFBossSys.ins().fbInfo) {
			if (!info) continue;
			let index: number = info.dpId;
			if (this[`island${index}`]) {
				let dp = GlobalConfig.CrossBossConfig[info.dpId];
				// this[`island${index}`].info.text = `${dp.levelLimit[0]}转-${dp.levelLimit[1]}转`;
				this[`island${index}`].serverInfo.visible = true;
				this[`island${index}`].headGroup.visible = false;
				this[`island${index}`].head.source = ``;
				this[`island${index}`].name = info.dpId;
				this[`island${index}`].filters = [];
				// this[`island${index}`].touchEnabled = true;
				if (info.serverId) {
					this[`island${index}`].serverInfo.visible = true;
					this[`island${index}`].serverName.text = `${info.serverId == LocationProperty.srvid ? `本服` : `S.${info.serverId}服`}`;
					if (info.serverId == LocationProperty.srvid) {
						this[`island${index}`].headGroup.visible = true;
						let roleData: Role = SubRoles.ins().getSubRoleByIndex(0);
						this[`island${index}`].head.source = `main_role_head${roleData.job}`;
					}
					else this[`island${index}`].serverName.x = 13;

				}
				else this[`island${index}`].serverInfo.visible = false;

			}
		}

		TimerManager.ins().remove(this.onTimer, this);
		TimerManager.ins().doTimer(1000, 0, this.onTimer, this);
		this.onTimer();
	}
	private onTimer(): void {
		for (let info of KFBossSys.ins().fbInfo) {
			if (!info) continue;
			if (info.bossRefTimer == 0) continue;
			let dp = GlobalConfig.CrossBossConfig[info.dpId];
			let t: number = (info.bossRefTimer - egret.getTimer()) / 1000 >> 0;
			let time: string = "";
			if (t > 0) time = "\n" + DateUtils.getFormatBySecond(t);

			this[`island${info.dpId}`].info.text = `${dp.levelLimit[0] / 1000 >> 0}转-${dp.levelLimit[1] / 1000 >> 0}转` + time;

		}
	}
	@callLater
	private refRedpoint(): void {
		for (let info of KFBossSys.ins().fbInfo) {
			if (!info) continue;
			if (this[`island${info.dpId}`]) {
				this[`island${info.dpId}`].redPoint.visible = KFBossRedpoint.ins().redpoints[info.dpId];
			}
		}
	}
	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.seeRule:
				ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[34].text);
				break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			default:
				if (e.target instanceof eui.Component) {
					let fbId: number = parseInt(e.target.name);
					if (!fbId) {
						UserTips.ins().showTips(`|C:0xf3311e&T:暂未开启!`);
						return;
					}

					// if (e.target[`info`].textColor == ColorUtil.RED) {
					// 	UserTips.ins().showTips(`|C:0xf3311e&T:条件不足，无法进入!`);
					// 	return;
					// }

					ViewManager.ins().open(KFBossShowWin,fbId);
				}

		}
	}

	public static openCheck(...param: any[]): boolean {
		let boo: boolean = KFBossSys.ins().isOpen();
		if (!boo) UserTips.ins().showTips(`|C:0xf3311e&T:条件不够，不可进入`);
		return boo;
	}


}

ViewManager.ins().reg(KFBossWin, LayerManager.UI_Main);
