class GuildCreateWin extends BaseEuiView {
	private okBtn: eui.Button;
	private leftLab: eui.Label;
	private rightLab: eui.Label;
	private textInput: eui.TextInput;
	private selectBmp: eui.Image;

	private selectLevel: number = 1;
	private bgClose: eui.Rect;
	public bg1: eui.Image;
	public bg2: eui.Image;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "GuildBuildSkin";
		this.leftLab.textFlow = (new egret.HtmlTextParser()).parser(this.formatLab(1));
		this.rightLab.textFlow = (new egret.HtmlTextParser()).parser(this.formatLab(2));
		
		// 默认选中第一个
		this.selectLevel = 1;

		// 初始化选中效果的位置
		this.selectBmp.visible = true;
		this.selectBmp.horizontalCenter = -106;
	}

	private changeSelect(id: number): void {
		
		this.selectLevel = id;
		this.selectBmp.visible = true;
		this.selectBmp.horizontalCenter = this.selectLevel == 1 ? this.bg1.horizontalCenter : this.bg2.horizontalCenter;
	}

	private formatLab(level: number): string {
		let gcc: GuildCreateConfig[] = GlobalConfig.GuildCreateConfig;
		let gc: GuildConfig = GlobalConfig.GuildConfig;

		let vipLv: number = gcc[level].vipLv;
		let vipDesc: string = vipLv > 0 ? `<font color='#3a8fee'>(${UserVip.formatLvStr(vipLv)}可创建)</font>` : "";
		let tempAward: string = gcc[level].award == 0 ? "\n" : "\n返还<font color='#0FEE27'>" + gcc[level].award.toString() + "</font>家族贡献";
		let content: string = "<font color='#FFDB00' size='20'>" + gcc[level].level.toString() + "级</font>家族"
			+ "\n" + vipDesc
			+ "\n容纳<font color='#0FEE27'>" + gc.maxMember[level - 1] + "</font>家族成员"
			+ tempAward
			+ "\n\n创建消耗:<font color='#FFDB00'>" + gcc[level].moneyCount.toString() + "</font>元宝";
		let str: string = "<font color='#DFD1B5' size='16'>" + content + "</font>";
		return str;
	}

	public static openCheck(...param: any[]): boolean {
		return true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.leftLab, this.onTap);
		this.addTouchEvent(this.rightLab, this.onTap);
		this.addTouchEvent(this.okBtn, this.onTap);
		this.addTouchEvent(this.bgClose, this.onTap);
	}


	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.okBtn: {
				let gcc: GuildCreateConfig[] = GlobalConfig.GuildCreateConfig;
				let dp: GuildCreateConfig = gcc[this.selectLevel];
				let vipLv: number = gcc[dp.level].vipLv;

				if (UserVip.ins().lv < vipLv) {
					UserTips.ins().showTips("vip等级不足");
					return;
				}
				if (this.textInput.text == "")
					UserTips.ins().showTips("请输入家族名字");
				else if (Actor.yb < dp.moneyCount) {
					UserTips.ins().showTips("元宝不足");
					ViewManager.ins().close(this);
				}
				else {
					WarnWin.show(`你将消耗${dp.moneyCount}元宝，创建${dp.level}级家族[${this.textInput.text}]，确定创建？`, () => {
						Guild.ins().sendGuildCreate(this.selectLevel, this.textInput.text);
					}, this);
				}
				break;
			}
			case this.leftLab:
				this.changeSelect(1);
				break;
			case this.rightLab:
				this.changeSelect(2);
				break;
		}
	}
}

ViewManager.ins().reg(GuildCreateWin, LayerManager.UI_Popup);