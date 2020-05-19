class NextDayLoginWin extends BaseView {

	public sendBtn: eui.Button;
	// public input:eui.TextInput;
	public item: ItemBase;
	constructor() {
		super();
		this.skinName = "nextDaySkin";
		// this.input.maxChars = 28;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.sendBtn, this.onTap);
		this.item.data = {count:500,id:2,type:0}
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.sendBtn, this.onTap);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.sendBtn:
				if(Activity.ins().nextDayState == 1)
				{
					Activity.ins().sendNextDayReward();
				}else if(Activity.ins().nextDayState == 2)
				{
					UserTips.ins().showTips(StringUtils.addColor("已领取奖励",0xf3311e));
				}
				else
				{
					UserTips.ins().showTips(StringUtils.addColor("创建角色第二天才能领取奖励",0xf3311e));
				}
				break;
		}
	}
}