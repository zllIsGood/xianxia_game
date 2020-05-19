/**经验 金币炼制 */
class UserExpGold extends BaseSystem {

	private _remainTime: number;
	public index: number;

	public constructor() {
		super();
		this.sysId = PackageID.ExpGold;

		this.regNetMsg(1, this.doRemainTimeAndIndex);
	}

	public static ins(): UserExpGold {
		return super.ins() as UserExpGold;
	}

	//获取开启的剩余时间 和 当前档次的id
	public doRemainTimeAndIndex(bytes: GameByteArray): void {
		this.remainTime = bytes.readUnsignedInt();
		this.index = bytes.readInt();

		this.postExpUpdate();

	}
	public postExpUpdate(): void {

	}
	/**
	 * 购买经验
	 */
	public sendBuyExp(): void {
		this.sendBaseProto(2);
	}

	public set remainTime(value: number) {
		if (this._remainTime != value) {
			this._remainTime = value;
			TimerManager.ins().remove(this.downTime, this);
			TimerManager.ins().doTimer(1000, this._remainTime, this.downTime, this);
		}
	}

	public get remainTime(): number {
		return this._remainTime;
	}

	downTime(): void {
		this._remainTime -= 1;
		if (this._remainTime <= 0) {
			this.postExpUpdate();
		}
	}

	public getIndexNeedGold(): number {
		return GlobalConfig.RefinesystemExpConfig[this.index].yuanBao;
	}

	public checkIsOver(): boolean {
		if (GlobalConfig.RefinesystemExpConfig[this.index]) {
			return false;
		}
		return true;
	}

	//是否可以购买经验
	public checkIsCanPlay(): void {
		if (UserVip.ins().lv < 3) {
			//vip等级不够
			UserTips.ins().showTips("|C:0xf3311e&T:vip3可炼制|");
			return;
		}
		let needGold: number = GlobalConfig.RefinesystemExpConfig[this.index].yuanBao;
		if (Actor.yb >= needGold) {
			//元宝够
			UserExpGold.ins().sendBuyExp();
			return;
		}
		UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
		ViewManager.ins().open(ChargeFirstWin);
	}

	//检测按钮开启的条件
	public isOpenBtn(): boolean {
		if (Actor.level >= 60 && this.remainTime > 0) {
			return !this.checkIsOver();
		}
		return false;
	}

	//计算获得经验可以升到多少级
	public checkUpLevel(): number {
		let cruLevel: number = Actor.level;
		let getExp: number = GlobalConfig.RefinesystemExpConfig[this.index].exp;
		let cruNeed: number = GlobalConfig.ExpConfig[cruLevel].exp - Actor.exp;
		if (getExp >= cruNeed) {
			++cruLevel;
			getExp -= cruNeed;
			for (cruLevel; cruLevel < 150; cruLevel++) {
				cruNeed = GlobalConfig.ExpConfig[cruLevel].exp;
				if (getExp - cruNeed < 0) {
					break;
				} else {
					getExp -= cruNeed;
				}
			}
		}
		return cruLevel;
	}
}
namespace GameSystem {
	export let  userexpgold = UserExpGold.ins.bind(UserExpGold);
}