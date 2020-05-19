class HuanShouSkillItem extends BaseItemRender {
	protected skill: eui.Image;
	protected pitch: eui.Image;
	protected lock: eui.Image;
	protected skillName: eui.Label;
	public redPoint0: eui.Image;
	protected bg1: eui.Image;
	protected bg2: eui.Image;
	protected num: eui.Label;

	protected mc: MovieClip;
	protected itemConfig: ItemConfig;


	public constructor() {
		super();
		this.skinName = `huanShouSkillIcon`;

	}

	protected dataChanged(): void {

		let isQeff: boolean = false;
		this.clear();
		if (!this.data) {
			return;
		}
		if (this.data instanceof HsSkillData) {
			let hsData: HsSkillData = <HsSkillData>this.data;
			if (hsData.isOpen) {
				this.lock.visible = false;
				if (hsData.skillId > 0) {
					this.itemConfig = GlobalConfig.ItemConfig[hsData.skillId];
					this.bg1.visible = false;
				} else {
					this.bg1.visible = true;
					this.clear();
				}
				this.redPoint0.visible = UserHuanShou.ins().isSkillRedByPos(hsData.pos);
			} else {
				this.bg1.visible = true;
				this.bg2.visible = false;
				this.lock.visible = true;
				this.redPoint0.visible = false;
				this.skill.source = "";
				this.skillName.textFlow = TextFlowMaker.generateTextFlow(`${hsData.openRank}阶解锁`);
			}
		} else if (!isNaN(this.data)) {
			this.itemConfig = GlobalConfig.ItemConfig[this.data];

		} else if (this.data instanceof ItemData) {
			//道具数据
			this.itemConfig = this.data.itemConfig;
			if (!this.itemConfig)
				return;
			(<ItemData>this.data).count > 1 ? this.setCount((<ItemData>this.data).count + "") : this.setCount("");
		}

		this.updateShow();

	}

	protected updateShow(): void {
		if (this.itemConfig) {
			this.skill.source = this.itemConfig.icon + "_png";
			this.skillName.text = this.itemConfig.name;
			this.skillName.textColor = ItemBase.QUALITY_COLOR[this.itemConfig.quality];
			if (this.itemConfig.quality >= 4) {
				if (!this.mc) {
					this.mc = new MovieClip();
					this.mc.x = 70;
					this.mc.y = 70;
				}
				this.addChildAt(this.mc,this.getChildIndex(this.skill));
				let effName = this.itemConfig.quality == 4 ? "huanshou_001" : "huanshou_002";
				this.mc.playFile(RES_DIR_EFF + effName, -1);
			}
		}
	}

	public setCount(str: string): void {
		if (str.length > 4) {
			let wNum: number = Math.floor(Number(str) / 1000);
			str = wNum / 10 + "万";
		}
		this.num.text = str;
	}
	protected clearMC(): void {
		if (this.mc) {
			DisplayUtils.removeFromParent(this.mc);
			this.mc = null;
		}
	}
	protected clear(): void {
		this.clearMC();

		this.skill.source = "";
		this.skillName.text = "";
		this.num.text = "";
		this.itemConfig = null;
	}

}