/**
 * Created by MPeter on 2018/1/17.
 * 跨服副本-跨服boss-结算界面
 */
class KFBossResultWin extends BaseEuiView {
	private bg: eui.Image;
	private closeBtn: eui.Button;
	private listData0: eui.ArrayCollection;
	private title: eui.Image;
	private listItem: eui.List;
	private labelItem: eui.Label;
	private effGroup: eui.Group;
	private winnerEff: MovieClip;
	private roleTitleLabel: eui.Label;
	private roleIcon: eui.ToggleButton;
	private belongTxt: eui.Label;

	private _quitTime: number = 0;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "CityResultSkin";
		this.listItem.itemRenderer = ItemBase;

		this.listData0 = new eui.ArrayCollection();


		this.winnerEff = new MovieClip;
		this.winnerEff.x = 41;
		this.winnerEff.y = 41;
		this.winnerEff.touchEnabled = false;
	}
	public open(...param: any[]): void {
		super.open(param);

		this.addTouchEvent(this.closeBtn, this.onTap);

		this.closeBtn.label = "确定";


		this.roleTitleLabel.text = param[1] ? `旗子归属者：` : `BOSS归属者`;
		if (!this.winnerEff.parent) this.effGroup.addChild(this.winnerEff);
		this.winnerEff.playFile(RES_DIR_EFF + "yanhuaeff", 1);

		let tname: string = Actor.myName;
		tname = StringUtils.replaceStr(tname, "0xffffff", ColorUtil.ROLENAME_COLOR_GREEN + "");

		this.belongTxt.textFlow = TextFlowMaker.generateTextFlow1(tname);
		this.labelItem.text = "我的归属奖：";
		let role = SubRoles.ins().getSubRoleByIndex(0);//获取主职业
		if (role)this.roleIcon.icon = `main_role_head${role.job}`;
		this.roleIcon['jobImg'].visible = false;


		let rewards: RewardData[] = param[0];
		if (rewards)
			this.setRewardList(rewards);

		this._quitTime = 6;
		TimerManager.ins().doTimer(1000, this._quitTime + 1, this.onTimer, this);
		this.onTimer();
	}

	public setRewardList(rewards: RewardData[] = []) {
		let coinData: RewardData[] = [];
		let emblemData: RewardData[] = [];
		let itemData: RewardData[] = [];

		let soulData: RewardData[] = [];
		let rewardList: RewardData[] = [];
		for (let i = 0; i < rewards.length; i++) {
			//材料聚合
			let itemConfig: ItemConfig = GlobalConfig.ItemConfig[rewards[i].id];
			if (ItemConfig.getType(itemConfig) == 1) {
				if (emblemData.length) {
					let ishave = false;
					for (let j = 0; j < emblemData.length; j++) {
						if (emblemData[j].id == rewards[i].id) {
							emblemData[j].count += rewards[i].count;
							ishave = true;
							break;
						}
					}
					if (!ishave)
						emblemData.push(rewards[i]);
				} else {
					emblemData.push(rewards[i]);
				}
				continue;
			}

			if (rewards[i].type == 0) {
				if (rewards[i].id == MoneyConst.soul) {
					soulData.push(rewards[i])
				} else {
					coinData.push(rewards[i]);
				}
			} else {
				itemData.push(rewards[i]);
			}
		}
		itemData.sort(this.RuleSortByItem);
		rewardList = soulData.concat(coinData, emblemData, itemData);
		this.listItem.dataProvider = new eui.ArrayCollection(rewardList);


	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);


	}

	private onTimer(): void {
		this.closeBtn.label = `确定(${--this._quitTime})`;
		if (this._quitTime <= 0) {
			ViewManager.ins().close(this);
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
		}
	}
	private RuleSortByItem(a: RewardData, b: RewardData): number {
		let aItem: ItemConfig = GlobalConfig.ItemConfig[a.id];
		let bItem: ItemConfig = GlobalConfig.ItemConfig[b.id];
		let aq = ItemConfig.getQuality(aItem);
		let bq = ItemConfig.getQuality(bItem);
		if (aq > bq)
			return -1;
		else if (aq < bq)
			return 1;
		else {
			return 0;
		}
	}

}
ViewManager.ins().reg(KFBossResultWin, LayerManager.UI_Popup);