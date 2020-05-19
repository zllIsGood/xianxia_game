class GuildTaskItemRender extends BaseItemRender {

	private descLab: eui.Label;
	private nameLab: eui.Label;
	private headBG: eui.Image;
	private getGroup: eui.Group;
	private goBtn: eui.Button;
	private conGroup: eui.Group;
	private conBtn: eui.Button;
	private numLab: eui.Label;
	private taskIcon: eui.Image;



	public constructor() {
		super();
		this.skinName = "GuildTaskItemSkin";
	}

	public onTap(e: eui.Button): void {
		switch (e) {
			case this.conBtn:
			case this.goBtn:
				this.conBtnOnCLick();
				break;
		}
	}
	private conBtnOnCLick(): void {
		let info: GuildTaskInfo = this.data;
		switch (info.stdTask.type) {
			case 31:
				if (info.param >= info.stdTask.target)
					UserTips.ins().showTips("本日捐献次数已满");
				else if (Actor.yb >= info.stdTask.param) {
					Guild.ins().sendCon(info.stdTask.conID);
				}
				else
					UserTips.ins().showTips("元宝不足");
				break;
			case 32:
				if (info.param >= info.stdTask.target)
					UserTips.ins().showTips("本日捐献次数已满");
				else if (Actor.gold >= info.stdTask.param) {
					Guild.ins().sendCon(info.stdTask.conID);
				}
				else
					UserWarn.ins().setBuyGoodsWarn(1);
				break;
			case 33:
				if (info.param >= info.stdTask.target)
					UserTips.ins().showTips("本日捐献次数已满");
				else if (UserBag.ins().getItemCountById(0, info.stdTask.param) >= 1) {
					Guild.ins().sendCon(info.stdTask.conID);
				}
				else
					UserTips.ins().showTips("道具不足");
				break;
			default:
				GameGuider.guidance(info.stdTask.controlTarget[0], info.stdTask.controlTarget[1]);
				break;
		}
	}

	private goBtnOnClick(): void {
		let info: GuildTaskInfo = this.data;
		switch (info.state) {
			case 0:
				GameGuider.guidance(info.stdTask.controlTarget[0], info.stdTask.controlTarget[1]);
				break;
			case 1:
				Guild.ins().sendGetTaskAward(info.taskID);
				break;
			case 2:

				break;
		}
	}

	protected dataChanged(): void {
		if (this.data instanceof GuildTaskInfo) {
			let info: GuildTaskInfo = this.data;
			if (info) {
				this.taskIcon.source = `guildtask_${info.taskID}`;
				this.nameLab.text = info.stdTask.name;
				this.descLab.text = info.stdTask.desc;
				this.conGroup.visible = true;
				this.getGroup.visible = false;
				this.numLab.text = info.param + "/" + info.stdTask.target;
				this.conBtn.enabled = info.param < info.stdTask.target;
				if (info.param < info.stdTask.target) {
					switch (info.stdTask.type) {
						case 31://捐献元宝
						case 32://捐献金币
						case 33://捐献道具
							this.conBtn.label = "捐 献";
							break;
						default:
							this.conBtn.label = "前 往";
							break;
					}
				}
				else
					this.conBtn.label = "完 成";
			}
		}
	}
}