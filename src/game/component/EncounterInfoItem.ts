/**
 *
 */
class EncounterInfoItem extends BaseItemRender {

	/** 挑战按钮 */
	private challengeBtn: eui.Button;
	/** 形象 */
	private face: eui.Image;
	/** 名字 */
	private nameTxt: eui.Label;
	/** 等级 */
	private nameTxt0: eui.Label;
	/** 钱 */
	private moneyTxt: eui.Label;
	/** 经验 */
	private expTxt: eui.Label;


	private headBG: eui.Image;
	private expKey: eui.Image;
	private moneyKey: eui.Image;

	//private time: eui.Label;
	private tip: eui.Label;
	private soulTxt: eui.Label;

	constructor() {
		super();
		this.skinName = "ZaoYuInfoItem";
	}

	protected createChildren(): void {
		super.createChildren();
		this.nameTxt.text = "";
		this.moneyTxt.text = "";
		this.expTxt.text = "";
		this.soulTxt.text = "";
		this.challengeBtn.touchChildren = false;
	}

	private updateTime(): void {
		//let time = Math.floor((DateUtils.formatMiniDateTime(EncounterModel.lastTime) - GameServer.serverTime) / 1000);
		//this.time.text = Math.floor(time / 60) + "分" + (time % 60) + "秒";
	}

	protected dataChanged(): void {

		if (this.data) {

			let data: EncounterModel = this.data;
			this.currentState = "have";

			let lv = data.zsLv > 0 ? data.zsLv * 1000 : Math.min(data.lv, 80);
			let config: SkirmishRewardConfig = GlobalConfig.SkirmishRewardConfig[lv];
			this.nameTxt.text = `${data.name}`;
			this.nameTxt0.text = `${data.zsLv ? `${data.zsLv}转` : ``}${data.lv}级`;
			this.moneyTxt.text = config.rewards.gold + "";
			this.expTxt.text = config.rewards.exp + "";
			this.soulTxt.text = config.rewards.essence + "";

			this.face.source = `head_${data.subRole[0].job}${data.subRole[0].sex}`;
			// this.headBG.source = ChatListItemRenderer.HEAD_BG[data.subRole[0].sex];
			if (EncounterFight.ins().encounterIndex != data.index)
				this.challengeBtn.label = "挑 战";
			else
				this.challengeBtn.label = "挑战中";

		} else {
			this.currentState = "none";
			this.nameTxt0.text = `暂无附近玩家`;
			// TimerManager.ins().removeAll(this);
			// TimerManager.ins().doTimer(1000, 0, this.updateTime, this);
			// this.updateTime();
			//	this.challengeBtn.label = "寻 敌";
		}
	}
}