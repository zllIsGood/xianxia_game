/**
 *
 * @author hepeiye
 *
 */
class RankingWin extends BaseEuiView {

	public praiseGroup: eui.Group;
	public praiseGroup2: eui.Group;
	public praiseGroup3: eui.Group;
	public wingImg: eui.Image;
	public bodyImg: eui.Image;
	public weaponImg: eui.Image;
	public titleImg: eui.Image;
	public titleMc: MovieClip;
	public detail: eui.Image;
	public list: eui.List;
	public closeBtn0: eui.Button;
	public closeBtn: eui.Button;
	public selfPos: eui.Label;
	public tab: eui.TabBar;
	public weiwang: eui.Image;

	public firstLevelTxt: eui.Label;
	public firstNameTxt: eui.Label;
	public vip: eui.Image;
	private _type: number;
	private firstGroup: eui.Group;
	private firstId: number = 0;
	private help: eui.Button;
	/** 打开他人信息面板 */
	private _openOtherWin: boolean;

	public weaponEffect2: eui.Group;
	public bodyEffect2: eui.Group;
	public weaponEffect1: eui.Group;
	public bodyEffect1: eui.Group;
	public weaponEffect0: eui.Group;
	public bodyEffect0: eui.Group;

	public wPos2_0: eui.Image;
	public wPos2_1: eui.Image;
	public bPos2_0: eui.Image;
	public bPos2_1: eui.Image;

	public wPos1_0: eui.Image;
	public wPos1_1: eui.Image;
	public bPos1_0: eui.Image;
	public bPos1_1: eui.Image;

	public wPos0_0: eui.Image;
	public wPos0_1: eui.Image;
	public bPos0_0: eui.Image;
	public bPos0_1: eui.Image;

	private _bodyEff0: MovieClip;
	private _bodyEff1: MovieClip;
	private _bodyEff2: MovieClip;
	private _weaponEff0: MovieClip;
	private _weaponEff1: MovieClip;
	private _weaponEff2: MovieClip;

	private state: eui.Label;//无人上榜
	private firstName:string;
	private titleMcGroup: eui.Group;

	constructor() {
		super();
		this.skinName = "RankSkin";
		this.isTopLevel = true;
	}

	public initUI(): void {
		super.initUI();
		this.list.itemRenderer = RankItemRenderer;
		this.tab.itemRenderer = RankTabItemRenderer;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onClick);
		this.addTouchEvent(this.closeBtn0, this.onClick);
		this.addTouchEvent(this.detail, this.onClick);
		this.addEvent(eui.ItemTapEvent.ITEM_TAP, this.list, this.onListItemTap);
		this.addChangeEvent(this.tab, this.onClick);
		this.addTouchEvent(this.firstGroup, this.onClick);
		this.addTouchEvent(this.praiseGroup, this.onClick);
		this.addTouchEvent(this.praiseGroup2, this.onClick);
		this.addTouchEvent(this.praiseGroup3, this.onClick);
		this.addTouchEvent(this.help, this.onClick);
		this.setOpenIndex(param[0] == undefined ? 0 : param[0]);
		
		this.observe(Rank.ins().postRankingData, this.updateList);
		this.observe(UserReadPlayer.ins().postPlayerResult, this.openOtherPlayerView);
		this.observe(Rank.ins().postPraiseResult, this.refushMoBaiStatu);
		this.observe(Rank.ins().postPraiseData, this.updatePraise);
		this.observe(Rank.ins().postAllPraiseData, this.updateTab);
		
		Rank.ins().sendGetAllPraiseData();
	}

	private updateList(rankModel: RankModel): void {
		if (rankModel.type != this._type)
			return;

		this.selfPos.text = 0 < rankModel.selfPos && rankModel.selfPos <= 1000 ? rankModel.selfPos + '' : `未上榜`;
		let arr = rankModel.getDataList();
		this.list.dataProvider = new eui.ArrayCollection(arr.slice(1));

		this.refushMoBaiStatu();
		this.refushFirstInfo(rankModel.getDataList(0));
		//没人上榜处理对应控件
		if (arr && !arr.length) {
			this.state.visible = true;
		} else {
			this.state.visible = false;
		}
		this.titleMcGroup.visible = this.titleImg.visible = this.firstGroup.visible = !this.state.visible;


		if (!this.state.visible) {
			//称号
			let selectedData: any = this.tab.selectedItem;
			let config = GlobalConfig.TitleConf[selectedData.title] || {} as any;
			this.titleImg.source = config.img;
			if (config.eff) {
				if (!this.titleMc) {
					this.titleMc = ObjectPool.pop("MovieClip");
					this.titleMc.x = 0;
					this.titleMc.y = 0;
					this.titleMc.scaleX = 1.5;
					this.titleMc.scaleY = 1.5;
					this.titleMcGroup.addChild(this.titleMc);
				}
				this.titleMc.playFile(RES_DIR_EFF + config.eff, -1);
			} else {
				if (this.titleMc) {
					this.titleMc.destroy();
					this.titleMc = null;
				}
			}
		}


	}


	
	private refushFirstInfo(firstInfo: any): void {
		if (firstInfo) {
			this.firstId = firstInfo.id;
			this.firstName = firstInfo.player;
			this.firstNameTxt.text = firstInfo.player;
			this.vip.visible = firstInfo.vip > 0
			let str: string = ""
			if (Rank.ins().curType == RankDataType.TYPE_XUNZHANG) {
				//徽章
				let cfg: KnighthoodConfig = GlobalConfig.KnighthoodConfig[firstInfo.count];
				str = cfg.type;
			} else if (Rank.ins().curType == RankDataType.TYPE_LILIAN) {
				//天阶
				let cfg: TrainLevelConfig = GlobalConfig.TrainLevelConfig[firstInfo.count];
				str = `${cfg.trainlevel}等${cfg.trainName}`;
			} else if (Rank.ins().curType == RankDataType.TYPE_SKIRMISH) {
				//遭遇
				str = `杀意：${firstInfo.count}`;
			} else if (Rank.ins().curType == RankDataType.TYPE_XIANHUA) {
				//遭遇
				str = `${firstInfo.count}`;
			}
			else {
				// str = (firstInfo[RankDataType.DATA_ZHUAN] ? firstInfo[RankDataType.DATA_ZHUAN] + `转` : "") + firstInfo[RankDataType.DATA_LEVEL] + `级`;
				str = `${firstInfo[RankDataType.DATA_LEVEL]}级`;
			}

			if (Rank.ins().curType == RankDataType.TYPE_WEIWANG) {
				this.weiwang.visible = true;
				this.weiwang.source = WeiWangCC.ins().getWeiWangCfg((firstInfo as RankDataWeiWang).weiWang).res;
				this.firstLevelTxt.visible = false;
			}
			else {
				this.firstLevelTxt.visible = true;
				this.weiwang.visible = false;
			}

			this.firstLevelTxt.text = str;
		} else {
			this.firstId = 0;
			this.weiwang.visible = false;
		}
	}

	/**
	 * 更新数据
	 */
	protected updateValue(infoData: any, key: string, value: any): void {
		switch (key) {
			case RankDataType.DATA_VIP:
				return;
			case RankDataType.DATA_MONTH:

				return;

			case RankDataType.DATA_LEVEL:
				value = (infoData[RankDataType.DATA_ZHUAN] ? infoData[RankDataType.DATA_ZHUAN] + `转` : "") + value + `级`;
				break;

			case RankDataType.DATA_COUNT:

				break;
		}
		this.firstLevelTxt.text = value;
	}

	private refushMoBaiStatu(): void {
		this.updateTab();
	}

	/**
	 * 打开指定的排行榜
	 */
	private setOpenIndex(selectedIndex: number): void {
		this.tab.selectedIndex = selectedIndex;
		let selectedData: any = this.tab.selectedItem;
		this._type = <number>selectedData.type;
		Rank.ins().curType = this._type;
		RankItemRenderer.dataFormat = selectedData;

		this.selfPos.text = null;
		this.list.dataProvider = null;
		this.list.itemRendererSkinName = selectedData.skin || "RankItemPowerSkin";

		//天梯排行榜使用独立的协议
		if (this._type == RankDataType.TYPE_LADDER) {
			Ladder.ins().sendGetRankInfo();
		}
		else {
			Rank.ins().sendGetRankingData(this._type);
		}

		//请求膜拜数据
		Rank.ins().sendGetPraiseData(this._type);
	}

	private onClick(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			//关闭
			case this.closeBtn:
			case this.closeBtn0:
				ViewManager.ins().close(this);
				break;
			//查询角色信息
			case this.detail:
				break;
			//切换排行榜
			case this.tab:
				this.setOpenIndex(this.tab.selectedIndex);
				break;
			case this.firstGroup:
			case this.praiseGroup:
			case this.praiseGroup2:
			case this.praiseGroup3:
				if (this.firstId) {
					this._openOtherWin = true;
					UserReadPlayer.ins().sendFindPlayer(this.firstId);
				}
				break;
			case this.help:
				ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[21].text);
				break;
		}
	}

	private onListItemTap(e:eui.ItemTapEvent) {
		if (this.list.selectedItem) {
			this._openOtherWin = true;
			UserReadPlayer.ins().sendFindPlayer(this.list.selectedItem[RankDataType.DATA_ID]);
		}
	}
				
	/**
	 * 查看角色界面
	*/
	private openOtherPlayerView(otherPlayerData) {
		if (this._openOtherWin) {
			this._openOtherWin = false;
			ViewManager.ins().open(RRoleWin, otherPlayerData);
		}
	}

	/**
	 * 更新膜拜信息
	 */
	private updatePraise(type: number): void {
		let role: SubRole;
		if (Rank.ins().rankModel[type].praise.id > 0) {
			for (let i: number = 0; i < 3; i++) {
				role = Rank.ins().rankModel[type].praise.subRole[i];
				if (role) {
					let clothCfg = GlobalConfig.EquipConfig[role.clothID];
					if (clothCfg) {
						let fileName: string = role.clothID > 0 ? DisplayUtils.getAppearanceByJob(clothCfg.appearance, role.job) : `body${role.job}00`;
						this[`bodyImg${i}`].source = DisplayUtils.getAppearanceBySex(fileName, role.sex);

						if (!this["_bodyEff" + i])
							this["_bodyEff" + i] = new MovieClip();

						this.setWeaponEffect(role.clothID, `bPos${i}_`, role.sex, this[`bodyEffect${i}`], this["_bodyEff" + i]);
					} else {
						this[`bodyImg${i}`].source = DisplayUtils.getAppearanceBySex(`body${role.job}00`, role.sex);
						if (this["_bodyEff" + i])
							DisplayUtils.removeFromParent(this["_bodyEff" + i]);
					}

					let weaponCfg = GlobalConfig.EquipConfig[role.swordID];
					let hideWeapoon: boolean = this.hideWeapon(role.swordID, role.sex);
					if (weaponCfg) {
						let fileName: string = DisplayUtils.getAppearanceByJobSex(GlobalConfig.EquipConfig[role.swordID].appearance, role.job, role.sex);
						this[`weaponImg${i}`].source = !hideWeapoon ? (role.swordID > 0 ? fileName : '') : "";
					} else {
						this[`weaponImg${i}`].source = "";
						if (this["_weaponEff" + i])
							DisplayUtils.removeFromParent(this["_weaponEff" + i]);
					}

					let wingCfg = GlobalConfig.WingLevelConfig[role.wingLevel];
					if (wingCfg) {
						this[`wingImg${i}`].source = role.wingLevel >= 0 ? wingCfg.appearance + "_png" : '';
					} else {
						this[`wingImg${i}`].source = "";
					}

					//时装
					if (role.pos1 > 0) {//pos1:衣服 pos2:武器 pos3:翅膀
						this[`bodyImg${i}`].source = DisplayUtils.getAppearanceByJobSex(this.getZhuangbanById(role.pos1).res, role.job, role.sex);
					}
					if (role.pos2 > 0) {//pos1:衣服 pos2:武器 pos3:翅膀
						this[`weaponImg${i}`].source = !hideWeapoon ?
							DisplayUtils.getAppearanceByJobSex(this.getZhuangbanById(role.pos2).res, role.job, role.sex) : "";
					}
					if (role.pos3 > 0) {//pos1:衣服 pos2:武器 pos3:翅膀
						this[`wingImg${i}`].source = this.getZhuangbanById(role.pos3).res + "_png";// + role.sex + "_c_png";
					}

					//隐藏有特效的武器
					if (this.hideWeapon(role.swordID, role.sex))
						this[`weaponImg${i}`].source = null;

				} else {
					this[`bodyImg${i}`].source = "";
					this[`weaponImg${i}`].source = "";
					this[`wingImg${i}`].source = "";
					if (this["_weaponEff" + i])
						DisplayUtils.removeFromParent(this["_weaponEff" + i]);

					if (this["_bodyEff" + i])
						DisplayUtils.removeFromParent(this["_bodyEff" + i]);
				}
			}

			//膜拜按钮	
			this.refushMoBaiStatu();
		}
		else {
			for (let i: number = 0; i < 3; i++) {
				this[`bodyImg${i}`].source = "";
				this[`weaponImg${i}`].source = "";
				this[`wingImg${i}`].source = "";
				if (this["_weaponEff" + i])
					DisplayUtils.removeFromParent(this["_weaponEff" + i]);

				if (this["_bodyEff" + i])
					DisplayUtils.removeFromParent(this["_bodyEff" + i]);
			}
		}

		//更新标签栏
		this.updateTab();
	}

	/**
	 * 更新标签栏
	 * @returns void
	 */
	private updateTab(): void {
		let i: number = this.tab.selectedIndex;
		(this.tab.dataProvider as eui.ArrayCollection).refresh();
		this.tab.selectedIndex = i;
	}

	public static openCheck(...param: any[]): boolean {
		let lv: number = Actor.level;
		if (lv < 60) {
			UserTips.ins().showTips(`60级开启排行榜`);
			return false;
		}
		return true;
	}

	private getZhuangbanById(id: number): ZhuangBanId {
		for (let k in GlobalConfig.ZhuangBanId) {
			if (GlobalConfig.ZhuangBanId[k].id == id)
				return GlobalConfig.ZhuangBanId[k];
		}
		return null;
	}

	private hideWeapon(id: number, sex: number): boolean {
		//不隐藏武器图，为了不显示天神武器
		return false;//GlobalConfig.EquipWithEffConfig[id + "_" + sex] ? true : false;
	}

	/** 设置武器模型和衣服模型*/
	private setWeaponEffect(id: number, imgStr: string, sex: number, soulEffGroup: eui.Group, suitEff: MovieClip): void {
		let cfg: EquipWithEffConfig = GlobalConfig.EquipWithEffConfig[id + "_" + sex];
		if (cfg) {
			suitEff.scaleX = suitEff.scaleY = cfg.scaling;
			if (!suitEff.parent)
				soulEffGroup.addChild(suitEff);

			suitEff.x = this[imgStr + sex].x + cfg.offX;
			suitEff.y = this[imgStr + sex].y + cfg.offY;
			suitEff.playFile(RES_DIR_EFF + cfg.inShowEff, -1);
		}
		else if (suitEff.parent)
			suitEff.parent.removeChild(suitEff);
	}

}

ViewManager.ins().reg(RankingWin, LayerManager.UI_Main);