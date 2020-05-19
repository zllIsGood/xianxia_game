/**
 * 翅膀资质丹提示界面
 * @author wanghengshuai
*/
class WingZizhiTipsWin extends BaseEuiView{
	
	public bgClose:eui.Rect;
	public BG:eui.Image;
	public attr1:eui.Label;
	public attr1NextLv:eui.Label;
	public attr2:eui.Label;
	public attr2NextLv:eui.Label;
	public attr3:eui.Label;
	public attr3NextLv:eui.Label;
	public attr4:eui.Label;
	public attr4NextLv:eui.Label;
	public powerPanel:PowerPanel;
	public wingName:eui.Label;
	public zizhiLv:eui.Label;
	public career:eui.Label;
	public updateBtn:eui.Button;
	public maxLvDesc:eui.Label;
	public itemImg:eui.Image;
	public costNum:eui.Label;

	private _curRole:number = 0;

	public constructor() {
		super();
		this.skinName = "wingZizhiTips";
		this.isTopLevel = true;
	}

	public open(...args:any[]):void
	{
		this._curRole = args[0];

		this.observe(UserBag.ins().postItemAdd, this.itemChange);
		this.observe(UserBag.ins().postItemChange, this.itemChange);
		this.observe(UserBag.ins().postItemDel, this.itemChange);
		this.observe(Wing.ins().postUseDanSuccess, this.update);
		this.observe(Wing.ins().postWingUpgrade, this.update);
		this.addTouchEvent(this, this.onTouch);

		this.update();
	}

	private update():void
	{
		let role:Role = SubRoles.ins().getSubRoleByIndex(this._curRole);
		let cfg:WingLevelConfig = GlobalConfig.WingLevelConfig[role.wingsData.lv];
		this.wingName.text = cfg.name;
		this.zizhiLv.text = role.wingsData.aptitudeDan + "级";
		this.career.text = Role.getJobNameByJob(role.job);
		let maxNum:number = cfg.attrPill;
		if (role.wingsData.aptitudeDan >= maxNum) //最大值
			this.currentState = "maxLv";
		else
		{
			let itemData: ItemData = UserBag.ins().getBagItemById(GlobalConfig.WingCommonConfig.attrPillId);
			let num:number = itemData ? itemData.count : 0;
			if (num)
				this.currentState = "normal";
			else
				this.currentState = "noitem";
		}

		this.updateAttrs();
	}

	private updateAttrs():void
	{
		//增加属性
		let role:Role = SubRoles.ins().getSubRoleByIndex(this._curRole);
		let attrs:AttributeData[] = GlobalConfig.WingCommonConfig.attrPill;
		let len:number = attrs.length;
		let pAttr:AttributeData[] = [];
		let attData:AttributeData;
		for (let i:number = 1; i <= 4; i++)
		{
			this["attr" + i].text = "";
			this["attr" + i + "NextLv"].text = "";
			if (i <= len)
			{
				attData = attrs[i - 1];
				this["attr" + i].text = AttributeData.getAttrStrByType(attData.type) + ": +" + (attData.value * role.wingsData.aptitudeDan);
				pAttr.push(new AttributeData(attData.type, attData.value * role.wingsData.aptitudeDan));

				if (this.currentState == "normal")
					this["attr" + i + "NextLv"].text = "+" + (attrs[i - 1].value * (role.wingsData.aptitudeDan + 1));
			}
		}

		this.powerPanel.setPower(UserBag.getAttrPower(pAttr));
	}

	private itemChange():void
	{
		if (this.currentState == "maxLv")
			return;
		
		let itemData: ItemData = UserBag.ins().getBagItemById(GlobalConfig.WingCommonConfig.attrPillId);
		let num:number = itemData ? itemData.count : 0;
		let stateChange:boolean;
		if (num)
		{
			stateChange = this.currentState != "normal";
			this.currentState = "normal";
		}
		else
		{
			stateChange = this.currentState != "noitem";
			this.currentState = "noitem";
		}

		if (stateChange)
			this.updateAttrs();
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch(e.target)
		{
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.updateBtn:
				Wing.ins().sendUseDan(this._curRole, 0);
				break;
		}
	}

}

ViewManager.ins().reg(WingZizhiTipsWin, LayerManager.UI_Main);