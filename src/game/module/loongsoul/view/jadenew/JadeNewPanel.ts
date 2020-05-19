/** 新玉佩 */
class JadeNewPanel extends BaseEuiView{
	
	public dinghong:eui.Group;
	public lv:eui.BitmapLabel;
	public yupei:JadeItem;
	public powerPanel:PowerPanel;
	public up0:eui.Image;
	public redPoint0:eui.Image;
	public used0:eui.Label;
	public up1:eui.Image;
	public redPoint1:eui.Image;
	public used1:eui.Label;
	public up2:eui.Image;
	public redPoint2:eui.Image;
	public used2:eui.Label;
	public maxGroup:eui.Group;
	public checkBoxs0:eui.CheckBox;
	public lvImg0:eui.Image;
	public lvNum0:eui.Label;
	public checkBoxs1:eui.CheckBox;
	public lvImg1:eui.Image;
	public lvNum1:eui.Label;
	public checkBoxs2:eui.CheckBox;
	public lvImg2:eui.Image;
	public lvNum2:eui.Label;
	public upgradeBtn:eui.Button;
	public btnRedPoint0:eui.Image;
	public upgradeBtn0:eui.Button;
	public btnRedPoint1:eui.Image;
	public nextAttBG:eui.Image;
	public curAtt:eui.Label;
	public nextAtt:eui.Label;
	public cursor:eui.Image;
	public barGroup:eui.Group;
	public skillIcon0:eui.Image;
	public blackImg0:eui.Rect;
	public skillIcon1:eui.Image;
	public blackImg1:eui.Rect;
	public skillIcon2:eui.Image;
	public blackImg2:eui.Rect;
	public skillIcon3:eui.Image;
	public blackImg3:eui.Rect;
	public skillIcon4:eui.Image;
	public blackImg4:eui.Rect;
	public maxLevel:eui.Group;
	public maxShowGroup:eui.Group;
	public maxCurAtt:eui.Label;
	public material:eui.Group;
	public upLv:eui.Group;
	public upgradeBtn1:eui.Button;
	public btnRedPoint2:eui.Image;
	public normal:eui.Group;

	private expBar:ProgressBarEff;

	private _curRole:number = 0;

	private _oldLevel:number = 0;

	private _jadeData:JadeDataNew;

	private _danInfo:{id:number, used:number, curMax:number, jade:number, count:number}[];

	private _materialInfo:{id:number, count:number, addExp:number}[];

	private _curMaterail:number = -1;

	private _oneKeyUp:boolean = false;

	public constructor() {
		super();
		//this.skinName = "YuPeiNewSkin";
	}

	public childrenCreated():void {
		super.childrenCreated();
		this.init();
	}

	public init() {		
		this.yupei.perLevel = GlobalConfig.JadePlateBaseConfig.perLevel;

		//设置提升丹信息
		this._danInfo = [];
		let i:number = 0;
		let itemConfig:ItemConfig;
		for (let key in GlobalConfig.JadePlateBaseConfig.upgradeInfo)
		{
			this["up" + i].name = i;
			itemConfig = GlobalConfig.ItemConfig[key];
			this["up" + i].source = itemConfig.icon + '_png';
			this._danInfo.push({id:(+key), used:0, curMax:0, jade:0, count:0});
			i++;
		}

		//升级材料
		this._materialInfo = [];
		i = 0;
		for (let key in GlobalConfig.JadePlateBaseConfig.itemInfo)
		{
			this["checkBoxs" + i].name = i;
			itemConfig = GlobalConfig.ItemConfig[key];
			this["lvImg" + i].source = itemConfig.icon + '_png';
			this["lvImg" + i].name = key;
			this._materialInfo.push({id:(+key), count:0, addExp:(+GlobalConfig.JadePlateBaseConfig.itemInfo[key])});
			i++;
		}

		//技能
		for (i = 0; i < 5; i++)
		{
			this["skillIcon" + i].name = i;
			this["skillIcon" + i].touchEnabled = true;	
			this["skillIcon" + i].touchChildren = false;	
		}

		//进度条
		this.setSkinPart("expBar", new ProgressBarEff());
	}

	public open(...args:any[]):void
	{
		if (args && args.length)
			this._curRole = args[0];

		this._jadeData = JadeNew.ins().getJadeDataByID(this._curRole);
		if (!this._jadeData)
			return;

		this._oldLevel = this._jadeData.lv;

		this.observe(JadeNew.ins().postJadeData, this.jadeChange);
		this.observe(UserBag.ins().postItemAdd, this.updateMaterial);
		this.observe(UserBag.ins().postItemChange, this.updateMaterial);
		this.addTouchEvent(this, this.onTouch);
		this.reset();
		this.update();
		this.initCheckBoxs();
		this.playIconTween();

	}

	private initCheckBoxs():void
	{
		let len:number = this._materialInfo.length;
		this._curMaterail = 0;
		for (let i:number = 0; i < len; i++)
		{
			if (this._materialInfo[i].count)
			{
				this._curMaterail = i;
				break;
			}
		}

		this["checkBoxs" + this._curMaterail].selected = true;
	}

	private reset():void
	{
		this._curMaterail = -1;
		this.stopOneKyUp();
		this.checkBoxs0.selected = this.checkBoxs1.selected = this.checkBoxs2.selected = false;
	}

	public close():void
	{
		this.stopIconTween();
		this._curMaterail = -1;
		this.stopOneKyUp();
	}

	private jadeChange(roleID:number):void
	{
		if (this._curRole != roleID)
			return;
		
		this._jadeData = JadeNew.ins().getJadeDataByID(this._curRole);
		this.update();
	}

	/**
	 * 播放icon缓动
	 */
	private playIconTween() {
		if(!this.yupei.light) return;
		egret.Tween.get(this.yupei.light,{loop:true}).to({y:this.yupei.light.y+20},2500,egret.Ease.sineInOut).to({y:this.yupei.light.y},2500,egret.Ease.sineInOut);
	}

	/**
	 * 停止icon缓动
	 */
	private stopIconTween() {
		if(!this.yupei.light) return;
		egret.Tween.removeTweens(this.yupei.light);
	}

	private update():void
	{	
		var level:number = this._jadeData.lv;
		//战斗力
		let objAtts: AttributeData[] = [];
		let cfg:JadePlateLevelConfig = GlobalConfig.JadePlateLevelConfig[level];
		let attr:{value:number,type:number};
		for (let k in cfg.attrs)
		{
			attr = cfg.attrs[k];
			objAtts.push(new AttributeData(attr.type, attr.value));
		}

		//提升丹增加的属性
		objAtts = this.addDanAtt(objAtts);
		this.powerPanel.setPower(UserBag.getAttrPower(objAtts, SubRoles.ins().getSubRoleByIndex(this._curRole)));

		//阶
		let phase:number = Math.floor(level / GlobalConfig.JadePlateBaseConfig.perLevel) + 1;
		this.lv.text = this.getNumStr(phase) + "阶" + this.getNumStr((level % GlobalConfig.JadePlateBaseConfig.perLevel)) + "级";

		let isMax:boolean = JadeNew.ins().isJadeMax(this._curRole);
		let isUpgrade:boolean;
		this.maxShowGroup.visible = this.maxLevel.visible = isMax;
		//消耗
		this.updateMaterial();
		
		if (isMax)
		{
			this.maxGroup.visible = false;
			this.maxCurAtt.textFlow = TextFlowMaker.generateTextFlow1(AttributeData.getAttStr(objAtts, 0, 1, "："));
		}
		else
		{
			this.maxGroup.visible = true;

			//星星
			isUpgrade = this._oldLevel != level;

			this._oldLevel = level;

			this.curAtt.textFlow = TextFlowMaker.generateTextFlow1(AttributeData.getAttStr(objAtts, 0, 1, "："));

			objAtts = [];
			let nextCfg:JadePlateLevelConfig = GlobalConfig.JadePlateLevelConfig[level + 1];
			for (let k in nextCfg.attrs)
				objAtts.push(new AttributeData(nextCfg.attrs[k].type, nextCfg.attrs[k].value));

			//提升丹增加的属性
			objAtts = this.addDanAtt(objAtts);
			this.nextAtt.textFlow = TextFlowMaker.generateTextFlow1(AttributeData.getAttStr(objAtts, 0, 1, "："));
		}	

		//玉佩
		let jade:number = Math.floor(level / (GlobalConfig.JadePlateBaseConfig.perLevel * 9));
		this.yupei.setLevel(level, isUpgrade && (level % GlobalConfig.JadePlateBaseConfig.perLevel) == 10);

		//进度条
		if (level % GlobalConfig.JadePlateBaseConfig.perLevel == 10)
			this.barGroup.visible = false;
		else
		{
			this.barGroup.visible = true;
			this.expBar.setData(this._jadeData.exp, cfg.exp);	
		}

		//技能
		cfg = GlobalConfig.JadePlateLevelConfig[(phase - 1) * GlobalConfig.JadePlateBaseConfig.perLevel];
		let len:number = GlobalConfig.JadePlateBaseConfig.skillUnlock.length;
		let skillLen:number = cfg.skillIdList ? cfg.skillIdList.length : 0;
		for (let i:number = 0; i < len; i++)
		{	
			this["blackImg" + i].visible = true;
			for (let j:number = 0; j < skillLen; j++)
			{
				if (cfg.skillIdList[j] == GlobalConfig.JadePlateBaseConfig.skillUnlock[i].id)
					this["blackImg" + i].visible = false;
			}
		}

	}

	private getNumStr(num:number):string
	{
		let list:number[] = [];
		if (Math.floor(num / 10))
		{
			let shi:number = Math.floor(num / 10);
			if (shi > 1)
				list.push(shi);
			
			list.push(10);
			if (num % 10 != 0)
				list.push(num % 10);
		}
		else
			list.push(num % 10);
		
		let str:string = "";
		let len:number = list.length;
		for (let i:number = 0; i < len; i++)
		{
			switch(list[i])
			{
				case 0:
					str += "零";
					break;
				case 1:
					str += "一";
					break;
				case 2:
					str += "二";
					break;
				case 3:
					str += "三";
					break;
				case 4:
					str += "四";
					break;
				case 5:
					str += "五";
					break;
				case 6:
					str += "六";
					break;
				case 7:
					str += "七";
					break;
				case 8:
					str += "八";
					break;
				case 9:
					str += "九";
					break;
				case 10:
					str += "十";
					break;
			}
		}
	
		return str;
	}

	/** 提升丹增加的属性 */
	private addDanAtt(objAtts:AttributeData[]):AttributeData[]
	{	
		if (this._jadeData.danDate && Object.keys(this._jadeData.danDate).length)
		{
			let newObj:AttributeData[] = objAtts.concat();
			let atts:{attr:{value:number,type:number}[],precent:number};
			let subLen:number;
			for (let key in this._jadeData.danDate)
			{
				atts = GlobalConfig.JadePlateBaseConfig.upgradeInfo[key];
				if (atts.precent) //玉佩百分比属性
				{
					let newLen:number = newObj.length;
					for (let m:number = 0; m < newLen; m++)
					{
						if (newObj[m].type != AttributeType.atHuiXinDamage)
							objAtts.push(new AttributeData(newObj[m].type,  Math.floor(newObj[m].value * (+this._jadeData.danDate[key]) * atts.precent / 10000)));				
					}
				}

				if (atts.attr)
				{
					subLen = atts.attr.length;
					for (let j:number = 0; j < subLen; j++)
						objAtts.push(new AttributeData( atts.attr[j].type,  atts.attr[j].value * (+this._jadeData.danDate[key])));
				}	
			}

			//合并相同属性
			newObj = [];
			subLen = objAtts.length;
			let obj:Object = new Object();
			for (let i:number = 0; i < subLen; i++)
			{
				if (obj[objAtts[i].type] == undefined)
					obj[objAtts[i].type] = 0;
				
				obj[objAtts[i].type]+= objAtts[i].value;
			}

			for (let key in obj)
				newObj.push(new AttributeData((+key), (+obj[key])));

			return newObj;
		}

		return objAtts; 
	}

	private updateMaterial():void
	{	
		let level:number = this._jadeData.lv;

		let len:number = this._danInfo.length;
		let info:{id:number, used:number, curMax:number, jade:number, count:number};
		let itemData: ItemData;
		let phase:number = Math.floor(level / GlobalConfig.JadePlateBaseConfig.perLevel) + 1;
		let lvCfg:JadePlateLevelConfig;
		for (let i:number = 0; i < len; i++)
		{
			info = this._danInfo[i];
			itemData = UserBag.ins().getBagItemById(info.id);
			info.count = itemData ? itemData.count : 0;
			info.used = this._jadeData.danDate && this._jadeData.danDate[info.id] ? (+this._jadeData.danDate[info.id]) : 0;
			info.jade = phase;
			lvCfg = GlobalConfig.JadePlateLevelConfig[(phase - 1) * GlobalConfig.JadePlateBaseConfig.perLevel];
			info.curMax = lvCfg.upgradeItemInfo && lvCfg.upgradeItemInfo[info.id] ? (+lvCfg.upgradeItemInfo[info.id]) : 0;
			this["used" + i].text = info.used;
			this["redPoint" + i].visible = info.used < info.curMax && info.count;
		}

		len = this._materialInfo.length;
		let material:{id:number, count:number, addExp:number};
		let addExp:number = 0;
		for (let i:number = 0; i < len; i++)
		{
			material = this._materialInfo[i];
			itemData = UserBag.ins().getBagItemById(material.id);
			material.count = itemData ? itemData.count : 0;
			this["lvNum" + i].textFlow = TextFlowMaker.generateTextFlow1(`|C:${material.count ? 0x00ff00 : 0xff0000}&T:${material.count}`);
			addExp += (material.addExp * material.count);
		}
		
		//this.btnRedPoint0.visible = (addExp + this._jadeData.exp) >= GlobalConfig.JadePlateLevelConfig[level].exp;

		//升级按钮
		//this.upgradeBtn.label = this._materialEn ? ((level % GlobalConfig.JadePlateBaseConfig.perLevel) == 10 ? "升阶" : "升级") : "获得材料";
		this.normal.visible = (level % GlobalConfig.JadePlateBaseConfig.perLevel) != 10;
		this.upLv.visible = !this.normal.visible;
		this.upgradeBtn0.visible = this.upgradeBtn.visible;
	}

	private onTouch(e:egret.TouchEvent):void
	{
		switch (e.target)
		{
			case this.upgradeBtn:
				this.onUpgrade();
				break;
			case this.upgradeBtn0: //一键升级
				this.onUpgrade(true);
				break;
			case this.upgradeBtn1: //升阶
				this.onUpgrade();
				break;
			case this.up0:
			case this.up1:
			case this.up2:
				let info:{id:number, used:number, curMax:number, jade:number, count:number} = this._danInfo[e.target.name];
				if (info.used < info.curMax && info.count) //可使用
					JadeNew.ins().sendUseDan(this._curRole, info.id);
				else
					ViewManager.ins().open(JadeUpTipsWin, info);
				break;
			case this.checkBoxs0:
			case this.checkBoxs1:
			case this.checkBoxs2:
				if (this._oneKeyUp)
					this.stopOneKyUp();

				let index:number = (+e.target.name);
				this._curMaterail = -1;
				let box:eui.CheckBox;
				for (let i:number = 0; i < 3; i++)
				{
					box = this["checkBoxs" + i];
					if (i == index)
						this._curMaterail = box.selected ? index : -1;
					else
						box.selected = false;
				}
				break;
			case this.skillIcon0:
			case this.skillIcon1:
			case this.skillIcon2:
			case this.skillIcon3:
			case this.skillIcon4:
				let data:{id:number,name:string,desc:string} = GlobalConfig.JadePlateBaseConfig.skillUnlock[e.target.name];
				ViewManager.ins().open(YupeiSkillTipsWin, data.name, data.desc);
				break;
			case this.lvImg0:
			case this.lvImg1:
			case this.lvImg2:
				ViewManager.ins().open(ItemDetailedWin, 0, e.target.name);				
				break;
		}
	}

	private onUpgrade(isOneKey:boolean = false):void
	{
		if (isOneKey && this._oneKeyUp)
		{
			this.stopOneKyUp();
			return;
		}

		if (this._oneKeyUp)
			this.stopOneKyUp();

		if ((this._jadeData.lv % GlobalConfig.JadePlateBaseConfig.perLevel) == 10) //升阶
			JadeNew.ins().sendUpgrade(this._curRole, this._materialInfo[0].id);
		else
		{
			if (this._curMaterail == -1)
				UserTips.ins().showTips("请先选择需要消耗的道具");
			else if (this._materialInfo[this._curMaterail].count <= 0)
			{
				UserTips.ins().showTips(`|C:${0xff0000}&T:材料不足`);
				UserWarn.ins().setBuyGoodsWarn(this._materialInfo[this._curMaterail].id);
			}
			else
			{
				let count:number = this._materialInfo[this._curMaterail].count;
				if (count > 1 && isOneKey)
				{
					TimerManager.ins().doTimer(150, count, this.sendUp, this, this.stopOneKyUp, this);
					this.upgradeBtn0.label = "停  止";
					this._oneKeyUp = true;
				}
				else
					JadeNew.ins().sendUpgrade(this._curRole, this._materialInfo[this._curMaterail].id);
			}
		}
	}

	private stopOneKyUp():void
	{
		this._oneKeyUp = false;
		this.upgradeBtn0.label = "一键升级";
		TimerManager.ins().remove(this.sendUp, this);
	}

	private sendUp():void
	{
		if ((this._jadeData.lv % GlobalConfig.JadePlateBaseConfig.perLevel) == 10) //升阶要暂停
		{
			this.stopOneKyUp();
			return;
		}

		JadeNew.ins().sendUpgrade(this._curRole, this._materialInfo[this._curMaterail].id);
	}

}