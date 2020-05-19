/**
 *
 * 经脉窗口
 */
class JimMaiItem extends BaseComponent {
	public guang: eui.Image;
	public bgImg: eui.Image;
	public item: eui.Image;
	private mc: MovieClip;
	constructor() {
		super();

		this.skinName = "JinMaiItemSkin";
		this.guang.visible = false;
	}

	public setLights(type: number): void {
		if (type == 0 && this.mc) {
			this.mc.stop();
			this.mc.visible = false;
			return;
		}
		if (this.mc == null) {
			this.mc = new MovieClip();
			this.mc.x = this.mc.y = 20;
			this.addChild(this.mc);
		}

		this.mc.visible = true;
		if (!this.mc.parent) this.addChild(this.mc);
		if (type == 1)//下一个要的
			this.mc.playFile(`${RES_DIR_EFF}ballb1`, -1);
		else if (type == 2)//已经点亮
			this.mc.playFile(`${RES_DIR_EFF}ballb2`, -1);
		else if (type == 3)//点亮的瞬间爆炸
		{
			let t: egret.Tween = egret.Tween.get(this);
			this.mc.playFile(`${RES_DIR_EFF}ballb3`, 1, null, false);
			t.wait(400).call(() => {
				if (this.mc)
					this.mc.playFile(`${RES_DIR_EFF}ballb2`, -1);
			}
			)
		}
		else if (type == 4)//点亮的瞬间爆炸
			this.mc.playFile(`${RES_DIR_EFF}ballb3`, 1, () => {
				DisplayUtils.removeFromParent(this.mc);
				// this.mc = null;
			}, true);

		this.bgImg.visible = true;
	}
}