/** 玉佩 */
class JadePanel extends BaseEuiView{

	public yb:eui.Group;
	public recharge0:eui.Button;
	public ybTxt1:eui.Label;
	public jinbi:eui.Group;
	public recharge1:eui.Button;
	public goldTxt1:eui.Label;
	public maxGroup:eui.Group;
	public material:eui.Label;
	public nextAttBG:eui.Image;
	public curAtt:eui.Label;
	public nextAtt:eui.Label;
	public cursor:eui.Image;
	public starGroup:eui.Group;
	public upgradeBtn:eui.Button;
	public expGroup:eui.Group;
	public maxShowGroup:eui.Group;
	public maxCurAtt:eui.Label;
	public maxLevel:eui.Group;
	public stairImg:LevelImage;
	public yupei:JadeItem;
	public deter:eui.Image;
	public powerPanel:PowerPanel;
	public activeGroup:eui.Group;
	public sysDescText:eui.Label;
	public activeBtn:eui.Button;
	public redPoint:eui.Image;
	public activeBtnMc:eui.Group;
	public closeBtn:eui.Button;
	public dinghong:eui.Group;


	private _starList: StarList = null;

	private _oldLevel:number = 0;

	private _materialEn:boolean;

	private _iconY: number;

	private _iconMoveY: number;

	public constructor() {
		super();
		this.isTopLevel = true;
	}

	public childrenCreated():void
	{
		super.childrenCreated();
		this.init();
	}

	public init() {
		this._starList = new StarList(10);
		this._starList.x = 15;
		this._starList.y = 0;
		this.starGroup.addChild(this._starList);

		this._iconY = this.yupei.y;
		this._iconMoveY = this.yupei.y - 10;
	}

	public open(...args:any[]):void
	{
		this._oldLevel = LiLian.ins().jadeLv;

		this.observe(LiLian.ins().postJadeLv, this.update);
		this.observe(UserBag.ins().postItemAdd, this.updateMaterial);
		this.observe(UserBag.ins().postItemChange, this.updateMaterial);
		this.addTouchEvent(this, this.onTouch);
		this.update();
		this.playIconTween();
	}

	public close():void
	{
		this.removeObserve();
		this.removeTouchEvent(this, this.onTouch);
		this.stopIconTween();
	}

	/**
	 * 播放icon缓动
	 */
	private playIconTween() {
		this.yupei.y = this._iconY;
		egret.Tween.removeTweens(this.yupei);
		egret.Tween.get(this.yupei, { loop: true }).to({ y: this._iconMoveY }, 1000).to({ y: this._iconY }, 1000);
	}

	/**
	 * 停止icon缓动
	 */
	private stopIconTween() {
		egret.Tween.removeTweens(this.yupei);
	}

	private update():void
	{	
		var level:number = LiLian.ins().jadeLv;
		//战斗力
		let objAtts: AttributeData[] = [];
		let cfg:YuPeiConfig = GlobalConfig.YuPeiConfig[level];
		let per:number = 0;
		let attr:{value:number,type:number};
		for (let k in cfg.attrs)
		{
			attr = cfg.attrs[k];
			if (attr.type == AttributeType.atYuPeiDeterDam)
				per = Math.floor(attr.value / 10000 * 100);
			
			objAtts.push(new AttributeData(attr.type, attr.value));
		}
		
		this.powerPanel.setPower(UserBag.getAttrPower(objAtts));

		//阶
		var phase:number = Math.floor(level / GlobalConfig.YuPeiBasicConfig.perLevel) + 1;
		this.stairImg.setValue(phase);

		let isMax:boolean = LiLian.ins().isJadeMax();
		let isUpgrade:boolean;

		if (isMax)
		{
			this.maxGroup.visible = false;
			this.maxLevel.visible = this.maxShowGroup.visible = true;
			this.maxCurAtt.textFlow = TextFlowMaker.generateTextFlow1(AttributeData.getAttStr(objAtts, 0, 1, "："));
		}
		else
		{
			this.maxGroup.visible = true;

			//星星
			isUpgrade = this._oldLevel != level;
			this._starList.setStarNum(level % GlobalConfig.YuPeiBasicConfig.perLevel, isUpgrade ? 1 : 0);


			this._oldLevel = level;

			//消耗
			this.updateMaterial();

			this.curAtt.textFlow = TextFlowMaker.generateTextFlow1(AttributeData.getAttStr(objAtts, 0, 1, "："));

			objAtts = [];
			let nextCfg:YuPeiConfig = GlobalConfig.YuPeiConfig[level + 1];
			for (let k in nextCfg.attrs)
				objAtts.push(new AttributeData(nextCfg.attrs[k].type, nextCfg.attrs[k].value));

			this.nextAtt.textFlow = TextFlowMaker.generateTextFlow1(AttributeData.getAttStr(objAtts, 0, 1, "："));
		}	

		//玉佩
		this.yupei.setLevel(level, isUpgrade && (level % GlobalConfig.YuPeiBasicConfig.perLevel) == 10);
	}

	private updateMaterial():void
	{
		let isMax:boolean = LiLian.ins().isJadeMax();
		if (isMax)
			return;

		let level:number = LiLian.ins().jadeLv;
		let str:string = "";
		
		this._materialEn = true;

		let cfg:YuPeiConfig = GlobalConfig.YuPeiConfig[level];
		if (cfg.item_id > 0)
		{
			let item:ItemConfig = GlobalConfig.ItemConfig[cfg.item_id];				
			let itemData: ItemData = UserBag.ins().getBagItemById(cfg.item_id);
			let count:number = itemData ? itemData.count : 0;
			str = "拥有" + item.name + ":|C:" + (count < cfg.count ? "0xFF0000" : "0x00FF00") +"&T:" + count + "|/" + cfg.count;
			this._materialEn = count >= cfg.count;
		}

		this.material.textFlow = TextFlowMaker.generateTextFlow1(str);

		//红点
		this.redPoint.visible = LiLian.ins().checkJadeRed();

		//升级按钮
		this.upgradeBtn.label = this._materialEn ? ((level % GlobalConfig.YuPeiBasicConfig.perLevel) == 10 ? "升阶" : "升级") : "获得材料";
		this.upgradeBtn.visible = !isMax;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch (e.target)
		{
			case this.upgradeBtn:
				if (!this._materialEn) //材料不足
				{
					UserWarn.ins().setBuyGoodsWarn(GlobalConfig.YuPeiConfig[LiLian.ins().jadeLv].item_id);
					return;
				}

				LiLian.ins().jadeUpgrade();
				break;
			case this.closeBtn:
				ViewManager.ins().close(LiLianWin);
				break;
			case this.deter:
				ViewManager.ins().open(JadeSkillWin);
				break;
		}
	}
}