class GwResetWin extends BaseEuiView{

	public bgclose:eui.Rect;
	public gwName:eui.Label;
	public price:PriceIcon;
	public resetBtn:eui.Button;
	public title:eui.Label;
	public resetDesc:eui.Label;

	private _dataWeapon: GodWeaponData;

	public constructor() {
		super();
		this.skinName = "GwResetSkin";
		this.isTopLevel = true;
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}


	public init() {
		this.price.setType(MoneyConst.yuanbao);
	}

	public open(...args:any[]):void
	{
		this.addTouchEvent(this.bgclose, this.onTouch);
		this.addTouchEvent(this.resetBtn, this.onTouch);

		this.price.setPrice(GlobalConfig.GodWeaponBaseConfig.skillResetCost);
		this._dataWeapon = args[0];
		
		let point:number = this._dataWeapon.getResetPoint();
		this.resetDesc.text = point > 0 ? `重置后可返还${point}技能点` : `目前没有可重置的技能`;
		this.gwName.text = this._dataWeapon.getWeaponName();
		this.resetBtn.enabled = point > 0 &&  Actor.yb >= GlobalConfig.GodWeaponBaseConfig.skillResetCost;
	}


	private onTouch(e:egret.TouchEvent):void
	{
		switch(e.target)
		{
			case this.bgclose:
				ViewManager.ins().close(this);
				break;
			case this.resetBtn:
				GodWeaponCC.ins().sendReset(this._dataWeapon.weaponId);
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(GwResetWin, LayerManager.UI_Main);