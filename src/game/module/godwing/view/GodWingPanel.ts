/**
 * 神羽装备界面
 */
class GodWingPanel extends BaseView {
	public powerPanel: PowerPanel;

	/**控件*/
	public skill:GodWingItem;
	// public item0:GodWingItem
	public attr:eui.Button;

	private attr0:eui.Label;
	private power0:eui.Label;
	private state0:eui.Label;

	private attr1:eui.Label;
	private power1:eui.Label;
	private state1:eui.Label;
	private attr2:eui.Label;
	private power2:eui.Label;
	private state2:eui.Label;

	private attr3:eui.Label;
	private power3:eui.Label;
	private state3:eui.Label;

	private costImg0:eui.Image;
	private cost0:eui.Label;

	private replace:eui.Button;//装备神羽
	private redPointReplace:eui.Image;
	private replace0:eui.Button;//快速合成
	private redPointReplace0:eui.Image;

	public curRole:number;
	private slot:number;//选中部位
	private isActive:boolean;
	private getItemTxt:eui.Label;//获取途径
	private costName:eui.Label;
	constructor() {
		super();

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.attr,this.onClick);
		this.removeTouchEvent(this.skill,this.onTouch);
		this.removeTouchEvent(this.replace,this.onClick);
		this.removeTouchEvent(this.replace0,this.onClick);
		this.removeTouchEvent(this.getItemTxt,this.onClick);
		this.removeObserve();
		for( let i = 0 ;i < Wing.GodWingMaxSlot;i++ ){
			this.removeTouchEvent(this[`item${i}`], this.onTab);
		}
	}


	public open(...param: any[]): void {
		this.addTouchEndEvent(this.attr,this.onClick);
		this.addTouchEndEvent(this.skill,this.onTouch);
		this.addTouchEndEvent(this.replace,this.onClick);
		this.addTouchEndEvent(this.replace0,this.onClick);
		this.addTouchEndEvent(this.getItemTxt,this.onClick);
		this.observe(GodWingRedPoint.ins().postGodWingItem,this.updateItem);
		for( let i = 0 ;i < Wing.GodWingMaxSlot;i++ ){
			this.addTouchEvent(this[`item${i}`], this.onTab);
		}
		this.slot = 1;
		this.updateGodWing()
	}
	//选中的神羽部位
	private onTab(e: egret.TouchEvent):void{
		for( let i = 0;i < Wing.GodWingMaxSlot;i++ ){
			if( e.currentTarget == this["item"+i] ){
				this.slot = i+1;
				this["item"+i].setSelect(true);
				this.updateGodWing()
			}else{
				this["item"+i].setSelect(false);
			}
		}
	}

	private onClick(e:egret.TouchEvent):void{
		switch (e.target){
			case this.attr://查看神羽套装
				ViewManager.ins().open(GodWingSuitTipsWin,this.curRole);
				break;
			case this.replace://装备神羽
				let gwconfig:GodWingItemConfig | GodWingLevelConfig = this[`item${this.slot-1}`].data;
				if( gwconfig ){
					gwconfig = GlobalConfig.GodWingLevelConfig[gwconfig.level][gwconfig.slot];
					//检查某个部位是否有穿戴
					//注意:允许穿戴同部位高阶的神羽
					if( !Wing.ins().wearItemRedPoint(this.curRole,this.slot) ){
						UserTips.ins().showTips(`无可穿戴的高阶神羽`);
						return;
					}
					let itemid:number = Wing.ins().getWearItem(this.curRole,this.slot);
					if( !itemid )
						itemid = gwconfig.itemId;
					Wing.ins().sendWingWear(this.curRole,itemid);

				}

				break;
			case this.replace0://快速合成神羽
				if( Wing.ins().isQuicComposeGodWing(this.curRole,this.slot) ){
					let gwconfig:GodWingLevelConfig = Wing.ins().getCurLevelItemId(this.curRole,this.slot);
					//条件
					if( !gwconfig ){//部位没有激活穿戴
						//进行材料合成
						let level:number = Wing.ins().getStartLevel(this.slot);//起始等级
						gwconfig = GlobalConfig.GodWingLevelConfig[level][this.slot];

					}else{
						//进行神羽的升阶
						let level:number = Wing.ins().getNextLevel(gwconfig.level);//下一等级
						gwconfig = GlobalConfig.GodWingLevelConfig[level][this.slot];
					}

					//穿戴要求
					if( !Wing.ins().checkGodWingLevel(this.curRole,gwconfig.itemId) ){
						UserTips.ins().showTips(`不符合穿戴要求`);
						return;
					}
					//是否有足够材料
					if( !Wing.ins().checkGodWingItem( this.curRole,gwconfig.itemId,this.slot ) ){
						UserTips.ins().showTips(`没有足够的材料`);
						return;
					}

					Wing.ins().sendWingCompose(1,gwconfig.itemId,this.curRole);
				}else{
					UserTips.ins().showTips(`道具不足或穿戴等级不足`);
				}
				break;
			case this.getItemTxt:
				let cfg:GodWingItemConfig | GodWingLevelConfig = this[`item${this.slot-1}`].data;
				if( cfg ){
					cfg = GlobalConfig.GodWingItemConfig[cfg.itemId];
					let gayId:number = cfg.itemId;
					if( !Wing.ins().getGodWing(this.curRole).getLevel(this.slot) ){
						if( cfg instanceof GodWingItemConfig )
							gayId = cfg.composeItem.id;
					}
					UserWarn.ins().setBuyGoodsWarn(gayId);
				}
				break;
		}

	}

	private onTouch(e:egret.TouchEvent):void{
		switch (e.currentTarget){
			case this.skill://技能tips
				ViewManager.ins().open(GodWingSkillTipsWin,this.skill.data,this.isActive);
				break;
		}
	}


	/**********************************UI**********************************/
	private updateGodWing(){
		this.updateItem();
	}

	private updateItem(){
		let gw:GodWingData = Wing.ins().getGodWing(this.curRole);
		let gwdata:Map<{slot:number;level:number}> = gw.getData();
		let level:number = gw.getLevel(this.slot);
		this.attr0.visible = level?false:true;//未激活(穿戴)时候显示
		this.attr1.visible = this.attr2.visible = !this.attr0.visible;
		this.state0.visible = this.power0.visible = this.attr0.visible;
		this.power1.visible = this.power2.visible = !this.power0.visible;
		this.state1.visible = this.state2.visible = !this.state0.visible
		this.attr3.visible = this.power3.visible = this.state3.visible = false;
		//已满级
		if( level && !Wing.ins().getNextLevel(level) ){
			this.attr3.visible = this.power3.visible = this.state3.visible = true;
			for( let i = 0; i < 3;i++ ){
				this[`attr${i}`].visible = this[`power${i}`].visible = this[`state${i}`].visible = !this.attr3.visible;
			}
		}


		let gitem:GodWingItemConfig;
		let nextgitem:GodWingItemConfig;

		let percent = 0;
		let suitsum:number = gw.getSuitSum();
		if( suitsum >= Wing.GodWingMaxSlot ){
			let minLevel:number = gw.getSuitLevel();
			let tmp:GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[minLevel];
			if( tmp )
				percent = tmp.precent/10000;
		}
		//未装备
		if( this.attr0.visible ){
			let idx:number = Wing.ins().getStartLevel(this.slot);
			let wl:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[idx][this.slot];
			gitem = GlobalConfig.GodWingItemConfig[wl.itemId];
			let power0:number = Math.floor(UserBag.getAttrPower(gitem.attr));
			this.power0.text = `战斗力：${power0+gitem.exPower}`;
			this.power0.visible = true;
			this.attr0.text = AttributeData.getAttStr(gitem.attr, 0, 1, "：");
			let attrtext:string = AttributeData.getAttStr(gitem.attr, 0, 1, "：") + "\n";
			attrtext += AttributeData.getExAttrNameByAttrbute(gitem.exattr[0], true);
			this.attr0.text = attrtext;
		}
		//已装备
		if( this.attr1.visible ){
			//当前
			let glconfig:GodWingLevelConfig = Wing.ins().getCurLevelItemId(this.curRole,this.slot);
			if( glconfig ){
				gitem = GlobalConfig.GodWingItemConfig[glconfig.itemId];
				let newAttr:AttributeData[] = AttributeData.getPercentAttr(gitem.attr,percent);
				let power1:number = Math.floor(UserBag.getAttrPower(newAttr));
				this.power1.text = `战斗力：${(power1+gitem.exPower)}`;
				let attrtext:string = AttributeData.getAttStr(gitem.attr, 0, 1, "：") + "\n";
				attrtext += AttributeData.getExAttrNameByAttrbute(gitem.exattr[0], true);
				this.attr1.text = attrtext;
			}
			//下一阶
			glconfig = Wing.ins().getNextLevelItemId(this.curRole,this.slot);
			if( glconfig ){
				nextgitem = GlobalConfig.GodWingItemConfig[glconfig.itemId];
				let newAttr:AttributeData[] = AttributeData.getPercentAttr(nextgitem.attr,percent);
				let power2:number = Math.floor(UserBag.getAttrPower(newAttr));
				this.power2.text = `战斗力：${power2+nextgitem.exPower}`;
				let attrtext:string = AttributeData.getAttStr(nextgitem.attr, 0, 1, "：") + "\n";
				attrtext += AttributeData.getExAttrNameByAttrbute (nextgitem.exattr[0],true);
				this.attr2.text = attrtext;
			}
		}

		//已满级
		if( this.attr3.visible ){
			let glconfig:GodWingLevelConfig = Wing.ins().getCurLevelItemId(this.curRole,this.slot);
			gitem = GlobalConfig.GodWingItemConfig[glconfig.itemId];
			let newAttr:AttributeData[] = AttributeData.getPercentAttr(gitem.attr,percent);
			let power0:number = Math.floor(UserBag.getAttrPower(newAttr));
			this.power3.text = `战斗力：${power0+gitem.exPower}`;
			this.power3.visible = true;
			this.attr3.text = AttributeData.getAttStr(gitem.attr, 0, 1, "：");
			let attrtext:string = AttributeData.getAttStr(gitem.attr, 0, 1, "：") + "\n";
			attrtext += AttributeData.getExAttrNameByAttrbute(gitem.exattr[0], true);
			this.attr3.text = attrtext;
		}

		let costItem:GodWingItemConfig = gitem;
		this.costImg0.visible = this.cost0.visible = true;
		if( !this.attr0.visible ){
			let nextLv:number = Wing.ins().getNextLevel(gitem.level);
			if( nextLv ){
				let nextcfg:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[nextLv][this.slot];
				costItem = GlobalConfig.GodWingItemConfig[nextcfg.itemId];
			}else{
				//满级隐藏材料消耗
				this.costImg0.visible = this.cost0.visible = false;
			}
		}
		this.updateCost(costItem);
		for( let i = 0;i < 4;i++ ){
			this[`item${i}`].data = null;
			this[`item${i}`].setSelect(false);
			this[`item${i}`].setCountVisible(false);
			let isShow = Wing.ins().getGodWing(this.curRole).getLevel(i+1);
			this[`item${i}`].setNameVisible(isShow);
		}
		//当前选中的部位
		this[`item${this.slot-1}`].data = gitem;
		if( !Wing.ins().getCurLevelItemId(this.curRole,this.slot) ){
			//未激活
			this[`item${this.slot-1}`].setImgIcon(`sybg${this.slot}`);
		}
		this[`item${this.slot-1}`].setSelect(true);
		this[`item${this.slot-1}`].setCountVisible(false);
		//已装备
		let isShow = Wing.ins().getGodWing(this.curRole).getLevel(this.slot);
		this[`item${this.slot-1}`].setNameVisible(isShow);
		//各个部位显示item
		for( let i = 1;i <= 4;i++ ){
			if( i != this.slot ) {// 更新其他三个部位的icon
				let itemlevel:number;
				let islock:boolean = false;
				if( gwdata[i] ){
					itemlevel = gwdata[i].level;
					islock = true;
				}else{
					itemlevel = Wing.ins().getStartLevel(i);
				}
				let cfg:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[itemlevel][i];
				let gitem:GodWingItemConfig = GlobalConfig.GodWingItemConfig[cfg.itemId];
				if( gitem ){
					this[`item${i-1}`].data = gitem;
					if( !islock ){
						this[`item${i-1}`].setImgIcon(`sybg${i}`);
						this[`item${i-1}`].setQuality(ItemConfig.getQualityBg(0));
					}

				}
			}

		}
		this.updatePower();
		this.updateRedPoint();
		this.updateSkill();
	}
	private setNnactive(){
		for( let k in GlobalConfig.GodWingSuitConfig ){
			let config:GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[k];
			this.skill.data = config;
			this.skill.setCountVisible(false);
			// this.skill.setNameVisible(false);
			this.skill.setImgIcon("sy100000_png");
			break;
		}
	}
	private updateSkill(){
		let gw:GodWingData = Wing.ins().getGodWing(this.curRole);
		let gwsconfig:GodWingSuitConfig;
		let suitLevel:number= gw.getSuitLevel();
		this.isActive = false;
		if( !suitLevel ){
			this.setNnactive();
			return 0;
		}else{
			let sconfig:GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[suitLevel];
			if( sconfig.skillname ){
				this.isActive = true;
			}
			gwsconfig = sconfig;
		}

		this.skill.data = gwsconfig;
		this.skill.setCountVisible(false);
		// this.skill.setNameVisible(false);
		if( !this.isActive ){
			this.skill.setImgIcon("sy100000_png");
			//显示名字
			for( let k in GlobalConfig.GodWingSuitConfig ){
				let gsconfig:GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[k]
				if( gsconfig.skillname )
					this.skill.setNameText(gsconfig.skillname);
			}
		}

	}
	private updateCost(gitem:GodWingItemConfig){
		if( !gitem )return;
		//背包拥有数
		let itemData:ItemData = UserBag.ins().getBagItemById(gitem.composeItem.id);
		let costItemLen:number = itemData?itemData.count:0;
		//查看当前装备中是否有神羽 有则把自身拥有数量+1 (快速合成)
		let myLevel:number = Wing.ins().getGodWing(this.curRole).getLevel(this.slot);
		if( myLevel ){
			let lcfg:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[myLevel][this.slot];
			if( lcfg.itemId == gitem.composeItem.id )//穿戴部位有相同的道具
				costItemLen += 1;
		}
		let itemconfig:ItemConfig = GlobalConfig.ItemConfig[gitem.composeItem.id];
		this.costImg0.source = itemconfig.icon + "_png";
		this.costImg0.visible = false;

		let colorStr: number;
		if (costItemLen >= gitem.composeItem.count)
			colorStr = ColorUtil.GREEN;
		else
			colorStr = ColorUtil.RED;
		this.cost0.textFlow = TextFlowMaker.generateTextFlow1(`|C:${colorStr}&T:${costItemLen}|/|C:0xD1C28F&T:${gitem.composeItem.count}`);

		this.getItemTxt.textFlow = TextFlowMaker.generateTextFlow1(`|U:&T:${this.getItemTxt.text}`);
		let it:ItemConfig = GlobalConfig.ItemConfig[gitem.composeItem.id];
		colorStr = ItemConfig.getQualityColor(it);
		this.costName.textFlow = TextFlowMaker.generateTextFlow1(`消耗|C:${colorStr}&T:${it.name}|C:${0x00FF00}&T:${":"}`);

	}
	private updateRedPoint(){
		// let isWear = false;
		// for( let i = 0; i < 3;i++ ){
		// 	let isWear = Wing.ins().isWearGodWing(i);
		// 	if( isWear )
		// 		break;
		// }
		for( let i = 0;i < Wing.GodWingMaxSlot;i++ ){
			this[`item${i}`].updateRedPoint(Wing.ins().gridRedPoint(this.curRole,i+1));
		}

		this.redPointReplace.visible = Wing.ins().wearItemRedPoint(this.curRole,this.slot);
		this.redPointReplace0.visible = Wing.ins().quickComposeRedPoint(this.curRole,this.slot);
	}
	/**计算每个角色神羽的总战力*/
	private updatePower(){
		let gw:GodWingData = Wing.ins().getGodWing(this.curRole);
		let gwdata:Map<{slot:number;level:number}> = gw.getData();
		let powers:number = 0;

		let percent = 0;
		let suitsum:number = gw.getSuitSum();
		if( suitsum >= Wing.GodWingMaxSlot ){
			let minLevel:number = gw.getSuitLevel();
			let tmp:GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[minLevel];
			if( tmp )
				percent = tmp.precent/10000;
		}

		for( let k in gwdata ){
			let glconfig:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[gwdata[k].level][gwdata[k].slot];
			let gwconfig:GodWingItemConfig  = GlobalConfig.GodWingItemConfig[glconfig.itemId];
			let exPower:number = gwconfig.exPower?gwconfig.exPower:0;
			let newAttr:AttributeData[] = AttributeData.getPercentAttr(gwconfig.attr,percent);
			powers += Math.floor(UserBag.getAttrPower(newAttr)) + exPower;
		}
		this.powerPanel.setPower(powers);
	}

}
