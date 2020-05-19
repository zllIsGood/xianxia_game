/**
 * 宝石
 */
class ForgeGemPanel extends BaseEuiView {

	public countLabel: eui.Label;
	public upGradeBtn: eui.Button;
	public upGradeBtn0: eui.Button;
	public getItemTxt: eui.Label;
	public attr: eui.Label;

	public curRole: number;
	private curPanel: number = 3;
	public pos: number;		   //部位
	public lv: number;			//等级
	private isMax: boolean = false;
	public isAutoUp: boolean = false;

	protected itemNum: number = 0;	//消耗道具数量
	public costConfig: StoneLevelCostConfig;

	public upInfo: eui.Group;
	public maxDesc: eui.Label;

	private _totalPower: number;
	private itemArr: any[] = [];
	private textArr: any[];
	// private posImg: string[] = ["forge_30", "forge_31", "forge_32", "forge_33", "forge_34", "forge_35", "forge_36", "forge_37"];
	private powerPanel: PowerPanel;
	public itemGroup: eui.Group;
	public itemGroup2: eui.Group;

	public now:ForgeZhuItem;
	public new:ForgeZhuItem;

	// public leftEff:eui.Group;
	// public rightEff:eui.Group;
	// public buttonEff:eui.Group;
	// public leftEff2:eui.Group;
	// public rightEff2:eui.Group;
	// public obliqueleft:eui.Group;
	// public obliqueright:eui.Group;
	// public leftEff3:eui.Group;
	// public rightEff3:eui.Group;
	// public obliqueleft2:eui.Group;
	// public obliqueright2:eui.Group;
	// public leftEff4:eui.Group;
	// public rightEff4:eui.Group;

	private eqIndexItems = [];
	private xjyl:eui.Image;
	
	//zzxuanzhong 选中
	constructor() {
		super();
		this.name = `聚灵`;
		this.skinName = "castingskin";
		this.curPanel = ForgeWin.Page_Select_Gem;
	}

	protected childrenCreated(){
		this.initUI();
	}
	
	public initUI(): void {
		super.initUI();

		this.getItemTxt.textFlow = (new egret.HtmlTextParser).parser(`<u>${this.getItemTxt.text}</u>`);
	}

	public open(pos: number, lv: number): void {
		this.addTouchEvent(this.upGradeBtn, this.onTouch);
		this.addTouchEvent(this.upGradeBtn0, this.onTouch);
		this.addTouchEvent(this.getItemTxt, this.onGetItem);
		
		for( let i:number = 0;i <  UserEquip.FOEGE_MAX; i++) {
			this.eqIndexItems.push(this["item"+i]);
			this["item"+i].select.visible = i == pos?true:false;
			this.addTouchEvent(this["item"+i], this.onSelectItem);
		}

		this.observe(UserBag.ins().postItemAdd, this.setCount);
		this.observe(UserBag.ins().postItemChange, this.setCount);//道具变更
		this.observe(UserGem.ins().postForgeUpdata, this.updateCallBack);//


		this.isMax = false;
		this.changeData(pos, lv,true,true);
		this.stopAutoUp();


		this.cleanEff();
		this.playEff();
	}

	public close(): void {
		this.removeTouchEvent(this.upGradeBtn, this.onTouch);
		this.removeTouchEvent(this.upGradeBtn0, this.onTouch);
		this.removeTouchEvent(this.getItemTxt, this.onGetItem);

		this.removeObserve();
		this.stopAutoUp();
	}

	protected onTouch(e: egret.Event): void {
		switch (e.target) {
			case this.upGradeBtn:
				if (this.costConfig && this.itemNum >= this.costConfig.soulNum) {
					UserGem.ins().sendUpGrade(this.curRole, this.pos);
					SoundUtil.ins().playEffect(SoundUtil.FORGE);
				} else {
					UserWarn.ins().setBuyGoodsWarn(this.costConfig.stoneId, this.costConfig.soulNum - this.itemNum);
				}
				break;
			case this.upGradeBtn0:
				if (this.isAutoUp) {
					this.stopAutoUp();
				}
				else {
					this.isAutoUp = true;
					this.upGradeBtn0.label = `停 止`;
					TimerManager.ins().doTimer(300, 0, this.autoUpStar, this);
				}
				break;
		}
	}

	private onItemTouch(e: egret.Event): void {
		let role: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let pos: number = Number(e.currentTarget.name);
		this.changeData(pos, role.getEquipByIndex(pos).gem);
	}

	public stopAutoUp(): void {
		this.isAutoUp = false;
		if (this.upGradeBtn0)
			this.upGradeBtn0.label = `一键魔晶`;
		TimerManager.ins().remove(this.autoUpStar, this);
	}

	private autoUpStar(): void {
		if (this.costConfig && this.itemNum >= this.costConfig.soulNum) {
			UserGem.ins().sendUpGrade(this.curRole, this.pos);
			SoundUtil.ins().playEffect(SoundUtil.FORGE);
		} else {
			this.isAutoUp = false;
			this.upGradeBtn0.label = `一键魔晶`;
			TimerManager.ins().remove(this.autoUpStar, this);
		}
	}

	protected setPower(): void {
		let model: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		this._totalPower = model.getForgeTotalPower(this.curPanel);
		this.powerPanel.setPower(this._totalPower);
	}

	public changeData(pos: number, lv: number, bool: boolean = true,ini:boolean = false): void {
		this.pos = pos;
		this.lv = lv;

		this.setPower();
		if (bool) {
			this.setCount();
		}
		this.updateItem(ini);
		this.setAttrData();
	}
	/**铸造进度条形特效 */
	private isPlay = false;
	private playEff(){
		if( this.isPlay ){
			return;
		}
		// let effSour = "jljdt";//"jindutiaoeff";
		// this.isPlay = true;
		
		// let speed = 1;
		//左
		// let leff = new MovieClip();
		// leff.playFile(RES_DIR_EFF + effSour, -1);//
		// this.leftEff.addChild(leff);
		// leff.scaleX = 0;
		// leff.scaleY = 0.6;


		// //右
		// let reff = new MovieClip();
		// reff.playFile(RES_DIR_EFF + effSour, -1);
		// this.rightEff.addChild(reff);
		// reff.scaleX = 0;
		// reff.scaleY = 0.6;

		// //下
		// let beff = new MovieClip();
		// beff.playFile(RES_DIR_EFF + effSour, -1);
		// this.buttonEff.addChild(beff);
		// beff.x += 5;
		// beff.scaleX = 0;
		// beff.scaleY = 0.6;
		// beff.$setRotation(90);


		// // 左2
		// let leftEff2 = new MovieClip();
		// leftEff2.playFile(RES_DIR_EFF + effSour, -1);
		// this.leftEff2.addChild(leftEff2);
		// leftEff2.scaleX = 0;
		// leftEff2.scaleY = 0.4;

		// // 右2
		// let rightEff2 = new MovieClip();
		// rightEff2.playFile(RES_DIR_EFF + effSour, -1);
		// this.rightEff2.addChild(rightEff2);
		// rightEff2.scaleX = 0;
		// rightEff2.scaleY = 0.4;


		// // 左上
		// let obliqueleft = new MovieClip();
		// obliqueleft.playFile(RES_DIR_EFF + effSour, -1);
		// this.obliqueleft.addChild(obliqueleft);
		// obliqueleft.scaleX = 0;
		// obliqueleft.scaleY = 0.4;

		// // 右上
		// let obliqueright = new MovieClip();
		// obliqueright.playFile(RES_DIR_EFF + effSour, -1);
		// this.obliqueright.addChild(obliqueright);
		// obliqueright.scaleX = 0;
		// obliqueright.scaleY = 0.4;

		// //左3
		// let leftEff3 = new MovieClip();
		// leftEff3.playFile(RES_DIR_EFF + effSour, -1);
		// this.leftEff3.addChild(leftEff3);
		// leftEff3.scaleX = 0;
		// leftEff3.scaleY = 0.4;

		// //右3
		// let rightEff3 = new MovieClip();
		// rightEff3.playFile(RES_DIR_EFF + effSour, -1);
		// this.rightEff3.addChild(rightEff3);
		// rightEff3.scaleX = 0;
		// rightEff3.scaleY = 0.4;


		// //左下
		// let obliqueleft2 = new MovieClip();
		// obliqueleft2.playFile(RES_DIR_EFF + effSour, -1);
		// this.obliqueleft2.addChild(obliqueleft2);
		// obliqueleft2.scaleX = 0;
		// obliqueleft2.scaleY = 0.4;


		// //右下
		// let obliqueright2 = new MovieClip();
		// obliqueright2.playFile(RES_DIR_EFF + effSour, -1);
		// this.obliqueright2.addChild(obliqueright2);
		// obliqueright2.scaleX = 0;
		// obliqueright2.scaleY = 0.4;


		// //左4
		// let leftEff4 = new MovieClip();
		// leftEff4.playFile(RES_DIR_EFF + effSour, -1);
		// this.leftEff4.addChild(leftEff4);
		// leftEff4.scaleX = 0;
		// leftEff4.scaleY = 0.4;

		// //右4
		// let rightEff4 = new MovieClip();
		// rightEff4.playFile(RES_DIR_EFF + effSour, -1);
		// this.rightEff4.addChild(rightEff4);
		// rightEff4.scaleX = 0;
		// rightEff4.scaleY = 0.4;
		// let maxX = 0.19;
		// let maxX2 = 0.09;// 左2  右2 左4  右4
		// let maxX3 = 0.023;// 左上  右上  左下  右下
		// let maxX4 = 0.15;//左3  右3
		// let t1: egret.Tween = egret.Tween.get(leff);
		// let t2: egret.Tween = egret.Tween.get(reff);
		// t2.to({scaleX:maxX},250*speed);
		// t1.to({scaleX:maxX},250*speed).call(()=>{
		// 	let t3: egret.Tween = egret.Tween.get(beff);
		// 	t3.to({scaleX:0.162},250*speed).call(()=>{
		// 		// 左2  右2
		// 		let t4: egret.Tween = egret.Tween.get(leftEff2);
		// 		let t5: egret.Tween = egret.Tween.get(rightEff2);
		// 		t5.to({scaleX:maxX2},250*speed);
		// 		t4.to({scaleX:maxX2},250*speed).call(()=>{
		// 			// 左上  右上
		// 			let t6: egret.Tween = egret.Tween.get(obliqueleft);
		// 			let t7: egret.Tween = egret.Tween.get(obliqueright);
		// 			t7.to({scaleX:maxX3},50*speed);
		// 			t6.to({scaleX:maxX3},50*speed).call(()=>{
		// 				//左3  右3
		// 				let t8: egret.Tween = egret.Tween.get(leftEff3);
		// 				let t9: egret.Tween = egret.Tween.get(rightEff3);
		// 				t9.to({scaleX:maxX4},250*speed);
		// 				t8.to({scaleX:maxX4},250*speed).call(()=>{
		// 					//左下  右下
		// 					let t10: egret.Tween = egret.Tween.get(obliqueleft2);
		// 					let t11: egret.Tween = egret.Tween.get(obliqueright2);
		// 					t11.to({scaleX:maxX3},50*speed);
		// 					t10.to({scaleX:maxX3},50*speed).call(()=>{
		// 						//左4  右4
		// 						let t12: egret.Tween = egret.Tween.get(leftEff4);
		// 						let t13: egret.Tween = egret.Tween.get(rightEff4);
		// 						t13.to({scaleX:maxX2},250*speed);
		// 						t12.to({scaleX:maxX2},250*speed).call(()=>{
		// 							this.isPlay = false;
		// 							// this.leftEff.removeChild(leff);
		// 							// this.rightEff.removeChild(reff);
		// 							// this.buttonEff.removeChild(beff);
		// 							// this.leftEff2.removeChild(leftEff2);
		// 							// this.rightEff2.removeChild(rightEff2);
		// 							// this.obliqueleft.removeChild(obliqueleft);
		// 							// this.obliqueright.removeChild(obliqueright);
		// 							// this.leftEff3.removeChild(leftEff3);
		// 							// this.rightEff3.removeChild(rightEff3);
		// 							// this.obliqueleft2.removeChild(obliqueleft2);
		// 							// this.obliqueright2.removeChild(obliqueright2);
		// 							// this.leftEff4.removeChild(leftEff4);
		// 							// this.rightEff4.removeChild(rightEff4);
		// 						});
		// 					});
		// 				});
		// 			});
		// 		});
				
		// 	});
		// });
	}
	private cleanEff(){
		// this.leftEff.removeChildren();
		// this.rightEff.removeChildren();
		// this.buttonEff.removeChildren();
		// this.leftEff2.removeChildren();
		// this.rightEff2.removeChildren();
		// this.obliqueleft.removeChildren();
		// this.obliqueright.removeChildren();
		// this.leftEff3.removeChildren();
		// this.rightEff3.removeChildren();
		// this.obliqueleft2.removeChildren();
		// this.obliqueright2.removeChildren();
		// this.leftEff4.removeChildren();
		// this.rightEff4.removeChildren();
	}
	//铸造更新回调
	public updateCallBack(){
		let mc: MovieClip = new MovieClip;	
		mc.x = this.new.x + this.new.width/2;
		mc.y = this.new.y + this.new.height/2;
		this.itemGroup2.addChild(mc);
		mc.playFile(RES_DIR_EFF + "forgeSuccess", 1,()=>{
			let roleData: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
			let equipData: EquipsData[] = roleData.equipsData;
			// this.updateItem(this.pos,equipData[this.pos].gem);
			this.now.updateItem(equipData[this.pos].item.itemConfig,this.pos,equipData[this.pos].gem,this.itemNum,false);
			this.new.updateItem(equipData[this.pos].item.itemConfig,this.pos,equipData[this.pos].gem+1,this.itemNum,false);
		});
	}
	
	/**铸造升级变更数据 */
	private updateItem(ini?:boolean){
		let roleData: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let equipData: EquipsData[] = roleData.equipsData;
		for (let i: number = 0; i < UserEquip.FOEGE_MAX; i++) {
			let level: number = equipData[i].gem;
			let iNum: number = this.itemNum;
			if( ini && i==this.pos ){//打开默认选中武器
				let openConfig: StoneOpenConfig = GlobalConfig.StoneOpenConfig[i];
				if( Actor.level >= openConfig.openLv ){
					// this.cleanEff();
					// this.playEff();
					this.lv = equipData[this.pos].gem;
					this["item"+i].select.visible = true;
					this.xjyl.visible = false;
				}
				this.now.updateItem(equipData[i].item.itemConfig,i,level,this.itemNum,false);
				this.new.updateItem(equipData[i].item.itemConfig,i,level+1,this.itemNum,false);
			}
			if( !iNum ){
				let eqId:number = equipData[i].gem?equipData[i].gem:1;
				let cfg:StoneLevelCostConfig = GlobalConfig.StoneLevelCostConfig[eqId];
				if( cfg ){
					iNum = UserBag.ins().getItemCountById(0, cfg.stoneId);
				}
			}
			// egret.log("this[item"+i+"] = "+this["item"+i]);
			this["item"+i].data = {item:equipData[i].item.itemConfig,pos:i,lv:equipData[i].gem,itemNum:iNum};
		}
	}
	
	protected onSelectItem(e:egret.Event): void {
		let index = this.eqIndexItems.indexOf(e.currentTarget);
		if( index ==-1)
			return;
		if( this.isPlay ){
			this.isPlay = false;
			this.cleanEff();
		}

		let showIndex = this.pos;
		for (let i: number = 0; i < UserEquip.FOEGE_MAX; i++) {
			if( this["item"+i].select.visible )
				showIndex = i;
			this["item"+i].select.visible = false;
		}
		let isSelect = false;
		let roleData: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let equipData: EquipsData[] = roleData.equipsData;
		let openConfig: StoneOpenConfig = GlobalConfig.StoneOpenConfig[index];
		let tips = "";
		switch( e.currentTarget ){
			case this["item"+index]:
				if( Actor.level >= openConfig.openLv ){
					this.cleanEff();
					this.playEff();
					this.pos = index;//改变铸造索引
					this.lv = equipData[this.pos].gem;
					isSelect = true;
					this["item"+index].select.visible = true;
					this.xjyl.visible = false;
					this.now.updateItem(equipData[index].item.itemConfig,index,equipData[index].gem,this.itemNum,false);
					this.new.updateItem(equipData[index].item.itemConfig,index,equipData[index].gem+1,this.itemNum,false);
				}else{
					tips = openConfig.openLv+"级开启";
				}
			break;
		}
		if( !isSelect ){
			this["item"+showIndex].select.visible = true;
			UserTips.ins().showTips(tips);
		}
			
		this.setAttrData();
		this.setCount();

	}


	protected setAttrData(): void {
		let cruCfg: EnhanceAttrConfig | StoneLevelConfig | ZhulingAttrConfig | TupoAttrConfig;
		cruCfg = UserForge.ins().getForgeConfigByPos(this.pos, this.lv, this.curPanel);
		//最多显示4个属性
		let attrList: AttributeData[] = cruCfg.attr;
		let len: number = attrList.length;
		attrList.sort(AttributeData.sortAttribute);
		for (let i: number = 0; i < 4; i++) {
			this["attr" + i].text = len > i ? AttributeData.getAttStrByType(attrList[i], 0.5) : "";
		}
		let nextConfig: EnhanceAttrConfig | StoneLevelConfig | ZhulingAttrConfig | TupoAttrConfig;
		nextConfig = UserForge.ins().getForgeConfigByPos(this.pos, this.lv + 1, this.curPanel);
		let str: string = "";
		if (nextConfig) {
			this.isMax = false;
			let addList: AttributeData[] = nextConfig.attr;
			addList.sort(AttributeData.sortAttribute);
			//最多显示4个属性
			for (let i: number = 0; i < 4; i++) {
				let str: string = "";
				if (len > i) {
					let attr: AttributeData = attrList[i];
					str = this.getAttrByType(addList, attr);
				}
				this["arrow" + i].visible = str.length > 0;
				this["addAttr" + i].text = str;
			}
		} else {
			this.isMax = true;
			for (let i: number = 0; i < 4; i++) {
				this["arrow" + i].visible = false;
				this["addAttr" + i].text = "";
			}
		}
		this.attr.text = str;
		this.upInfo.visible = !this.isMax;
		this.maxDesc.visible = this.isMax;

		if( this.maxDesc.visible ){
			this.now.hideAdd();
			this.new.hideAdd();
		}
	}

	protected onGetItem(e: TouchEvent): void {
		// UserWarn.ins().setBuyGoodsWarn(UserForge.ins().getStoneLevelCostConfigByLv(this.lv + 1).itemId, 1);
		UserWarn.ins().setBuyGoodsWarn(this.costConfig.stoneId, 1);
	}

	protected setCount(): void {
		this.costConfig = UserForge.ins().getStoneLevelCostConfigByLv(this.lv + 1);
		let cost: number = 0;
		if (this.costConfig) {
			// this.itemNum = UserBag.ins().getBagGoodsCountById(0, this.costConfig.stoneId);
			this.itemNum = Actor.soul;
			cost = this.costConfig.soulNum;
		}
		// let colorStr: string = "";
		// if (this.itemNum >= cost)
		// 	colorStr = "|C:0x35e62d&T:";
		// else
		// 	colorStr = "|C:0xf3311e&T:";
		// this.countLabel.textFlow = TextFlowMaker.generateTextFlow(colorStr + this.itemNum + "| / " + cost);
		let colorStr: string = "";
		if (this.itemNum >= cost)
			colorStr = ColorUtil.GREEN_COLOR;
		else
			colorStr = ColorUtil.RED_COLOR;

		this.countLabel.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${this.itemNum}</font><font color=${ColorUtil.WHITE_COLOR}>/${cost}</font> `);
		this.buyStoneUpdateItem();
	}
	/**购买道具导致精炼石满足条件 需要显示可铸造 每个道具栏都需要遍历 */
	private buyStoneUpdateItem(){
		this.updateItem();
	}

	private getAttrByType(attrs: AttributeData[], attr: AttributeData): string {
		if (!attr)
			return "";
		let len: number = attrs.length;
		for (let i: number = 0; i < len; i++) {
			if (attrs[i].type == attr.type && attrs[i].value != attr.value) {
				return `${attrs[i].value}`;
			}
		}
		return "";
	}
}
