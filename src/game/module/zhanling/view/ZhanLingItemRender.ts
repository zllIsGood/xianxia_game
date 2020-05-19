/**
 * 天仙道具显示类
 */
class ZhanLingItemRender extends BaseItemRender {
	private quality: eui.Image;
	private equip: eui.Image;
	private redPoint: eui.Image;
	private equips: ItemData[];//背包里边的天仙装备
	private bestId: number;
	private bg: eui.Image;

	constructor() {
		super();
		this.skinName = 'ZhanlingEquipSkin';
		this.init();
	}

	/**触摸事件 */
	protected init(): void {
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	protected dataChanged(): void {
		if (!this.data)return;
		let id = this.data.id;
		this.equips = this.data.equips;//equips外部排好序传进来 从好到坏
		this.bg.source = this.getPosImg(Number(this.name));//部位资源
		this.bg.visible = true;
		this.equip.visible = !this.bg.visible;
		this.redPoint.visible = this.getRedPoint();
		if (!this.data.id)return;
		let config: ItemConfig = GlobalConfig.ItemConfig[id];
		if (!config)return;
		this.quality.source = 'quality' + ItemConfig.getQuality(config);
		this.equip.source = config.icon + '_png';
		this.bg.visible = false;
		this.equip.visible = !this.bg.visible;
	}

	private getRedPoint(): boolean {
		let curequip: ZhanLingEquip;
		if (this.data.id) {//有数据代表部位有装备
			curequip = GlobalConfig.ZhanLingEquip[this.data.id];
		}
		for (let i = 0; i < this.equips.length; i++) {
			let id = this.equips[i].configID;
			let config: ItemConfig = GlobalConfig.ItemConfig[id];
			if (!config)continue;
			let zlequip: ZhanLingEquip = GlobalConfig.ZhanLingEquip[id];
			if (!zlequip)continue;
			if (Number(this.name) != zlequip.pos)continue;
			let lv = config.level ? config.level : 0;
			let zslv = config.zsLevel ? config.zsLevel : 0;
			if (UserZs.ins().lv >= zslv && Actor.level >= lv) {//装备限制条件
				if (curequip) {//和身上的对比
					if (zlequip.level > curequip.level) {
						this.bestId = zlequip.id;
						return true;
					} else {
						//由于背包天仙装备经过从好到坏的排序 这里一旦不比身上的好就可以断定后面的不会有更好
						return false;
					}
				} else {
					this.bestId = zlequip.id;
					return true;//身上没装备 直接可穿戴
				}
			}
		}

		return false;
	}


	private getPosImg(pos: number): string {
		let str = `zl_equip_bg_${pos}`;
		// switch (pos){
		// 	case ZLPOS.ITEM1:
		// 		str = "";
		// 		break;
		// 	case ZLPOS.ITEM2:
		// 		str = "";
		// 		break;
		// 	case ZLPOS.ITEM3:
		// 		str = "";
		// 		break;
		// 	case ZLPOS.ITEM4:
		// 		str = "";
		// 		break;
		// }
		return str;
	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	public onClick() {
		if (!this.data)return;
		if (!this.data.id && !this.redPoint.visible) {
			UserTips.ins().showTips(`没有可穿戴的天仙装备`);
			return;
		}
		if (this.data.id && !this.redPoint.visible) {
			// UserTips.ins().showTips(`弹出身上装备Tips`);
			ZhanLing.ins().ZhanLingItemTips(this.data.id, 0, true);
			return;
		}
		if (isNaN(this.data.zlId)) {
			UserTips.ins().showTips(`天仙id异常`);
			return;
		}
		if (!this.bestId) {
			UserTips.ins().showTips(`穿戴装备异常`);
			return;
		}
		if (!this.data.id && this.redPoint.visible) {
			// UserTips.ins().showTips(`直接发送穿戴消息`);
			ZhanLing.ins().sendZhanLingWear(this.data.zlId, this.bestId);
			return;
		}
		ZhanLing.ins().sendZhanLingWear(this.data.zlId, this.bestId);
		// UserTips.ins().showTips(`发送穿戴更好的装备消息`);
	}


}