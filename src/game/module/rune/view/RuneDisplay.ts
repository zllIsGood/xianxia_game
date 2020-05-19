class RuneDisplay extends BaseComponent {
	public static SKIN_STATE_LOCK: string = "lock";
	public static SKIN_STATE_READY: string = "ready";
	public static SKIN_STATE_UNLOCK: string = "unlock";

	public iconImg: eui.Image;
	public selectedImg: eui.Image;
	public nameTF: eui.Label;
	public nameBG: eui.Image;
	public redPoint: eui.Image;

	public pos: number = -1;

	private _itemConfig: ItemConfig;

	public constructor() {
		super();

	}

	/**
	 * 设置位置
	 * @param  {number} pos
	 * @returns void
	 */
	public setPos(pos: number): void {
		this.pos = pos;
		let rlpc: RuneLockPosConfig = RuneConfigMgr.ins().getLockCfg(pos);
		if (!this.assert(rlpc, "RuneLockPosConfig(" + pos + ")")) {
			let lv: number = SkyLevelModel.ins().cruLevel;
			let lockLv: number = rlpc.lockLv;
			if (lv > lockLv) {
				this.currentState = RuneDisplay.SKIN_STATE_UNLOCK;
			}
			else {
				// let previousCfg: RuneLockPosConfig = RuneConfigMgr.ins().getLockCfg(pos - 1);
				// if (previousCfg
				// 	&& lv >= lockLv) {
				// 	this.currentState = RuneDisplay.SKIN_STATE_READY;
				// }
				// else {
				this.currentState = RuneDisplay.SKIN_STATE_LOCK;
				// }
			}
		}

		// this.setLockTF();
	}

	public lockStr: string = '';
	/**
	 * 设置解锁文本
	 * @returns void
	 */
	public setLockTF(show?): void {
		if (this.pos < 0) return;
		if (this.currentState != RuneDisplay.SKIN_STATE_LOCK
			&& this.currentState != RuneDisplay.SKIN_STATE_READY) {
			return;
		}

		let cfg: RuneLockPosConfig = RuneConfigMgr.ins().getLockCfg(this.pos);
		if (this.assert(cfg, "RuneLockPosConfig(" + this.pos + ")")) return;
		let upPosCfg: RuneLockPosConfig = null;
		if (this.pos >= 1)
			upPosCfg = RuneConfigMgr.ins().getLockCfg(this.pos - 1);
		if (upPosCfg && upPosCfg.lockLv <= SkyLevelModel.ins().cruLevel && show) {
			let info: FbChallengeConfig = GlobalConfig.FbChallengeConfig[cfg.lockLv];
			let model: SkyLevelModel = SkyLevelModel.ins();
			let nextCfg: FbChallengeConfig = model.getNextOpenLevel();
			let layer: number = 0;
			if (nextCfg)
				layer = nextCfg.layer;
			let str = `|U:&C:0x35e62d&T:通关通天塔${GlobalConfig.FbChNameConfig[info.group].name}${layer}层开启`;
			this.lockStr = str;
		} else {
			this.lockStr = '';
		}
	}

	/**
	 * 设置数据
	 * @param  {RuneData} data
	 * @returns void
	 */
	public setData(data: ItemData): void {
		if (!data || (data.itemConfig && data.itemConfig.id <= 0)) return;

		this.data = data;
		let itemCfg: ItemConfig = GlobalConfig.ItemConfig[data.itemConfig.id];
		this._itemConfig = itemCfg;
		if (!this.assert(itemCfg, "ItemConfig(" + data.itemConfig.id + ")")) {
			this.nameBG.visible = this.isShowName;
			this.nameTF.visible = this.isShowName;
			//图片
			this.iconImg.source = itemCfg.icon + '_png';
			//名字
			let nameCfg: RuneNameConfig = GlobalConfig.RuneNameConfig[ItemConfig.getSubType(itemCfg)];
			this.nameTF.textFlow = TextFlowMaker.generateTextFlow(`|C:${ItemConfig.getQualityColor(itemCfg)}&T:${nameCfg.runeName}Lv.${itemCfg.id % 100}`);
			// this.nameTF.textFlow = new egret.HtmlTextParser().parser("<font color = '" + ItemBase.QUALITY_COLOR[itemCfg.quality] + "'>" + itemCfg.name + "</font>");
		}
	}

	/**
	 * 设置数据
	 * @param  {RuneData} data
	 * @returns void
	 */
	public setDataByItemConfig(data: ItemConfig): void {
		if (!data) return;
		this._itemConfig = data;
		this.currentState = RuneDisplay.SKIN_STATE_UNLOCK;

		this.nameBG.visible = this.isShowName;
		this.nameTF.visible = this.isShowName;
		//图片
		this.iconImg.source = data.icon + '_png';
		//名字
		let nameCfg: RuneNameConfig = GlobalConfig.RuneNameConfig[ItemConfig.getSubType(data)];
		if (data.level && data.level != 0)
			this.nameTF.textFlow = TextFlowMaker.generateTextFlow(`|C:${ItemConfig.getQualityColor(data)}&T:${nameCfg.runeName} Lv.${data.level % 100}|`);
		else
			this.nameTF.textFlow = TextFlowMaker.generateTextFlow(`|C:${ItemConfig.getQualityColor(data)}&T:${nameCfg.runeName} Lv.1|`);
	}

	public getItemConfig(): ItemConfig {
		return this._itemConfig;
	}

	/**
	 * 清理视图
	 * @returns void
	 */
	public cleanData(): void {
		this.data = null;
		this._itemConfig = null;
		this.iconImg.source = null;
		this.nameTF.text = "";
		this.nameTF.visible = false;
		this.nameBG.visible = false;
	}

	/**
	 * 显示或隐藏选中
	 * @param  {boolean} isShow
	 * @returns void
	 */
	public showOrHideSelected(isShow: boolean): void {
		this.selectedImg.visible = isShow;
	}

	private isShowName: boolean = true;

	public showName(boo: boolean): void {
		this.isShowName = boo;
	}

	/**
	 * 断言
	 * @param  {any} value
	 * @param  {string} msg
	 * @returns boolean
	 */
	private assert(value: any, msg: string): boolean {
		return Assert(value, "[" + egret.getQualifiedClassName(RuneDisplay) + "] " + msg + "is null!");
	}
}