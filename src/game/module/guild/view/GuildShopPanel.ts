class GuildShopPanel extends BaseComponent {
	public closeBtn: eui.Button;
	public closeBtn0: eui.Button;
	public guildMore: eui.Label;
	public guildshopitem_0: ItemBase;
	public guildshopitem_1: ItemBase;
	public guildshopitem_2: ItemBase;
	public guildshopitem_3: ItemBase;
	public guildshopitem_4: ItemBase;
	public guildshopitem_5: ItemBase;
	public guildshopitem_6: ItemBase;
	public guildshopopen: eui.Group;
	public useBtn: eui.Button;
	public guildshoplabel: eui.Label;
	public guildshopxiaolabel: eui.Label;
	public guildshopshengyulabel: eui.Label;
	public guildshopclose: eui.Group;
	public guildshopkaiqi: eui.Label;
	public box: eui.Image;
	public guildshopitem_7: ItemBase;
	public record: eui.Label;
	public record1: eui.Label;
	public record2: eui.Label;
	// public boxImage: eui.Image;

	public openBoxEff: MovieClip;//开箱特效
	private isOpenEff: boolean = false;

	constructor() {
		super();
		this.initUI();
	}

	public initUI(): void {
		this.skinName = "GuildStoreWinSkin";
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.guildshopkaiqi, this.onTap);
		this.addTouchEvent(this.useBtn, this.onTap);
		this.addTouchEvent(this.guildMore, this.onTap);
		GuildStore.ins().getGuildStoreInfo();
		GuildStore.ins().sendGuildStoreBoxInfo();
		this.observe(GuildStore.ins().postGuildStoreInfo, this.onupdateData);
		this.observe(GuildStore.ins().postGuildStoreBox, this.onItemInfo);
		this.observe(GuildStore.ins().postGuildStoreBoxInfo, this.onReadInfo);
		// this.boxImage.source = "guildshop_json.guildshop_2";
		this.onupdateData();
		this.guildshopitem_7.visible = false;
		// this.boxImage.visible = true;
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.closeBtn0, this.onTap);
		this.removeTouchEvent(this.guildshopkaiqi, this.onTap);
		this.removeTouchEvent(this.useBtn, this.onTap);
		this.removeTouchEvent(this.guildMore, this.onTap);

		this.removeObserve();
	}

	private onupdateData(): void {
		if (GuildStore.ins().guildStoreLv > 0) {
			this.guildshopopen.visible = true;
			this.guildshopclose.visible = false;
			this.guildshopclose.touchEnabled = false;
			this.guildshopopen.touchEnabled = true;
			if (GlobalConfig.GuildStoreConfig.needContrib > Guild.ins().myCon)
				this.guildshoplabel.textFlow = new egret.HtmlTextParser().parser(Guild.ins().myCon + "");
			else
				this.guildshoplabel.textFlow = new egret.HtmlTextParser().parser(Guild.ins().myCon + "");
			this.guildshopxiaolabel.text = "" + GlobalConfig.GuildStoreConfig.needContrib;
			let totalNum: number = GlobalConfig.GuildStoreConfig.time[GuildStore.ins().guildStoreLv - 1];
			let nextTotalNum: number = GlobalConfig.GuildStoreConfig.time[GuildStore.ins().guildStoreLv];
			let str: string = "";
			if (GuildStore.ins().guildStoreNum <= 0) {
				str = "<font color='#f3311e'>" + GuildStore.ins().guildStoreNum + "/" + totalNum + "</font>";
			} else {
				str = GuildStore.ins().guildStoreNum + "/" + totalNum;
			}
			if (nextTotalNum)
				this.guildshopshengyulabel.textFlow = new egret.HtmlTextParser().parser("本日剩余次数:" + str);
			else
				this.guildshopshengyulabel.textFlow = new egret.HtmlTextParser().parser("本日剩余次数:" + str);
		} else {
			this.guildshopopen.visible = false;
			this.guildshopopen.touchEnabled = false;
			this.guildshopclose.touchEnabled = true;
			this.guildshopclose.visible = true;
			this.guildshopkaiqi.textFlow = new egret.HtmlTextParser().parser("<u>前往提升</u>");
		}
		for (let k in GlobalConfig.GuildStoreConfig.item) {
			this["guildshopitem_" + k].data = GlobalConfig.GuildStoreConfig.item[k];
		}
		this.guildMore.textFlow = new egret.HtmlTextParser().parser("<u>更多记录</u>");
	}

	private onReadInfo(): void {
		let arr: GuildStoreRecordInfo[] = GuildStore.ins().getRecordInfoAry();
		if (arr.length > 0) {
			this.record.visible = true;
			let config: ItemConfig = GlobalConfig.ItemConfig[arr[0].itemId];
			let q = ItemConfig.getQualityColor(config);
			this.record.textFlow = new egret.HtmlTextParser().parser(`${arr[0].roleName} 获得了 <font color=${q}>${config.name}</font>`);
			if (arr.length > 1) {
				this.record1.visible = true;
				let config: ItemConfig = GlobalConfig.ItemConfig[arr[1].itemId];
				this.record1.textFlow = new egret.HtmlTextParser().parser(`${arr[1].roleName} 获得了 <font color=${q}>${config.name}</font>`);
			}
			if (arr.length > 2) {
				this.record2.visible = true;
				let config: ItemConfig = GlobalConfig.ItemConfig[arr[2].itemId];
				this.record2.textFlow = new egret.HtmlTextParser().parser(`${arr[2].roleName} 获得了 <font color=${q}>${config.name}</font>`);
			}
		} else {
			this.record.visible = false;
			this.record1.visible = false;
			this.record2.visible = false;
		}
	}

	private onItemInfo(): void {
		this.guildshopitem_7.visible = true;
		let guildStoreItemData: GuildStoreItemData = GuildStore.ins().getGuildStoreItemData(0);
		this.guildshopitem_7.num = guildStoreItemData.num;
		this.guildshopitem_7.data = guildStoreItemData.itemId;
		// this.boxImage.source = "guildshop_json.guildshop_1";
		// this.boxImage.visible = true;
		this.onupdateData();
	}

	private startEff(): void {
		this.guildshopitem_7.visible = false;
		// this.boxImage.source = "guildshop_json.guildshop_2";
		// this.boxImage.visible = false;
		this.isOpenEff = true;
		this.openBoxEff = new MovieClip;
		this.openBoxEff.x = 232;
		this.openBoxEff.y = 287;
		this.openBoxEff.playFile(RES_DIR_EFF + 'kaibaoxiang', 1, () => {
			GuildStore.ins().sendGuildStoreBox();
			this.isOpenEff = false;
		});
		this.addChild(this.openBoxEff);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn0:
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.guildshopkaiqi:
				ViewManager.ins().open(GuildWin, 1);
				break;
			case this.useBtn:
				if (GuildStore.ins().guildStoreNum <= 0) {
					UserTips.ins().showTips("|C:0xf3311e&T:本日剩余次数为0|");
					return;
				}
				if (GlobalConfig.GuildStoreConfig.needContrib > Guild.ins().myCon) {
					UserTips.ins().showTips("|C:0xf3311e&T:贡献度不足|");
					return;
				}
				if (UserBag.ins().getSurplusCount() <= 0) {
					UserTips.ins().showTips("|C:0xf3311e&T:背包已满，请先清理背包|");
					return;
				}
				if (this.isOpenEff == false)
					this.startEff();
				break;
			case this.guildMore:
				ViewManager.ins().open(GuildShopRecordWin);
				break;
		}
	}
}

// ViewManager.ins().reg(GuildShopWin, LayerManager.UI_Main);