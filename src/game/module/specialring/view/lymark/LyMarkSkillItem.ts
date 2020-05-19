/**
 * 烈焰印记技能图标
 * Created by wanghengshuai on 2018/1/2.
 */
class LyMarkSkillItem  extends eui.Component{
	
	public skillImg:eui.Image;
	public skillName:eui.Label;
	public redpoint:eui.Image;
	public lock:eui.Rect;

	private _cfg:FlameStampEffect;

	public constructor() {
		super();
		//this.skinName = "markSkillItemSkin";

		this.touchEnabled = true;
		this.touchChildren = false;

		this.addEventListener(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
	}

	public setCfg(cfg:FlameStampEffect):void
	{
		this._cfg = cfg;
		this.update();
	}

	public getCfg():FlameStampEffect
	{
		return this._cfg;
	}

	private addToStage(e:egret.Event):void
	{
		this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.addToStage, this);
		MessageCenter.addListener(LyMark.ins().postMarkData, this.update, this);
		MessageCenter.addListener(UserBag.ins().postItemAdd, this.update, this);
		MessageCenter.addListener(UserBag.ins().postItemChange, this.update, this);

		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeStage, this);
	}

	private removeStage(e:egret.Event):void
	{
		MessageCenter.ins().removeAll(this);
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.removeStage, this);
	}

	private update():void
	{
		if (!this._cfg)
			return;
		
		this.skillImg.source = this._cfg.icon;
		this.skillName.textFlow = TextFlowMaker.generateTextFlow1(this._cfg.skillname);
		let lv:number = LyMark.ins().getSkillLvById(this._cfg.id);
		this.lock.visible = !lv;
		this.redpoint.visible = false;
		if (this._cfg.id != 1)
		{
			let isMax:boolean = lv >= (Object.keys(GlobalConfig.FlameStampEffect[this._cfg.id]).length);
			if (isMax)
				return;

			let nextCfg:FlameStampEffect = GlobalConfig.FlameStampEffect[this._cfg.id][lv <=0 ? 1 : lv + 1];
			if (nextCfg.costItem)
			{
				let itemConfig:ItemConfig = GlobalConfig.ItemConfig[nextCfg.costItem];
				let itemData: ItemData = UserBag.ins().getBagItemById(nextCfg.costItem);
				let count:number = itemData ? itemData.count : 0;
				this.redpoint.visible = count >= nextCfg.costCount && LyMark.ins().lyMarkLv >= nextCfg.stampLevel;
			}
		}		
	}
	
}