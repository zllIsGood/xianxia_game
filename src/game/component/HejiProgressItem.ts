class HejiProgressItem extends BaseItemRender {
	private descLab:eui.Label;
	private nameLab:eui.Label;
	private label0:eui.Label;
	private goBtn0:eui.Button;

	private taskIcon:eui.Image;
	private headBG:eui.Image;
	constructor() {
		super();
		this.skinName = "PunchItemSkin";
	}
	
	protected dataChanged(): void {
		// this.goBtn0.visible = true;
		// if(!this.data)return;
		let curPro:HejiProgressData = UserSkill.ins().hejiProgressList[this.itemIndex]
		if(!curPro)return;
		this.descLab.text = this.data.j+"";

		this.nameLab.text = this.data.t+"";

		this.label0.text = `(${curPro.progress}/${this.data.v})`;

		this.goBtn0.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {

		}, this);
	}
}

