/**
 * 轮回合成ITEM
 * Created by Peach.T on 2017/12/18.
 */
class SamsaraComposeItem extends BaseItemRender {

	public need: ItemBase;
	public target: ItemBase;
	public num: eui.Label;
	public compose: eui.Button;
	public redPoint: eui.Image;
	public content: eui.Group;
	//state2
	public content1: eui.Group;
	public need0: ItemBase;
	public need1: ItemBase;
	public need2: ItemBase;
	public target1: ItemBase;
	public compose1: eui.Button;
	public redPoint1: eui.Image;

	public childrenCreated(): void {
		this.init();
	}

	public init() {
		
		this.compose.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
		this.compose1.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
	}

	protected dataChanged(): void {
		let item = this.data;
		if (item) {
			let cfg;
			let id: number, count: number;
			if (item.type == MergeType.SamsareEquip) {
				cfg = GlobalConfig.ReincarnateEquipCompose[item.id];
				id = cfg.material.id;
				count = cfg.material.count;
				this.currentState = "state1";
			} else if (item.type == MergeType.ZhanlingEquip) {
				cfg = GlobalConfig.ZhanLingEquip[item.id];
				id = cfg.mat[0].id;
				count = cfg.mat[0].count;
				this.currentState = "state1";
			}
			else if (item.type == MergeType.Rune) {
				// this.currentState = "state2";
				// this.setState3Info(item.type, item.id);
				// return;
			}
			else if (item.type == MergeType.ShouShen) {
				// let quality = ShenshouModel.ins().getEquipQuality(item.id);
				// if (quality == 11) {
				// 	this.currentState = "state3";
				// 	this.setState2Info(item.type, item.id);
				// 	return;
				// }

				// this.currentState = "state1";
				// id = +item.id - 1000;
				// count = GlobalConfig.ShenShouConfig.matLimit[quality - 1].count;
			}

			this.need.isShowName(true);
			this.need.data = id;
			this.num.text = count.toString();

			this.target.isShowName(true);
			this.target.data = item.id;
			let isCan = MergeCC.ins().isCanMergeTargetId(item.type, item.id);
			this.redPoint.visible = isCan;
			if (isCan) {
				this.content.filters = null;
			}
			else {
				this.content.filters = FilterUtil.ARRAY_GRAY_FILTER;
			}
		}
	}

	private onTouch(): void {
		if (this.redPoint.visible) {
			let item = this.data;
			let cfg;
			if (item.type == MergeType.SamsareEquip) {
				cfg = GlobalConfig.ReincarnateEquipCompose[item.id];
				let roleIndex = SamsaraModel.ins().getRoleIndexByEquip(cfg.material.id);
				SamsaraCC.ins().requestCompose(item.id, roleIndex);
			} else if (item.type == MergeType.ZhanlingEquip) {
				ZhanLing.ins().sendZhanLingComposeItem(item.id);
			}
			else if (item.type == MergeType.ShouShen) {
				// ShenshouSys.ins().sendComposeEquip(ShenshouModel.ins().getCanComposeList(item.id));
			}
		}
		else if (this.redPoint1.visible) {
			if (this.data.type == MergeType.Rune) {
				// Rune.ins().sendRuneMerge(this.data.id);
			}
			else if (this.data.type == MergeType.ShouShen) {
				// ShenshouSys.ins().sendComposeEquip(ShenshouModel.ins().getCanComposeList(this.data.id));
			}
		}
		else {
			UserTips.ins().showTips(`|C:0xf3311e&T:材料不足|`);
		}
	}

	/**三个合成数据设置*/
	private setState3Info(type: number, id: number): void {
		this.redPoint.visible = false;
		this.need0.isShowName(true);
		this.need1.isShowName(true);
		this.need2.isShowName(true);
		this.target1.isShowName(true);
		if (type == MergeType.Rune) {
			// let conf = GlobalConfig.RuneComposeConfig[id];
			// let goldItemId = GlobalConfig.RuneOtherConfig.goldItemId;
			// this.need0.data = conf.material[0];
			// this.need1.data = conf.material[1];
			// this.need2.num = conf.count;
			// this.need2.data = goldItemId;
			// this.target1.data = conf.id;
		}
		let isCan = MergeCC.ins().isCanMergeTargetId(type, id);
		this.redPoint1.visible = isCan;
		this.compose1.enabled = isCan;
	}

	/**两个合成数据设置*/
	private setState2Info(type: number, id: number): void {
		this.redPoint.visible = false;
		this.need0.isShowName(true);
		this.need1.isShowName(true);
		this.target1.isShowName(true);

		if (type == MergeType.ShouShen) {
			// let needId = id - 1000;
			// let quality = ShenshouModel.ins().getEquipQuality(needId);
			// let matLimit = GlobalConfig.ShenShouConfig.matLimit[quality];
			// this.need0.data = needId;
			// this.need1.num = matLimit.mixcount;
			// this.need1.data = matLimit.id;
			// this.target1.data = id;
		}
		let isCan = MergeCC.ins().isCanMergeTargetId(type, id);
		this.redPoint1.visible = isCan;
		this.compose1.enabled = isCan;
	}

	private onRemove(e) {
		if (this.content)
			this.content.filters = null;
	}

}
