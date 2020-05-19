/**
 *
 * @author
 *
 */
class VipWin extends BaseEuiView {
	private titleLabel: eui.Label;
	// private nameLabel: eui.Label;
	private depictLabel: eui.Label;
	private topUpBtn: eui.Button;
	private leftBtn: eui.Button;
	private rightBtn: eui.Button;
	private suerBtn: eui.Button;
	private suerBtn0: eui.Button;

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;

	private vipImg: eui.Image;
	private more: eui.Label;
	private show: eui.Label;
	// private vipnum: eui.Image;
	// private nextVipImg: eui.Image;
	private list: eui.List;
	private list0: eui.List;
	private titleText: eui.Label;
	// private curVip: egret.DisplayObjectContainer;
	// private nextVip: egret.DisplayObjectContainer;
	// private titleVip: egret.DisplayObjectContainer;

	private barbc: eui.ProgressBar;
	private topGroup: eui.Group;
	private mc: MovieClip;				   //特效
	private mc1: MovieClip;				   //特效
	private _curLv: number = 0;

	private vipGroup: eui.Group;
	private vipValue: eui.BitmapLabel;

	public vipimg:eui.Image;

	constructor() {
		super();
		this.skinName = "VipSkin";
		// this.setSkinPart("roleSelect", new RoleSelectPanel());
		
		/** 初始化进度条数值 */
		this.barbc.value = 0;
	}

	public initUI(): void {
		super.initUI();

		this.isTopLevel = true;

		this.list.itemRenderer = ItemBase;
		this.list0.itemRenderer = ItemBase;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.topUpBtn, this.onTap);
		this.addTouchEvent(this.leftBtn, this.onTap);
		this.addTouchEvent(this.rightBtn, this.onTap);
		this.addTouchEvent(this.suerBtn, this.onTap);
		this.addTouchEvent(this.suerBtn0, this.onTap);
		let userVip = UserVip.ins();
		this.observe(userVip.postUpdataExp, this.changeExpBar);
		this.observe(userVip.postUpdateVipAwards, this.changeAwards);
		this.observe(userVip.postUpdateVipData, this.changeAwards);
		this.observe(userVip.postUpdateWeekAwards, this.changeAwards);

		this.topUpBtn.visible = WxTool.shouldRecharge();
		this.barbc.labelDisplay.visible = true;
		
		this.changeExpBar();
		this.changeAwards();

		this._curLv = param[0] ? param[0] : this.getVipLevel();

		let playPunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if (playPunView) {
			if (playPunView.vip.visible)
				this._curLv = 3;//死亡引导强制设置vip3
			playPunView.preVip = playPunView.vip.visible = false;
		}

		if (this._curLv) {
			let config: VipConfig = GlobalConfig.VipConfig[this._curLv];
			this.showVipInfo(config);
		}
	}
	private getVipLevel() {
		//检查直至当前vip为止 有没有没领取的vip的对应奖励 优先跳转
		let userVip = UserVip.ins();
		if (userVip.lv) {
			for (let i = 0; i < userVip.lv; i++) {
				if (!((userVip.state >> i) & 1)) {
					return i + 1;
				}
			}
		}
		//全部都领取完
		let maxVipLevel = Object.keys(GlobalConfig.VipConfig).length;
		if (userVip.lv >= maxVipLevel - 1)
			return maxVipLevel;
		return userVip.lv + 1;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.topUpBtn, this.onTap);
		this.removeTouchEvent(this.leftBtn, this.onTap);
		this.removeTouchEvent(this.rightBtn, this.onTap);
		this.removeTouchEvent(this.suerBtn, this.onTap);

		this.removeObserve();
	}

	private onTap(e: egret.TouchEvent): void {
		let config: VipConfig;
		let vim = ViewManager.ins();
		switch (e.currentTarget) {
			case this.closeBtn:
			case this.closeBtn0:
				vim.close(VipWin);
				break;
			case this.topUpBtn://充值
				vim.close(VipWin);
				if(WxTool.shouldRecharge()) {
					let rdata: RechargeData = Recharge.ins().getRechargeData(0);
					if (!rdata || rdata.num != 2) {
						ViewManager.ins().open(Recharge1Win);
					} else {
						ViewManager.ins().open(ChargeFirstWin);
					}
				}
				break;
			case this.leftBtn://左切页按钮
				config = GlobalConfig.VipConfig[--this._curLv];
				this.showVipInfo(config);
				break;
			case this.rightBtn://右切页按钮
				config = GlobalConfig.VipConfig[++this._curLv];
				this.showVipInfo(config);
				break;
			case this.suerBtn://领取
				config = GlobalConfig.VipConfig[this._curLv];
				let num: number = 0;
				//let showIndex: number = SubRoles.ins().getSubRoleByIndex(0).job;
				let awards: RewardData[] = config.awards;
				let len: number = awards.length;
				for (let i: number = 0; i < len; i++) {
					if (awards[i].type == 1 && awards[i].id < 200000)
						num++;
				}
				if (UserBag.ins().getSurplusCount() >= num)
					UserVip.ins().sendGetAwards(this._curLv);
				else
					UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请清理背包|"); 
				break;
			case this.suerBtn0:
				UserVip.ins().sendGetWeekAwards();
				break;
		}

	}

	private showVipInfo(config: VipConfig): void {
		if (config) {
			this.setAwards(config);
		} else {
			this._curLv = UserVip.ins().lv;
		}
		this.changeBtn();
	}

	/**经验进度条改变 */
	private changeExpBar(): void {
		let vipData: UserVip = UserVip.ins();
		let config: VipConfig = GlobalConfig.VipConfig[vipData.lv];
		let curLv: number = 0;
		let curNeedYb: number = vipData.exp;
		if (config) {
			curLv = vipData.lv;
			// BitmapNumber.ins().changeNum(this.curVip, curLv, "5");
		}
		let nextConfig: VipConfig = GlobalConfig.VipConfig[curLv + 1];
		let nextNeedYb: number = 0;
		let ybValue: number = 0;
		let str: string = "";
		 
		
		if (nextConfig) {
			nextNeedYb = nextConfig.needYb - curNeedYb;
			// BitmapNumber.ins().changeNum(this.nextVip, vipData.lv + 1, "5");
			str = "再充值|C:0xFFAA24&T:" + nextNeedYb + "元宝|成为" + (UserVip.formatLvStr(vipData.lv + 1));
			this.barbc.maximum = nextConfig.needYb;
			this.barbc.value = curNeedYb;
		} else {
			// this.nextVip.visible = false;
			str = "VIP等级已满";
			this.barbc.maximum = config.needYb;
			this.barbc.value = config.needYb;
		}
		this.titleLabel.textFlow = TextFlowMaker.generateTextFlow(str);


		config = GlobalConfig.VipConfig[this._curLv];
		this.showVipInfo(config);
	}

	/**奖励改变 */
	private changeAwards(): void {
		let config: VipConfig;
		this._curLv = UserVip.ins().lv;
		if (this._curLv >= 0) {
			for (let i: number = 0; i < this._curLv; i++) {
				if (!this.getRemindByIndex(i) /**|| this.checkWeekReward(i)*/) {
					config = GlobalConfig.VipConfig[i + 1];
					this._curLv = i + 1;
					this.setAwards((config) ? config : GlobalConfig.VipConfig[--this._curLv]);
					// this._curLv = i + 1;
					this.changeBtn();
					return;
				}
			}
			config = GlobalConfig.VipConfig[++this._curLv];
			this.setAwards((config) ? config : GlobalConfig.VipConfig[--this._curLv]);
			this.changeBtn();
		}
	}

	/**设置领取奖励按钮状态 */
	private setAwards(config: VipConfig): void {
		// BitmapNumber.ins().changeNum(this.titleVip, config.id, "5");
		this.depictLabel.textFlow = TextFlowMaker.generateTextFlow(config.description);
		// let showIndex: number = SubRoles.ins().getSubRoleByIndex(0).job;
		this.list.dataProvider = new eui.ArrayCollection(config.awards);
		this.list0.dataProvider = new eui.ArrayCollection(config.weekReward);

		this.vipImg.source = config.vipImg;

		let userVip = UserVip.ins();
		let curNeedYb: number = userVip.exp;
		let needYb: number = config.needYb - curNeedYb;
		let str: string = "";
		if (needYb > 0) {
			str = "再充值|C:0xFFAA24&T:" + needYb + "元宝|成为" + UserVip.formatLvStr(config.id);
		} else {
			str = "";
		}
		this.more.textFlow = TextFlowMaker.generateTextFlow1(str);

		let str1 = needYb > 0 ? `充值|C:0x3AF20C&T:${config.needYb}元宝|成为${UserVip.formatLvStr(config.id)}` : `${UserVip.formatLvStr(config.id)}特权:`;
		this.show.textFlow = TextFlowMaker.generateTextFlow1(str1);

		this.vipValue.text = userVip.lv + "";//<= 3 ? userVip.lv + "" : (userVip.lv - 3) + "";
		this.vipimg.source = userVip.lv <= 3 ? "HHVip_png" : "ZZVip_png"

		this.titleText.text = `${UserVip.formatLvStr(this._curLv)}特权`
		this.suerBtn.visible = false;
		this.suerBtn.enabled = false;
		if (this.mc) {
			DisplayUtils.removeFromParent(this.mc);
		}
		if (this.mc1) {
			DisplayUtils.removeFromParent(this.mc1);
		}

		if (this.getRemindByIndex(config.id - 1)) {
			this.suerBtn.visible = true;
			this.suerBtn.label = "已领取";
		} else {
			if (userVip.lv >= config.id) {
				this.suerBtn.visible = true;
				this.suerBtn.enabled = true;
				this.suerBtn.label = "领取";
				this.mc = this.mc || new MovieClip;
				this.mc.x = 80;
				this.mc.y = 30;
				// this.mc.scaleX = 0.6;
				// this.mc.scaleY = 0.85;
				this.mc.playFile(RES_DIR_EFF + 'chargebtn', -1);
				this.suerBtn.addChild(this.mc);
			}
		}

		if (userVip.lv == config.id) {
			this.suerBtn0.visible = true;
			if (userVip.weekState == 0) {
				this.suerBtn0.enabled = false;
				this.suerBtn0.label = "已领取";
			} else {
				this.suerBtn0.enabled = true;
				this.suerBtn0.label = "领取";
				this.mc1 = this.mc1 || new MovieClip;
				this.mc1.x = 80;
				this.mc1.y = 30;
				// this.mc1.scaleX = 0.6;
				// this.mc1.scaleY = 0.85;
				this.mc1.playFile(RES_DIR_EFF + 'chargebtn', -1);
				this.suerBtn0.addChild(this.mc1);
			}
		} else {
			this.suerBtn0.visible = false;
			this.suerBtn0.label = "领取";
		}
	}

	/**true已领取 false未领取 */
	private getRemindByIndex(index: number): boolean {
		let uservip = UserVip.ins();
		let state = uservip.state;
		if (uservip.lv <= 0) return false;
		return ((state >> index) & 1) == 1;
	}

	private checkWeekReward(index: number): boolean {
		let userVip = UserVip.ins();
		if (userVip.lv <= 0) return false;
		return (index + 1 == userVip.lv && userVip.weekState == 1);
	}

	private changeBtn(): void {
		if (this._curLv > 1) {
			this.leftBtn.visible = true;
			this.rightBtn.visible = true;
			if (this._curLv >= CommonUtils.getObjectLength(GlobalConfig.VipConfig))
				this.rightBtn.visible = false;
		} else if (this._curLv <= 1) {
			this.leftBtn.visible = false;
			this.rightBtn.visible = true;
		}
	}
}

ViewManager.ins().reg(VipWin, LayerManager.UI_Popup);
