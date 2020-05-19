/**
 * 追血令玩家信息显示面板
 */
class EncounterInfoWin extends BaseComponent {

	/** 查看排名按钮 */
	public rankBtn: eui.Button;
	/** 战斗记录 */
	public recordBtn: eui.Button;

	/** 列表 */
	public list: eui.List;

	/** 人物的头像 */
	public myFace: eui.Image;

	public dayPrestige: eui.Label;
	public rank: eui.Label;
	public labelRed: eui.Label;
	public time: eui.Label;
	private timeGap: number;

	private labelRedPoint: eui.Label;
	private scroller: eui.Scroller;
	private rewardBtn: eui.Button;

	private curIndex: number = -1;

	constructor() {
		super();
		this.name = `附近的人`;
		// this.skinName = "zaoyuskin";
	}

	protected childrenCreated() {
		this.init();
	}

	private init() {
		this.myFace.source = `head_${SubRoles.ins().getSubRoleByIndex(0).job}${SubRoles.ins().getSubRoleByIndex(0).sex}`;
		this.list.itemRenderer = EncounterInfoItem;
		this.scroller.scrollPolicyH = eui.ScrollPolicy.OFF;
	}

	public open(...param: any[]): void {

		this.labelRed.textFlow = TextFlowMaker.generateTextFlow1(`|U:&C:0x35e62d&T:立即挑战|`);

		Encounter.ins().sendInquireRecord();
		Encounter.ins().sendInquirePrestige();
		this.setData();
		this.addTouchEvent(this, this.onTap);
		this.addTouchEvent(this.rewardBtn, this.onTap)
		this.observe(Encounter.ins().postEncounterDataChange, this.setData);
		this.observe(Encounter.ins().postDataUpdate, this.updatePrestigeRank);

	}

	public $onClose(...param: any[]): void {
		super.$onClose();
		TimerManager.ins().removeAll(this);
	}

	private updatePrestigeRank(param: any) {
		let prestige = param[0];
		let rank = param[1];
		this.dayPrestige.text = prestige + "";
		if (rank == 0) {
			this.rank.textFlow = TextFlowMaker.generateTextFlow1(`|U:&C:0xFB9409&T:未上榜|`);
		} else {
			this.rank.textFlow = TextFlowMaker.generateTextFlow1(`|U:&C:0xFB9409&T:${rank}名|`);
		}
		// this.rank.x = this.dayPrestige.x + this.dayPrestige.width;
	}

	private setData(): void {
		let arr: EncounterModel[] = [];

		//购买完pk值就立刻进入追血令
		if (this.curIndex > -1 && Encounter.ins().buyAndFight) {
			this.sendFight(this.curIndex);
		}
		Encounter.ins().buyAndFight = false;
		this.curIndex = -1;

		this.labelRedPoint.text = `${EncounterModel.redName}`;
		this.labelRedPoint.textColor = EncounterModel.redName >= GlobalConfig.SkirmishBaseConfig.maxPkval ? 0xFF0000 : 0x35E62D;
		this.labelRed.visible = false;//EncounterModel.redName != 0;
		if (EncounterModel.redName >= GlobalConfig.SkirmishBaseConfig.maxPkval) {
			// this.addTime();
			this.time.text = `(${EncounterModel.redName - GlobalConfig.SkirmishBaseConfig.maxPkval + 1}分钟后可挑战)`;
			this.time.textColor = 0xff0000;
		} else {
			this.removeTime();
		}

		for (let i = 0; i < Encounter.ins().encounterModel.length; i++) {
			let enModel = Encounter.ins().getEncounterModel(i);
			if (enModel) {
				if (enModel.firstData) {//存在第一个时候只显示第一个
					arr = [enModel];//
					break;
				}
				arr.push(enModel);
			}
		}
		if (arr.length == 0) {
			arr.push(null);
		}
		this.list.dataProvider = new eui.ArrayCollection(arr);
	}

	private addTime() {
		this.removeTime();
		this.timeGap = (EncounterModel.redName - GlobalConfig.SkirmishBaseConfig.maxPkval + 1) * 60;
		this.time.text = `(${DateUtils.getFormatBySecond(this.timeGap, 3)}后可挑战)`;
		TimerManager.ins().doTimer(1000, 0, this.timeHandler, this);
	}

	private timeHandler() {
		if (this.timeGap > 0) {
			this.timeGap -= 1;
			this.time.text = `(${DateUtils.getFormatBySecond(this.timeGap, 3)}后可挑战)`;
		} else {
			this.time.text = '';
		}
	}

	private removeTime() {
		this.time.text = '';
		TimerManager.ins().remove(this.timeHandler, this);
	}

	private onTap(e: egret.TouchEvent): void {
		//挑战按钮
		if (e.target instanceof eui.Button && e.target.parent instanceof EncounterInfoItem) {
			if (CityCC.ins().isCity) {
				UserTips.ins().showTips('主城不能击杀附近的人,请先传送到野外')
				return;
			}

			if (e.target.label == `挑 战` || e.target.label == `挑战中`) {
				if (UserFb.ins().checkInFB()) return;
				let index = (<EncounterInfoItem>e.target.parent).data.index;
				if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
					ViewManager.ins().open(BagFullTipsWin);
					return;
				}
				if (EncounterModel.redName >= GlobalConfig.SkirmishBaseConfig.maxPkval) {
					this.curIndex = index;
					ViewManager.ins().open(BuyRedNameWin);//
					// UserTips.ins().showTips(`${EncounterModel.redName-GlobalConfig.SkirmishBaseConfig.maxPkval}分钟后可挑战，可通过立即消除马上挑战`);
					return;
				}
				this.sendFight(index);

			} else if (e.target.label == `寻 敌`) {
				ViewManager.ins().open(FindEnemyWin);
			}

		}
		else {
			switch (e.target) {
				case this.rankBtn:
					ViewManager.ins().open(RankingWin, 4);
					break;
				case this.recordBtn:
					ViewManager.ins().open(ZaoYuRecordWin);
					break;
				case this.labelRed:
					if (EncounterModel.redName > 0)
						ViewManager.ins().open(BuyRedNameWin);
					else
						UserTips.ins().showTips(`没有可消除的PK值`);
					break;
				case this.rank:
					ViewManager.ins().open(RankingWin, 4);
					break;
				case this.rewardBtn:
					ViewManager.ins().open(EncounterRewardWin);
					break;
			}
		}
	}

	private sendFight(index: number) {
		if (UserFb.ins().checkInFB()) return;

		ViewManager.ins().close(BagFullTipsWin);
		ViewManager.ins().closeTopLevel();

		TimerManager.ins().doTimer(100, 1, () => {
			EncounterFight.ins().start(index);
		}, this);
	}
}
