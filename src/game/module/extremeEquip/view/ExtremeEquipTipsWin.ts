class ExtremeEquipTipsWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public nameLabel:eui.Label;
	public itemIcon:ItemIcon;
	public pos:eui.Label;//部位名
	// public lv:eui.Label;
	// public career:eui.Label;
	public powerPanel:PowerPanel;
	//attr4 2 5 6 攻 生 物 法
	public chainGroup:eui.Group;//灵魂锁链组
	public chainName:eui.Label;//杀戮 庇护名
	public chainLv:eui.Label;//杀戮 庇护等级
	public chainPos:eui.Label;//杀戮 庇护描述
	public soulName:eui.Label;//灵魂锁链名
	public soulLv:eui.Label;//灵魂锁链等级
	public soulAttr:eui.Label;//灵魂锁链描述
	private posId:number;
	public constructor() {
		super();
		this.skinName = "ExtremeEquipTipsSkin";
		this.isTopLevel = true;
	}

	public open(...args:any[]):void{
		this.posId = args[0];
		this.addTouchEvent(this.bgClose, this.onTouch);
		this.updateTips();
	}
	private updateTips(){
		this.pos.text = Role.getEquipNameByType(this.posId);
		let config:ZhiZunEquipLevel = GlobalConfig.ZhiZunEquipLevel[this.posId][1];
		let id:number = config.materialInfo.id;
		let itemConfig:ItemConfig = GlobalConfig.ItemConfig[id];
		this.nameLabel.text = itemConfig.name;
		this.itemIcon.setData(itemConfig);
		this.powerPanel.setPower(config.showPower);
		for( let i in config.attrs ){
			if( this[`attr${config.attrs[i].type}`] )
				this[`attr${config.attrs[i].type}`].text = config.attrs[i].value;
		}
		if( this.posId == EquipPos.WEAPON || this.posId == EquipPos.CLOTHES ){
			this.chainName.text = ExtremeEquipModel.ins().getSkillName(this.posId);
			this.chainPos.textFlow = TextFlowMaker.generateTextFlow1(StringUtils.replaceStrColor(ExtremeEquipModel.ins().getSkillDesc(this.posId),"0xffff00"));
		}else{
			DisplayUtils.removeFromParent(this.chainGroup);
		}
		let secPos = ExtremeEquipModel.ins().getLinkEquipPos(this.posId);
		let zzll:ZhiZunLinkLevel = GlobalConfig.ZhiZunLinkLevel[this.posId][secPos][1];
		this.soulAttr.textFlow = TextFlowMaker.generateTextFlow1(StringUtils.replaceStrColor(zzll.chainDesc,"0xffff00"));
	}

	public close():void{
		this.removeTouchEvent(this.bgClose, this.onTouch);
	}

	private onTouch(e:egret.TouchEvent):void{
		ViewManager.ins().close(this);
	}
}
ViewManager.ins().reg(ExtremeEquipTipsWin, LayerManager.UI_Popup);
