class GuildBuildItemRender extends BaseItemRender {

	private nameLab: eui.Label;
	public levelLab: eui.Label;
	private upLevelLab: eui.Label;
	private money: eui.Label;
	private upBtn: eui.Button;
	private buildingLab: eui.Label;

	private _maxLevel: number = 0;
	private _curLevel: number = 0;
	private _nextMoney: number = 0;

	public manege: eui.Image;
	public buildImg: eui.Image;

	public progress: eui.ProgressBar;
	public needMoney: eui.Label;
	public progressblack: eui.Rect;
	public progressbg: eui.Image;
	private redPoint:eui.Image;

	public constructor() {
		super();
		this.skinName = "GuildManageItemSkin";
	}

	public onTap(e: eui.Button): void {
		switch (e) {
			case this.upBtn:
				let type: number = this.data;//建筑类型从1开始
				if (Guild.ins().myOffice < GuildOffice.GUILD_FUBANGZHU) {
					UserTips.ins().showTips("仅盟主可操作");
					return;
				}
				else if (type == GuildBuilding.GUILD_HALL && this._curLevel >= this._maxLevel) {
					UserTips.ins().showTips("等级已满");
					return;
				}
				else if (type != GuildBuilding.GUILD_HALL && this._curLevel >= Guild.ins().guildLv) {
					UserTips.ins().showTips("请先升级管理大厅");
					return;
				}
				else if (Guild.ins().money < this._nextMoney) {
					UserTips.ins().showTips("资金不足");
					return;
				}
				Guild.ins().sendUpBuilding(type);
				break;
		}
	}

	protected dataChanged(): void {
		if (typeof(this.data)=="object") return;
		let type: number = this.data;//建筑类型从1开始
		// this.manege.visible = type == 1;
		this.buildImg.visible = type == 1;
		//建筑当前等级
		this._curLevel = Guild.ins().getBuildingLevels(type - 1) || 0;

		let glc: GuildLevelConfig[] = GlobalConfig.GuildLevelConfig[type];
		let dp: GuildLevelConfig = null;
		let dpNext: GuildLevelConfig = null;
		for (let key in glc) {
			if (glc.hasOwnProperty(key)) {
				let element: GuildLevelConfig = glc[key];
				this._maxLevel = element.level > this._maxLevel ? element.level : this._maxLevel;
				if (element.level == this._curLevel)
					dp = element;
				if (element.level == this._curLevel + 1)
					dpNext = element;
			}
		}

		if (dp || dpNext || (type == GuildBuilding.GUILD_LIANGONGFANG)) {
			this.nameLab.text = GlobalConfig.GuildConfig.buildingNames[type - 1];
			this.levelLab.text = "等级 " + (this._curLevel == null ? 0 : this._curLevel);
			if (dpNext && this._curLevel < this._maxLevel) {
				this._nextMoney = dpNext.upFund;
				this.upLevelLab.text = type == GuildBuilding.GUILD_HALL ? "" : `升级要求：管理大厅达到${(this._curLevel + 1)}级`;
				this.money.text = Guild.ins().money + "/" + dpNext.upFund;
				this.needMoney.text = `需资金：${dpNext.upFund}`;
				this.progress.maximum = dpNext.upFund;
				this.progress.value = Guild.ins().money;
				this.progress.visible = true;
			}
			else {
				this.upLevelLab.text = "等级已满";
				if (dp)
					this.money.text = Guild.ins().money + "/" + dp.upFund;
				else
					this.money.text = "已满级";
				this.needMoney.text = "";
				this.progress.visible = false;
			}
			this.buildingLab.text = GlobalConfig.GuildConfig.buildingTips[type - 1];
		}

		this.manege.source = `guildmn${type}_png`;

		//暂时屏蔽部分
		if( type == GuildBuilding.GUILD_SHOP ){
			this.progress.visible = this.progressbg.visible = this.progressblack.visible = this.levelLab.visible = this.needMoney.visible = this.money.visible = false;
			this.upBtn.touchEnabled = false;
			this.upBtn.label = "敬请期待";
			this.upBtn.currentState = "disabled";
			this.upBtn.verticalCenter = 0;
		}
		this.updateRedPoint();

	}
	private updateRedPoint(){
		let type: number = this.data;//建筑类型从1开始
		if( type == GuildBuilding.GUILD_SHOP ){
			this.redPoint.visible = false;
			return;
		}

		if (Guild.ins().myOffice < GuildOffice.GUILD_FUBANGZHU) {
			this.redPoint.visible = false;
			return;
		}
		else if (type == GuildBuilding.GUILD_HALL && this._curLevel >= this._maxLevel) {
			this.redPoint.visible = false;
			return;
		}
		else if (type != GuildBuilding.GUILD_HALL && this._curLevel >= Guild.ins().guildLv) {
			this.redPoint.visible = false;
			return;
		}
		else if (Guild.ins().money < this._nextMoney) {
			this.redPoint.visible = false;
			return;
		}
		this.redPoint.visible = true;
	}
}