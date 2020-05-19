/**
 * 野外 试炼 VIP专属BOSS 结算页
 */
class BossResultWin extends BaseEuiView {

	public bg: eui.Image;
	public closeBtn: eui.Button;

	public closeFunc: Function;

	public listData0: eui.ArrayCollection;

	public title: eui.Image;

	/** 倒计时剩余秒 */
	private s: number;

	private listItem: eui.List;
	private labelItem: eui.Label;

	private scrollerGroup: eui.Group;


	private effGroup: eui.Group;
	private winnerEff: MovieClip;

	private roleIcon: eui.ToggleButton;
	private belongTxt: eui.Label;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "BossResultSkin";
		this.listItem.itemRenderer = ItemBase;
		this.listData0 = new eui.ArrayCollection();

		this.winnerEff = new MovieClip;
		this.winnerEff.x = 41;
		this.winnerEff.y = 41;
		this.winnerEff.touchEnabled = false;
	}

	private repeatTimes: number = 5;
	private _fbType:number;
	public open(...param: any[]): void {
		super.open(param);

		this._fbType = GameMap.fbType;
		let result: number = param[0];
		this.bg.source = "win_jpg";
		this.closeBtn.name =  "领取奖励";
		this.title.source = "win_02";

		//经验副本x秒
		let closeTime: number = 5;
		if (GameMap.fbType == UserFb.FB_TYPE_ZHUANSHENGBOSS || GameMap.fbType == UserFb.FB_TYPE_ALLHUMENBOSS) {
			closeTime = 10;
		}
		this.s = this.repeatTimes = closeTime;
		this.updateCloseBtnLabel();

		TimerManager.ins().doTimer(1000, this.repeatTimes, this.updateCloseBtnLabel, this);

		let rewards: RewardData[] = param[0];


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

		} else {
			this.belongTxt.text = ""
		}

		this.addTouchEvent(this.closeBtn, this.onTap);


		if (rewards)
			this.setRewardList(rewards);
		else
			this.setRewardList();
	}

	public setRewardList(rewards: RewardData[] = []) {
		let coinData: RewardData[] = [];
		let emblemData: RewardData[] = [];
		let itemData: RewardData[] = [];

		this.labelItem.visible = true;

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
		TimerManager.ins().remove(this.updateCloseBtnLabel, this);

		this.removeTouchEvent(this.closeBtn, this.onTap);
		if (GameMap.fubenID > 0) {
			if (UserFb.ins().isQuite && this._fbType != UserFb.FB_TYPE_ZHUANSHENGBOSS) {
				UserFb.ins().sendExitFb();
			}
		}

		if (this._fbType == UserFb.FB_TYPE_HOMEBOSS) {
			ViewManager.ins().open(BossWin, 5);
		}

		if (this.closeFunc) {
			this.closeFunc();
			this.closeFunc = null;
		}


	}

	private updateCloseBtnLabel(): void {
		this.s--;
		if (this.s <= 0)
			ViewManager.ins().close(this);

		this.closeBtn.label = `${this.closeBtn.name}(${this.s}s)`;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(this);
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


}

ViewManager.ins().reg(BossResultWin, LayerManager.UI_Popup);