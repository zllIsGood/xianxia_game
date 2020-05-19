/**
 * 称号列表项
 */
class TitleItem extends BaseItemRender{
	public img:eui.Image;
	public btnSet:eui.Button;
	public labLack:eui.Label;
	public time:eui.Label;
	public power:eui.Group;
	public labRare:eui.Label;
	public attrs:eui.DataGroup;
	public attrsTotal:eui.DataGroup;

	private conditionTxt:eui.Label;

	private _power:number;
	private titleMc:MovieClip;

	/** 稀有度列表 */
	private static rareText:any[] = 
	[
		'0x00ff3c&T:普通',
		'0x066eba&T:珍贵',
		'0xd200ff&T:珍稀',
		'0xf45601&T:国器',
		'0xFF0000&T:无双',
	];
	
	public constructor() {
		super();
	}

	private onTap(e:egret.TouchEvent):void
	{
		if(e.target == this.btnSet)
		{
			//设置称号
			Title.ins().postUseTitle(this.data);
		}
		else
		{
			//展开、收起
			this.currentState = this.currentState != 'expand' ? 'expand' : 'simple';
			MessageCenter.ins().dispatch(Title.TITLE_WIN_REFLASH_PANEL, this,this.currentState);
		}
	}
	
	public dataChanged():void
	{

		this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
		if(this.data instanceof TitleInfo)
		{
			let titleInfo:TitleInfo = this.data as TitleInfo;
			this.attrs.itemRenderer = TitleAttrItem
			this.attrsTotal.itemRenderer = TitleAttrItem
			this.attrs.dataProvider = titleInfo.attrsText
			this.attrsTotal.dataProvider = titleInfo.attrsTotal

			this.conditionTxt.text = `获得条件：${titleInfo.config.condition}`;
			//称号外观
			this.img.source = titleInfo.config.img;

			if(titleInfo.config.eff){
				if(!this.titleMc){
					this.titleMc = ObjectPool.pop("MovieClip");
					this.titleMc.x = 118;
					this.titleMc.y = 30;
					this.addChildAt(this.titleMc,20);
				}
				this.titleMc.playFile(RES_DIR_EFF+titleInfo.config.eff,-1);
			} else {
				if(this.titleMc) {
					this.titleMc.destroy();
					this.titleMc = null;
				}
			}

			//更新按钮的显示
			if(titleInfo.endTime >= 0)
			{
				this.btnSet.label = titleInfo.config.Id == Title.ins().showTitleDic[Title.ins().curSelectRole] ? '卸下' : Title.ins().showTitleDic[Title.ins().curSelectRole] ? '更换' : '穿戴';
				this.btnSet.visible = true;
				this.time.visible = true;
				let s: number = DateUtils.formatMiniDateTime(titleInfo.endTime) / 1000;
				this.time.text = titleInfo.endTime == 0 ? "有效期：永久" : "有效期：" + DateUtils.getFormatBySecond(s, 2);
				this.labLack.visible = false;
			}
			else
			{
				this.btnSet.visible = false;
				this.time.visible = false;
				this.labLack.visible = true;
			}
			//稀有度
			if(typeof TitleItem.rareText[titleInfo.config.rare] == 'string')
				TitleItem.rareText[titleInfo.config.rare] = TextFlowMaker.generateTextFlow('稀有度：|C:' + TitleItem.rareText[titleInfo.config.rare]);
			this.labRare.textFlow = TitleItem.rareText[titleInfo.config.rare];
			//战斗力
			if(this._power != titleInfo.power)
			{
				if(this._power)
					BitmapNumber.ins().desstroyNumPic(this.power.getChildAt(0) as eui.BitmapLabel);
				this.power.addChildAt(BitmapNumber.ins().createNumPic( titleInfo.power * SubRoles.ins().subRolesLen, '8'), 0);
				this._power = titleInfo.power;
			}
			this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		}
		//清空
		else
		{
			this.img.source = '';
			this.conditionTxt.text = '';

			if(this._power)
			{
				this._power = 0;
				BitmapNumber.ins().desstroyNumPic(this.power.getChildAt(0) as eui.BitmapLabel);
			}
			this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		}
	}

	private onRemove(){
		this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
		this.attrs.dataProvider = null;
		this.attrsTotal.dataProvider = null;
	}
	
}