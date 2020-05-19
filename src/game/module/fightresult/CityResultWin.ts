/**
 * 主城结算页
 */
class CityResultWin extends BaseEuiView {

	public bg: eui.Image;
	public closeBtn: eui.Button;
	public listData0: eui.ArrayCollection;
	public title: eui.Image;
	private listItem: eui.List;
	private labelItem: eui.Label;
	private effGroup: eui.Group;
	private winnerEff: MovieClip;
	private roleIcon: eui.ToggleButton;
	private belongTxt: eui.Label;
	private closecount: number;//合服boss
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

		this.bg.source = "win_jpg";
		this.closeBtn.label = "领取奖励";
		this.title.source = "win_02";

		if (param[1]) {
			let isBelong: boolean = param[1][0];
			if (isBelong) {
				if (!this.winnerEff.parent) this.effGroup.addChild(this.winnerEff);
				this.winnerEff.playFile(RES_DIR_EFF + "yanhuaeff", 1);
			}
			let tname:string = param[1][1] || "";
			let strlist = tname.split("\n");
			if( strlist[1] )
				tname = strlist[1];
			else
				tname = strlist[0];

			tname = StringUtils.replaceStr(tname,"0xffffff",ColorUtil.ROLENAME_COLOR_GREEN + "");

			this.belongTxt.textFlow = TextFlowMaker.generateTextFlow1(tname);
			this.labelItem.text = isBelong ? "我的归属奖：" : "我的参与奖：";
			this.roleIcon.icon = param[1][2];
			this.roleIcon['jobImg'].visible = false;
		}

		let rewards: RewardData[] = param[0];
		if (rewards)
			this.setRewardList(rewards);

		this.closecount = 5;
		TimerManager.ins().doTimer(1000, this.closecount, this.timerClose, this);
	}

	public setRewardList(rewards: RewardData[] = []) {
		let coinData: RewardData[] = [];
		let emblemData: RewardData[] = [];
		let itemData: RewardData[] = [];

		let soulData: RewardData[] = [];
		let rewardList: RewardData[] = [];
		for (let i = 0; i < rewards.length; i++) {
			//材料聚合
			let itemConfig:ItemConfig = GlobalConfig.ItemConfig[rewards[i].id];
			if( ItemConfig.getType(itemConfig) == 1 ){
				if( emblemData.length ){
					let ishave = false;
					for( let j = 0;j < emblemData.length;j++ ){
						if( emblemData[j].id == rewards[i].id ){
							emblemData[j].count += rewards[i].count;
							ishave = true;
							break;
						}
					}
					if( !ishave )
						emblemData.push(rewards[i]);
				}else{
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
		rewardList = soulData.concat(coinData,emblemData, itemData);
		this.listItem.dataProvider = new eui.ArrayCollection(rewardList);


	}
	
	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		TimerManager.ins().remove(this.timerClose, this);

	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
				if (GameMap.fbType == UserFb.FB_TYPE_HEFUBOSS)
					UserFb.ins().sendExitFb();
				break;
		}
	}
	private RuleSortByItem(a:RewardData,b:RewardData):number{
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

	private timerClose():void {
		this.closecount--;
		if (this.closecount <= 0){
			if (GameMap.fbType == UserFb.FB_TYPE_HEFUBOSS)
				UserFb.ins().sendExitFb();
			ViewManager.ins().close(this);
		}
	}

}

ViewManager.ins().reg(CityResultWin, LayerManager.UI_Popup);