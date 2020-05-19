/**
 *
 * @author hepeiye
 *
 */
class ArtifactConditionItemRenderer extends BaseItemRender {
	private selectIcon: eui.Image;
	private complete: eui.Image;
	private go: eui.Label;
	private desc: eui.Label;
	private config: AchievementTaskConfig;

	constructor() {
		super();

		this.skinName = "ArtifactsItemSkin";
		this.go.addEventListener(egret.TextEvent.LINK, this.onGo, this);
	}

	public dataChanged(): void {
		let achievementID = this.data["taskId"];

		let data = UserTask.ins().getAchieveByTaskId(achievementID);
		this.config = UserTask.ins().getAchieveConfById(data.id);

		let color;
		if (data.value >= this.config.target) {
			color = '0x35e62d';
			this.go.visible = false;
			this.complete.visible = true;
		} else {
			color = '0xf3311e';
			this.go.textFlow = (new egret.HtmlTextParser).parser(`<a href='event:' color=0x35e62d><u>前往</u></a>`);
			this.go.visible = true;
			this.complete.visible = false;

			if (this.config.controlTarget == undefined) {
				this.go.visible = false;
			}
		}
		let str: string = `${this.config.name}(<font color=${color}>${data.value}</font>/${this.config.target})`;
		this.desc.textFlow = (new egret.HtmlTextParser).parser(str);
	}

	public destruct(): void {

		this.go.removeEventListener(egret.TextEvent.LINK, this.onGo, this);
	}

	private onGo() {
		let i;
		if (this.config.controlTarget == undefined) {
			new Error("配置表没有配跳转界面ID");
		} else {
			ViewManager.ins().close(this.config.controlTarget[0].toString());
			ViewManager.ins().open(this.config.controlTarget[0].toString(), [this.config.controlTarget[1]]);
		}

	}
}