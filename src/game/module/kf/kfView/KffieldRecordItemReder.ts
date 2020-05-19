/**
 * Created by MPeter on 2018/1/17.
 * 跨服战场-跨服掉落奖励列表
 */
class KffieldRecordItemReder extends BaseItemRender {
	private bg: eui.Image;
	private dropTime: eui.Label;
	private record: eui.Label;
	private best: eui.Image;

	public constructor() {
		super();
	}

	protected dataChanged(): void {
		if (this.data instanceof KFDropRecordData) {
			this.dropTime.text = DateUtils.getFormatBySecond(this.data.time, DateUtils.TIME_FORMAT_15);

			if (this.data.type == KFDropType.KF_BOSS) {
				let roleStr: string = `|C:${0x0099ff}&T:${this.data.nick}|`;
				let item = GlobalConfig.ItemConfig[this.data.goodsId];
				let goodsColor = ItemConfig.getQualityColor(item);
				let goodsStr: string = `|C:${goodsColor}&T:[${item.name}]|`;
				let str: string = `${roleStr}在${this.data.sceneName}击杀|C:0xff0000&T:${this.data.bossName}|，获得极品${goodsStr}`;
				let textElement: egret.ITextElement[] = TextFlowMaker.generateTextFlow1(str);
				textElement[0].style.href = `event:${this.data.roleId}_${this.data.servId}`;
				textElement[0].style.underline = true;
				textElement[4].style.href = `event:${this.data.goodsId}`;
				textElement[4].style.underline = true;
				this.record.textFlow = textElement;
			}
			else if (this.data.type == KFDropType.DEVILDOM) {
				let roleStr: string = `|C:${0x00FF00}&T:S.${this.data.servId} ${this.data.guildName}行会|`;
				let goodsId = GlobalConfig.AuctionItem[this.data.goodsId].item.id;
				let item = GlobalConfig.ItemConfig[goodsId];
				let goodsColor = ItemConfig.getQualityColor(item);
				let goodsStr: string = `|C:${goodsColor}&T:[${item.name}]|`;
				let str: string = `${roleStr}在|C:0xFF00FF&T:魔界入侵|击杀|C:0xff0000&T:${this.data.bossName}|，获得行会拍卖品${goodsStr}`;
				let textElement: egret.ITextElement[] = TextFlowMaker.generateTextFlow1(str);
				textElement[6].style.href = `event:${goodsId}`;
				textElement[6].style.underline = true;
				this.record.textFlow = textElement;
			}


			this.best.visible = this.data.isBest;
			this.record.width = !this.best.visible ? 418 : 380;

			//侦听链接
			this.record.addEventListener(egret.TextEvent.LINK, this.onLink, this);
			this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeFromStage, this);
		}
	}

	/**掉落播报连接 */
	private onLink(e: egret.TextEvent): void {
		let strArr: string[] = e.text.split(`_`);
		if (strArr.length > 1) {//查看玩家
			// UserReadPlayer.ins().sendFindPlayer(parseInt(strArr[0]), parseInt(strArr[1]));
		}
		else {//查看掉落物品
			let itemconfig: ItemConfig = GlobalConfig.ItemConfig[e.text];
			let type = ItemConfig.getType(itemconfig);
			if (itemconfig != undefined && itemconfig && type != undefined) {
				if (ItemConfig.isEquip(itemconfig)) {
					ViewManager.ins().open(EquipDetailedWin, 1, undefined, itemconfig.id);
				}
				//天仙装备
				else if (type == ItemType.TYPE_21) {
					ZhanLing.ins().ZhanLingItemTips(itemconfig.id);
				}
				//天仙皮肤
				else if (type == ItemType.TYPE_22) {
					ViewManager.ins().open(ZhanlingZBTipWin, itemconfig.id);
				}
				//混骨装备
				else if (type == ItemType.TYPE_24) {
					// ViewManager.ins().open(HunguTipsWin, false, 0, itemconfig.id);
				}
				else {
					ViewManager.ins().open(ItemDetailedWin, 0, itemconfig.id);
				}
			}
		}
	}

	private removeFromStage(): void {
		this.record.removeEventListener(egret.TextEvent.LINK, this.onLink, this);
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeFromStage, this);
	}
}