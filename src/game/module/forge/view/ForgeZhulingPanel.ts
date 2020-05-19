/**
 * 附魔
 */
class ForgeZhulingPanel extends BaseEuiView {

	public bg: eui.Image;
	// public icon: eui.Image;
	public countLabel: eui.Label;
	public upGradeBtn: eui.Button;
	public upGradeBtn0: eui.Button;
	public getItemTxt: eui.Label;
	public selectIcon: eui.Image;
	public itemGroup: eui.Group;

	private _totalPower: number;

	public curRole: number;		   //当前角色
	public curPanel: number;	   //当前面板索引
	public pos: number;		   //部位
	public lv: number;			//等级
	private isMax: boolean = false;
	public isAutoUp: boolean = false;
	public maxDesc: eui.Label;
	public upInfo: eui.Group;

	protected itemNum: number = 0;	//消耗道具数量
	private costConfig: ZhulingCostConfig;

	private costGroup: eui.Group;

	private powerPanel: PowerPanel;

	protected startPos:number = 0;

	constructor() {
		super();
		this.name = `魔晶`;
		this.skinName = "refineskin";
		this.curPanel = ForgeWin.Page_Select_ZhuLing;
	}

	protected childrenCreated(){
		this.initUI();
	}

	public initUI(): void {
		super.initUI();
		this.init();
	}

	public init() {
		this.getItemTxt.textFlow = (new egret.HtmlTextParser).parser(`<u>${this.getItemTxt.text}</u>`);
	}

	public open(pos: number, lv: number): void {
		this.addTouchEvent(this.upGradeBtn, this.onTouch);
		this.addTouchEvent(this.upGradeBtn0, this.onTouch);
		this.addTouchEvent(this.getItemTxt, this.onGetItem);
		this.observe(UserBag.ins().postItemAdd, this.setCount);
		this.observe(UserBag.ins().postItemChange, this.setCount);//道具变更
		this.observe(Actor.ins().postLevelChange, this.setView);
		this.isMax = false;
		this.setView();
		this.createBitMapNum();
		this.changeData(pos, lv);
		this.stopAutoUp();
	}

	public close(): void {
		this.removeTouchEvent(this.upGradeBtn, this.onTouch);
		this.removeTouchEvent(this.getItemTxt, this.onGetItem);
		this.removeObserve();
		this.stopAutoUp();
	}

	private setView(): void {
		// this.costGroup.horizontalCenter = this.upGradeBtn.horizontalCenter = Actor.level >= UserRole.oneKeyOpenLevel ? -100 : 0;
		// this.upGradeBtn0.visible = Actor.level >= UserRole.oneKeyOpenLevel;
	}

	protected onTouch(e: egret.Event): void {
		switch (e.target) {
			case this.upGradeBtn:
				if (this.costConfig && this.itemNum >= this.costConfig.count) {
					UserZhuLing.ins().sendUpGrade(this.curRole, this.pos);
					SoundUtil.ins().playEffect(SoundUtil.FORGE);
				} else {
					// UserWarn.ins().setBuyGoodsWarn(MoneyConst.soul, this.costConfig.soulNum - this.itemNum);
					UserWarn.ins().setBuyGoodsWarn(this.costConfig.itemId, 1);
				}
				break;
			case this.upGradeBtn0:
				if (!this.isAutoUp) {
					this.isAutoUp = true;
					this.startPos = this.pos;
					if(!this.autoUpStarEx()){
						UserTips.ins().showTips("材料不足");
						this.isAutoUp = false;
					}
				}

				//旧一键
				// if (this.isAutoUp) {
				// 	this.stopAutoUp();
				// }
				// else {
				// 	if (this.costConfig && this.itemNum >= this.costConfig.soulNum) {
				// 		this.isAutoUp = true;
				// 		this.upGradeBtn0.label = `停 止`;
				// 		TimerManager.ins().doTimer(300, 0, this.autoUpStar, this);
				// 	} else {
				// 		this.onGetItem(null);
				// 	}
				// }
				break;
		}
	}

	public stopAutoUp(): void {
		this.isAutoUp = false;
		if (this.upGradeBtn0)
			this.upGradeBtn0.label = `一键聚灵`;
		TimerManager.ins().remove(this.autoUpStar, this);
	}
	public autoUpBack(index:number){
		//一键功能开启时候才进来
		if (this.isAutoUp) {
			let costConfig: ZhulingCostConfig = UserForge.ins().getZhulingCostConfigByLv(this.lv+1);
			if (!costConfig)
				return;
			if (this.itemNum < costConfig.count) {
				this.isAutoUp = false;
				UserTips.ins().showTips("材料不足");
				return;
			}
			if( this.startPos == index ){
				// UserTips.ins().showTips("一圈完成");
				this.isAutoUp = false;
				return;
			}
			//继续发送
			UserZhuLing.ins().sendUpGrade(this.curRole, index);
		}
	}
	private autoUpStarEx(): boolean {
		let costConfig: ZhulingCostConfig = UserForge.ins().getZhulingCostConfigByLv(this.lv+1);
		if (!costConfig)
			return false;
		if (this.itemNum >= costConfig.count) {
			UserZhuLing.ins().sendUpGrade(this.curRole, this.pos);
			SoundUtil.ins().playEffect(SoundUtil.FORGE);
		} else {
			this.upGradeBtn0.label = `一键聚灵`;
			// this.onGetItem(null);
			return false;
		}
		return true;

	}

	private autoUpStar(): void {
		if (this.costConfig && this.itemNum >= this.costConfig.count) {
			UserZhuLing.ins().sendUpGrade(this.curRole, this.pos);
			if (this.pos == 7) {
				this.isAutoUp = false;
				this.upGradeBtn0.label = `一键聚灵`;
				TimerManager.ins().remove(this.autoUpStar, this);
			}
		} else {
			this.isAutoUp = false;
			this.upGradeBtn0.label = `一键聚灵`;
			TimerManager.ins().remove(this.autoUpStar, this);
			// this.onGetItem(null);
		}
	}

	protected onGetItem(e: TouchEvent): void {
		// UserWarn.ins().setBuyGoodsWarn(this.costConfig.stoneId, 1);
		UserWarn.ins().setBuyGoodsWarn(this.costConfig.itemId, 1);
	}

	public changeData(pos: number, lv: number, bool: boolean = true): void {
		this.pos = pos;
		this.lv = lv;
		let attrList: AttributeData[] = UserForge.ins().countAllBoostAttr(this.curRole, this.curPanel);
		this.setAttrData(attrList);
		this.setPower();
		this.setSlectedInfo();
		this.updateLevel();
		if (bool) {
			this.setCount();
		}
	}

	protected setPower(): void {
		let model: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		this._totalPower = model.getForgeTotalPower(this.curPanel);
		this.powerPanel.setPower(this._totalPower);
	}
	// private bitmapNum: egret.DisplayObjectContainer[];
	private createBitMapNum(){
		//  this.bitmapNum = [];
		//  for (let i: number = 0; i < UserEquip.FOEGE_MAX; i++) {
		// 	 this.bitmapNum[i] = BitmapNumber.ins().createNumPic(0, "lv_");
		// 	 this["lv"+i].addChild(this.bitmapNum[i]);
		//  }
		for (let i: number = 0; i < UserEquip.FOEGE_MAX; i++) {
			this["level_"+i].text = "0";
		}
		 
	}
	/**精炼升级变更等级 */
	private updateLevel(){
		let roleData: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let equipData: EquipsData[] = roleData.equipsData;
		for (let i: number = 0; i < UserEquip.FOEGE_MAX; i++) {
			let level: number = equipData[i].zhuling;
			this["level_"+i].visible = level > 0?true:false;
			this["level_"+i].text = level.toString();
			// this.bitmapNum[i].visible = level > 0?true:false;
			// BitmapNumber.ins().changeNum(this.bitmapNum[i],level,"lv_");

		}
	}
	//设置选中信息
	private setSlectedInfo(): void {
		//设置等级显示
		let roleData: Role = SubRoles.ins().getSubRoleByIndex(this.curRole);
		let equipData: EquipsData[] = roleData.equipsData;
		for (let i: number = 0; i < UserEquip.FOEGE_MAX; i++) {
			// let level: number = equipData[i].zhuling;
			// if (level > 0) {
			// 	this["level_" + i].text = `${level}`;
			// 	// this["lock_"+i].visible = false;
			// } else {
			// 	this["level_" + i].text = ``;
			// 	// this["lock_"+i].visible = true;
			// }
			this["selectIcon" + i].visible = (i == this.pos);
			if (i == 0) {

			} else {
				this["line" + (i-1)].source = (i <= this.pos) ? "mojing_line_bright" : "mojing_line_dark";
				this["jinglianed"+i].visible = (i <= this.pos) ?true:false;
			}
		}
	}

	protected setAttrData(attrList: AttributeData[]): void {
		let nextConfig: EnhanceAttrConfig | StoneLevelConfig | ZhulingAttrConfig | TupoAttrConfig;
		let len: number = attrList.length;
		attrList.sort(AttributeData.sortAttribute);
		//最多显示4个属性
		for (let i: number = 0; i < 4; i++) {
			this["attr" + i].text = len > i ? AttributeData.getAttStrByType(attrList[i], 0.5) : "";
		}
		nextConfig = UserForge.ins().getForgeConfigByPos(this.pos, this.lv + 1, this.curPanel);
		if (nextConfig) {
			this.isMax = false;
			let str: string = "";
			let addList: AttributeData[] = UserForge.ins().countAllBoostAttr(this.curRole, this.curPanel, this.pos, true);
			addList.sort(AttributeData.sortAttribute);
			//最多显示4个属性
			for (let i: number = 0; i < 4; i++) {
				if (len > i) {
					let attr: AttributeData = attrList[i];
					str = this.getAttrByType(addList, attr);
				}
				this["arrow" + i].visible = str.length > 0;
				this["addattr" + i].text = str;
			}
		} else {
			this.isMax = true;
			//最多显示4个属性
			for (let i: number = 0; i < 4; i++) {
				this["arrow" + i].visible = false;
				this["addattr" + i].text = "";
			}
		}
		this.maxDesc.visible = this.isMax;
		this.upInfo.visible = !this.isMax;
	}

	protected setCount(): void {
		this.costConfig = UserForge.ins().getZhulingCostConfigByLv(this.lv + 1);
		
		let cost: number = 0;
		if (this.costConfig) {
			// this.itemNum = Actor.soul;
			this.itemNum = UserBag.ins().getItemCountById(0, this.costConfig.itemId);
			cost = this.costConfig.count;
		}

		let colorStr: string = "";
		if (this.itemNum >= cost)
			colorStr = ColorUtil.GREEN_COLOR;
		else
			colorStr = ColorUtil.RED_COLOR;

		this.countLabel.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${this.itemNum}</font><font color=${ColorUtil.WHITE_COLOR}>/${cost}</font> `);
	}

	private getAttrByType(attrs: AttributeData[], attr: AttributeData): string {
		let len: number = attrs.length;
		for (let i: number = 0; i < len; i++) {
			if (attrs[i].type == attr.type && attrs[i].value != attr.value) {
				return `${attrs[i].value}`;
			}
		}
		return "";
	}
}
