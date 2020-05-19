class WeiWangPanel extends BaseEuiView {

	public roleSelect: BaseComponent;
	public dinghong: eui.Group;
	public getItemTxt: eui.Label;
	public findItemTxt: eui.Label;
	public title2: eui.Image;
	public name2: eui.Label;
	public praiseGroup2: eui.Group;
	public wingImg2: eui.Image;
	public weaponImg2: eui.Image;
	public bodyImg2: eui.Image;
	public title1: eui.Image;
	public name1: eui.Label;
	public praiseGroup1: eui.Group;
	public wingImg1: eui.Image;
	public weaponImg1: eui.Image;
	public bodyImg1: eui.Image;
	public title0: eui.Image;
	public name0: eui.Label;
	public praiseGroup0: eui.Group;
	public wingImg0: eui.Image;
	public weaponImg0: eui.Image;
	public bodyImg0: eui.Image;
	public closeBtn: eui.Button;
	public deter: eui.Image;
	public checkBtn: eui.Button;
	public attrGroup: eui.Group;
	public notMaxGroup: eui.Group;
	public curAtt: eui.Label;
	public nextAtt: eui.Label;
	public cursor: eui.Image;
	public maxShowGroup: eui.Group;
	public maxCurAtt: eui.Label;
	public barGroup: eui.Group;
	public expBar: eui.ProgressBar;
	public barBg: eui.Image;
	public expLabel: eui.Label;
	public info: eui.Label;
	public myTitle: eui.Image;
	public overViewTxt: eui.Label;
	public help: eui.Button;
	public desc: eui.Label;

	/** 当前威望配置 */
	private _weiWangCfg: PrestigeLevel;

	/** 可找回威望特效 */
	private _backEff: MovieClip;

	/** 前三名玩家ID */
	private _topThree: Array<number>;

	/** 打开他人信息面板 */
	private _openOtherWin: boolean;

	public constructor() {
		super();
		this.skinName = "WeiWangSkin";
	}

	public childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}

	public init(): void {
		this.getItemTxt.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.getItemTxt.text}`);
		this.findItemTxt.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.findItemTxt.text}`);
		this.overViewTxt.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.overViewTxt.text}`);
	}

	public open(...args: any[]): void {
		this.addTouchEvent(this, this.onTouch);
		this.observe(Actor.ins().postWeiWang, this.update);
		this.observe(WeiWangCC.ins().postWeiWangBack, this.updateBack);
		this.observe(UserReadPlayer.ins().postPlayerResult, this.openOtherPlayerView);
		this.observe(Rank.ins().postRankingData, this.updateRank);
		this.update();
		this.updateBack();
		Rank.ins().sendGetRankingData(RankDataType.TYPE_WEIWANG);
		this.updateRank(Rank.ins().getRankModel(RankDataType.TYPE_WEIWANG));
	}

	public close(): void {
		this.removeTouchEvent(this, this.onTouch);
		this.removeObserve();
		this.removeEffect();
		if (this._topThree)
			this._topThree.length = 0;

		this._topThree = null;
	}

	private updateRank(rankModel: RankModel): void {
		if (rankModel && rankModel.type != RankDataType.TYPE_WEIWANG)
			return;

		//排行榜
		let ranks: Array<RankDataWeiWang> = rankModel ? rankModel.getDataList() : null;
		let count: number = ranks ? ranks.length : 0;
		let data: RankDataWeiWang;
		let index: number;
		this._topThree = [];

		for (let i: number = 1; i <= 3; i++) {
			index = i - 1;
			if (i <= count) {
				data = ranks[index];
				this["praiseGroup" + index].visible = true;
				this["name" + index].text = data.player;
				this._topThree[index] = data.id;
				this["bodyImg" + index].name = data.id + "";
				UserReadPlayer.ins().sendFindPlayer(data.id);
			}
			else {
				this["praiseGroup" + index].visible = false;
				this["name" + index].text = "暂无";
			}
		}

		index = this._topThree.indexOf(Actor.actorID);
		this.desc.textFlow = TextFlowMaker.generateTextFlow1(GlobalConfig.PrestigeBase.skillTips[index == -1 ? 0 : index + 1]);
	}

	private update(): void {
		//当前威望配置
		this._weiWangCfg = WeiWangCC.ins().getWeiWangCfg(Actor.weiWang);
		//是否最大值
		let isMax: boolean = this._weiWangCfg.level == Object.keys(GlobalConfig.PrestigeLevel).length;
		this.notMaxGroup.visible = !isMax;
		this.maxShowGroup.visible = isMax;

		let objAtts: AttributeData[] = [];
		for (let k in this._weiWangCfg.attr)
			objAtts.push(new AttributeData(this._weiWangCfg.attr[k].type, this._weiWangCfg.attr[k].value));

		let nextCfg: PrestigeLevel;
		if (!isMax) {
			this.curAtt.textFlow = TextFlowMaker.generateTextFlow1(AttributeData.getAttStr(objAtts, 0, 1, "："));

			objAtts = [];
			nextCfg = GlobalConfig.PrestigeLevel[this._weiWangCfg.level + 1];
			for (let k in nextCfg.attr)
				objAtts.push(new AttributeData(nextCfg.attr[k].type, nextCfg.attr[k].value));

			this.nextAtt.textFlow = TextFlowMaker.generateTextFlow1(AttributeData.getAttStr(objAtts, 0, 1, "："));
		}
		else {
			this.maxCurAtt.textFlow = TextFlowMaker.generateTextFlow1(AttributeData.getAttStr(objAtts, 0, 1, "："));
		}

		if (this._weiWangCfg.retrieve)
			this.info.textFlow = TextFlowMaker.generateTextFlow1(GlobalConfig.PrestigeBase.recycle.replace("{0}", this._weiWangCfg.retrieve + ""));
		else
			this.info.text = "";

		//进度条
		this.expBar.maximum = nextCfg ? nextCfg.exp : this._weiWangCfg.exp;
		this.expBar.value = Actor.weiWang;
		this.expLabel.text = Actor.weiWang + "/" + (Actor.weiWang > this.expBar.maximum ? "???" : this.expBar.maximum);

		this.myTitle.source = this._weiWangCfg.res;

	}

	/** 威望找回 */
	private updateBack(): void {
		this.findItemTxt.visible = WeiWangCC.ins().weiWangBack > 0;
		if (this.findItemTxt.visible) {
			if (!this._backEff)
				this._backEff = ObjectPool.pop("MovieClip");

			if (!this._backEff.parent) {
				this.findItemTxt.parent.addChild(this._backEff);
				this._backEff.x = this.findItemTxt.x + this.findItemTxt.width / 2;
				this._backEff.y = this.findItemTxt.y + this.findItemTxt.height / 2;
				this._backEff.touchEnabled = false;
			}

			if (!this._backEff.isPlaying)
				this._backEff.playFile(RES_DIR_EFF + "chargeff1", -1);
		}
		else
			this.removeEffect();
	}

	private removeEffect(): void {
		if (this._backEff) {
			DisplayUtils.removeFromParent(this._backEff);
			this._backEff.destroy();
			this._backEff = null;
		}
	}

	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this.getItemTxt:
				UserWarn.ins().setBuyGoodsWarn(MoneyConst.weiWang);
				break;
			case this.findItemTxt:
				WarnWin.show(`是否确定花费${WeiWangCC.ins().weiWangBack * GlobalConfig.PrestigeBase.cost}元宝找回${WeiWangCC.ins().weiWangBack}点威望值？`, () => {
					if (Actor.yb < WeiWangCC.ins().weiWangBack * GlobalConfig.PrestigeBase.cost)
						UserTips.ins().showTips("元宝不足，请充值！");
					else
						WeiWangCC.ins().sendFindWeiWang();
				}, this);
				break;
			case this.overViewTxt:
				ViewManager.ins().open(WeiWangOverViewWin);
				break;
			case this.closeBtn:
				ViewManager.ins().close(LiLianWin);
				break;
			case this.title0:
				ViewManager.ins().open(WeiWangTitleTipsWin, GlobalConfig.PrestigeBase.topThree[0]);
				break;
			case this.title1:
				ViewManager.ins().open(WeiWangTitleTipsWin, GlobalConfig.PrestigeBase.topThree[1]);
				break;
			case this.title2:
				ViewManager.ins().open(WeiWangTitleTipsWin, GlobalConfig.PrestigeBase.topThree[2]);
				break;
			case this.help:
				ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[24].text);
				break;
			case this.bodyImg0:
			case this.bodyImg1:
			case this.bodyImg2:
				this._openOtherWin = true;
				UserReadPlayer.ins().sendFindPlayer(Number(e.target.name));
				break;
			case this.checkBtn:
				ViewManager.ins().open(RankingWin, 2);
				break;
		}

	}

	/**
	 * 查看角色界面
	 */
	private openOtherPlayerView(otherPlayerData: OtherPlayerData) {
		if (this._openOtherWin) {
			ViewManager.ins().open(RRoleWin, otherPlayerData);
			this._openOtherWin = false;
		}
		else {
			let index: number = this._topThree.indexOf(otherPlayerData.id);
			if (index < 0)
				return;

			let role: Role = otherPlayerData.roleData[0];
			let zb: number[] = role.zhuangbei;
			let isHaveBody: boolean;
			let bodyId: number = zb[0];
			let weaponId: number = zb[1];
			let weaponConf: EquipsData = role.getEquipByIndex(0);
			let weaponConfId: number = weaponConf.item.configID;
			let bodyConf: EquipsData = role.getEquipByIndex(2);
			let bodyConfId: number = bodyConf.item.configID;
			this["weaponImg" + index].source = null;
			this["bodyImg" + index].source = null;
			if (weaponConfId > 0) {
				this["weaponImg" + index].source = DisplayUtils.getAppearanceByJobSex(
					GlobalConfig.EquipConfig[weaponConfId].appearance, role.job, role.sex
				);
			}
			if (bodyConfId > 0) {
				this["bodyImg" + index].source = DisplayUtils.getAppearanceByJobSex(
					GlobalConfig.EquipConfig[bodyConfId].appearance, role.job, role.sex
				);
				isHaveBody = true;
			}

			if (!isHaveBody)
				this["bodyImg" + index].source = DisplayUtils.getAppearanceBySex(`body${role.job}00`, role.sex);
			if (weaponId > 0)
				this["weaponImg" + index].source = DisplayUtils.getAppearanceByJobSex(
					this.getZhuangbanById(weaponId).res, role.job, role.sex
				);
			if (bodyId > 0)
				this["bodyImg" + index].source = DisplayUtils.getAppearanceByJobSex(
					this.getZhuangbanById(bodyId).res, role.job, role.sex
				);


			this["wingImg" + index].source = null;
			let wingdata: WingsData = role.wingsData;
			let id: number = zb[2];
			if (id > 0)
				this["wingImg" + index].source = GlobalConfig.ZhuangBanId[id].res + "_png";
			else if (wingdata.openStatus) {
				this["wingImg" + index].source = GlobalConfig.WingLevelConfig[wingdata.lv].appearance + "_png";
			}
		}
	}

	private getZhuangbanById(id: number): ZhuangBanId {
		for (let k in GlobalConfig.ZhuangBanId) {
			if (GlobalConfig.ZhuangBanId[k].id == id)
				return GlobalConfig.ZhuangBanId[k];
		}
		return null;
	}
}