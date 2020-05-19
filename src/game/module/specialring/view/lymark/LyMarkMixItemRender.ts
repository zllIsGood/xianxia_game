/**
 * 烈焰印记合成面板子项
 * Created by wanghengshuai on 2018/1/3.
 */
class LyMarkMixItemRender extends BaseItemRender{
	
	public limitLv:eui.Label;
	public cost:eui.Label;
	public stock:eui.Label;
	public MixBtn:eui.Button;
	public itemIcon:ItemBase;
	public redpoint:eui.Image;

	public constructor() {
		super();
		this.skinName = "markMixItemSkin";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.MixBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	public dataChanged():void
	{
		//{cfg:cfg, count:count, itemName:itemName, itemCount:itemCount}
		let hasCost:boolean = this.data.cfg.costItem;
		this.limitLv.textFlow = TextFlowMaker.generateTextFlow1(this.data.cfg.mixDesc);
		this.cost.textFlow = TextFlowMaker.generateTextFlow1(hasCost ? "合成消耗："+ `|C:${this.data.count ? 0xD1C28F : 0xff0000}&T:${this.data.itemName} X${this.data.cfg.costCount}` : "");
		//this.cost.text = hasCost ? "合成消耗："+ this.data.itemName +" X" + this.data.cfg.costCount : "";
		this.stock.textFlow = TextFlowMaker.generateTextFlow1(`当前拥有：|C:${this.data.itemCount ? 0x00ff00 : 0xff0000}&T:${this.data.itemCount}`);
		this.MixBtn.label = hasCost ? "一键合成" : "获取";
		this.MixBtn.enabled = !hasCost || LyMark.ins().lyMarkLv >= this.data.cfg.limitLv;
		this.redpoint.visible = hasCost && LyMark.ins().lyMarkLv >= this.data.cfg.limitLv && this.data.count >= this.data.cfg.costCount;	
		this.itemIcon.data = this.data.cfg.itemId;
	}

	private onTap(e:egret.TouchEvent) {
		if (this.data.cfg.costItem)
		{
			if (this.data.count >= this.data.cfg.costCount)
				LyMark.ins().sendCompound(this.data.cfg.itemId);
			else
				UserTips.ins().showTips("材料不足");
		}
		else
			UserWarn.ins().setBuyGoodsWarn(this.data.cfg.itemId);
    }

	public destruct(): void {
		this.MixBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}
}