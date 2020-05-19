class FlowerShowItem extends eui.Component{
	
	public flowerImg:eui.Image;
	public flowereff:eui.Group;

	public isPlaying:boolean;

	public mcEff:MovieClip;

	public imgBg:eui.Image;

	private _inited:boolean;

	public constructor() {	
		super();
		this.skinName = "flowerShowItem";
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this._inited = true;	
		this.showEffect();
	}

	public showEffect():void
	{
		if (!this._inited)
			return;

		if (this.isPlaying)
			return;
		
		this.flowerImg.alpha = 1;
		if (!this.mcEff)
		{
			this.mcEff = new MovieClip;
			this.flowereff.addChild(this.mcEff);
		}

		// this.mcEff.playFile(`${RES_DIR_EFF}flowereff`, 1, this.playComplete.bind(this), true);
		this.isPlaying = true;
		
		if (!this.flowerImg.hasEventListener(egret.TouchEvent.TOUCH_TAP)){
			this.flowerImg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
		}

		if (!this.hasEventListener(egret.TouchEvent.REMOVED_FROM_STAGE)){
			this.addEventListener(egret.TouchEvent.REMOVED_FROM_STAGE, this.onRemove, this);	
		}

		this.flowerImg.source = null;
		this.flowerImg.source = "songhua_bt_hua01";
		this.imgBg.source = null;
		this.imgBg.source = "songhua_bg_huaguangxiao";
	}

	private onRemove(e:egret.TouchEvent):void
	{
		this.flowerImg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
		this.removeEventListener(egret.TouchEvent.REMOVED_FROM_STAGE, this.onRemove, this);
		if (this.mcEff)
		{
			this.mcEff.destroy();
			this.mcEff = null;
			this.isPlaying = false;
		}
	}

	private onTouch(e:egret.TouchEvent):void
	{
		ViewManager.ins().open(FlowerOpenWin);
		DisplayUtils.removeFromParent(this);
	}

	private playComplete():void
	{
		this.mcEff.destroy();
		this.mcEff = null;
		this.flowerImg.alpha = 1;
		this.isPlaying = false;
	}

}