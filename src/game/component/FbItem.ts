/**
 * name
 */
class FbItem extends BaseItemRender {

	private bg: eui.Image;
	private redPoint: eui.Image;
	private item: ItemBase;

	private challengeBtn: eui.Button;
	private doubleChallengeBtn: eui.Button;
	private price: PriceIcon;
	private doublePrice: PriceIcon;
	private count: eui.Label;
	public bar: eui.ProgressBar;
	public barbg: eui.Image;
	public barGaroup: eui.Group;

	private levelRequire: eui.Label;

	private starValue: number;
	private fbname: eui.Label;

	private callBackFun:Function;

	constructor() {
		super();
		this.skinName = "DailyFbItemSkin";
	}

	protected createChildren(): void {
		super.createChildren();
		this.item.isShowName(false);
		this.starValue = 0;
	}

	private isDouble: number = 0;

	public starSaoDang(isDouble: number = 0,callback?:Function): void {
		this.isDouble = isDouble;
		TimerManager.ins().doTimer(50, 20, this.refushBar, this, this.overPlay, this);
		this.barGaroup.visible = true;
		this.barbg.visible = true;
		if (this.isDouble) {
			this.doublePrice.visible = false;
			this.barGaroup.x = this.doublePrice.x;
		} else {
			this.price.visible = false;
			this.barGaroup.x = this.price.x;
		}
		this.bar.labelFunction = function () {
			return "扫荡中";
		}
		if(callback)
			this.setCallBack(callback);
	}

	private setCallBack(callback:Function){
		this.callBackFun = callback;
	}

	refushBar(): void {
		if (this.isDouble) {
			this.doubleChallengeBtn.enabled = false;
		} else {
			this.challengeBtn.enabled = false;
		}
		this.starValue += 1;
		this.bar.value = this.starValue;
	}

	overPlay(): void {
		if (this.starValue != 0) {
			this.barGaroup.visible = false;
			this.barbg.visible = false;
			if (this.isDouble) {
				this.doublePrice.visible = true;
				this.doubleChallengeBtn.enabled = true;
			} else {
				this.price.visible = true;
				this.challengeBtn.enabled = true;
			}
			this.starValue = 0;
			if(this.callBackFun)
				this.callBackFun();
			UserFb.ins().sendAddCount(this.data, this.isDouble);
		}
	}

	protected dataChanged(): void {
		this.bg.source = this.data + "bg_jpg";
		let config: DailyFubenConfig = GlobalConfig.DailyFubenConfig[this.data];
		this.item.data = config.showItem;

		if (config.zsLevel > 0) {
			this.levelRequire.text = config.zsLevel + "转开启";
			this.currentState = UserZs.ins().lv >= config.zsLevel ? 'canChallenge' : 'noChallenge';
		}
		else {
			this.levelRequire.text = config.levelLimit + "级开启";
			this.currentState = Actor.level >= config.levelLimit ? 'canChallenge' : 'noChallenge';
		}
		this.levelRequire.visible = true;
		let fbInfos: FbModel = UserFb.ins().getFbDataById(this.data);
		let count: number = fbInfos.getCount();
		let color: string = count > 0 ? "#40D016" : "#DFD1B5";
		this.redPoint.visible = count > 0;
		let resetCount: number = fbInfos.getResetCount();
		if (count > 0)
			this.count.textFlow = (new egret.HtmlTextParser()).parser(`今日挑战次数：<font color="${color}">1次</font>`);
		else {
			this.count.textFlow = (new egret.HtmlTextParser()).parser(`今日可扫荡次数：<font color="${color}">${resetCount}次</font>`);
			//死亡引导判断
			this.redPoint.visible = DieGuide.ins().dieFbRedPoint(resetCount, this.data);
		}
		this.price.visible = (count == 0 && this.currentState == "canChallenge");
		if (Recharge.ins().franchise && fbInfos.isPass) {
			this.challengeBtn.label = count ? `快速挑战` : `扫  荡`;
		} else {
			this.challengeBtn.label = count ? `挑  战` : `扫  荡`;
		}
		this.challengeBtn.name = count ? `` : `add`;
		this.challengeBtn.enabled = true;

		//副本名称
		this.fbname.text = config.name ? config.name : "";

		this.doublePrice.visible = this.doubleChallengeBtn.visible = false;
		this.doubleChallengeBtn.name = `double`;
		let colorMatrix: number[] = [0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0, 0, 0, 1, 0];
		this.challengeBtn.filters = [];
		//this.count.verticalCenter = -45;
		//this.count.right = 20;
		let nextCount: number = fbInfos.getNextVip();
		let price: number = 0;
		let doublePrice: number = 0;
		let discount: number = GlobalConfig.MonthCardConfig.sweepPrecent / 100;
		let addValue: number = Recharge.ins().monthDay > 0 ? 1 - discount : 1;
		if (count == 0) {
			if (resetCount <= 0) {
				switch (nextCount) {
					case -1:
						this.count.text = `今日扫荡次数已经用完`;
						//this.count.verticalCenter = 0;
						//this.count.right = 50;
						this.challengeBtn.visible = false;
						this.price.visible = false;
						this.doublePrice.visible = false;
						this.levelRequire.visible = false;
						break;
					default:
						if (UserVip.ins().lv < nextCount) {
							this.count.textFlow = (new egret.HtmlTextParser()).parser(StringUtils.addColor(`${UserVip.formatLvStr(nextCount)}`, 0xe40202) + "可额外扫荡1次");
							this.challengeBtn.filters = [new egret.ColorMatrixFilter(colorMatrix)];
							this.doubleChallengeBtn.enabled = this.challengeBtn.enabled = false;
						}
						else {
							this.count.text = `${UserVip.formatLvStr(nextCount)}可额外扫荡1次`;
							this.doubleChallengeBtn.enabled = this.challengeBtn.enabled = true;
						}
						break;
				}
			}
			price = Math.floor(config.buyPrice[fbInfos.vipBuyCount] * addValue);
			this.price.setPrice(price);
			if (this.data == UserFb.FB_ID_JINGYAN && resetCount > 0) {
				if (Actor.level >= config.levelLimit) {
					this.doublePrice.visible = this.doubleChallengeBtn.visible = true;
					if (config.buyDoublePrice) {
						doublePrice = config.buyDoublePrice[fbInfos.vipBuyCount] * addValue;
						this.doublePrice.setPrice(doublePrice);
					}
				}
			}
		} else {
			if (this.currentState == 'canChallenge') {
				this.challengeBtn.visible = true;
			}
		}
	}
}