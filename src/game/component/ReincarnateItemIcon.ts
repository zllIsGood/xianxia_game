class ReincarnateItemIcon extends BaseComponent {
	public config: ItemConfig;
	public imgIcon: eui.Image;
	public imgJob: eui.Image;
	public tag: eui.Image;
    public nameTxt:eui.Label;
	public effect: MovieClip;

	public constructor() {
		super();
		this.skinName = "ReincarnateSoulItemSkin";
	}

	public SetSoul(isSoul: boolean): void {
		this.tag.visible = isSoul;
	}

	public SetData(config: ItemConfig) {
		this.config = config;
		this.nameTxt.text = "";
		let quality: number = 0;
		if (config != null) {
			this.setIconfix(config);
			quality = ItemConfig.getQuality(config);
			this.imgIcon.source = config.icon + '_png';
			let type = ItemConfig.getType(config);
			let job = ItemConfig.getJob(config);
			this.nameTxt.text = this.config.name;
			this.imgJob.source = (type == 0 || type == 4) && job && this.imgJob.visible ? `common1_profession${job}` : '';
			if (GlobalConfig.ClientGlobalConfig.effectItems.indexOf && GlobalConfig.ClientGlobalConfig.effectItems.indexOf(config.id) >= 0) {
				if (this.effect == null) {
					this.effect = new MovieClip;
					this.effect.x = 35;
					this.effect.y = 35;
					this.addChildAt(this.effect, 2);
					this.effect.addEventListener(egret.Event.ADDED_TO_STAGE, this.resumePlay, this);
				}
				// this.effect.playFile(RES_DIR_EFF + 'quality_0' + quality);
			}
			else if (this.effect != null) {
				// this.effect.clearCache();
			}
		}
		else {
			this.imgIcon.source = '';
			this.imgJob.source = '';
			if (this.effect != null) {
				// this.effect.clearCache();
			}
		}

		this.imgIcon.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	private onTap(): void {
		ViewManager.ins().open(SamsaraEquipTips, this.config.id);
	}

	/**
	 * 由于策划现在不能改物品表 并且为了不影响物品读取的规律性
	 * 先用这个强行修复错误的icon
	 */
	private setIconfix(config: ItemConfig) {
		switch (config.id) {
			case 200136://精炼石
				config.icon = 200136;
				break;
		}
	}

	private resumePlay(e: Event): void {
		this.effect.play(-1);
	}
}