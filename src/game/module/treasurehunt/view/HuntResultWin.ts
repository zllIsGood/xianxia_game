/**
 *
 * @author hepeiye
 *
 */
const c_launchX = 180;
const c_launchY = 500;
const c_firstX = 0;
const c_firstY = 0;
const c_distantX = 77;
const c_distantY = 93;
const c_depotX = 320;
const c_depotY = 620;
const waitTime = 50;

class HuntResultWin extends BaseEuiView {
	private buyBtn: eui.Button;
	private num: eui.Label;
	private closeBtn0: eui.Button;
	private listCon: eui.Group;

	private huntType: number;
	private arr = [];
	private items: ItemBase[] = [];
	private canClicck: boolean;
	private type: number = 0;
	private activityID: number;

	private ybicon:eui.Image;
	private icon:eui.Image;
	private icon1:eui.Image;
	private desc:eui.Label;

	private yb:number;
	private zwNum1:eui.Label;
	private zbNum1:eui.Label;
	
	private zwNum2:eui.Label;
	private zbNum2:eui.Label;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "HuntResult";
		this.isTopLevel = true;
	}
	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn0, this.closeCB);
		this.addTouchEvent(this.buyBtn, this.buy);
		this.observe(Hunt.ins().postHuntResult, this.updateView);
		this.observe(Heirloom.ins().postHuntResult, this.updateView);
		this.observe(Activity.ins().postHuntResult, this.updateView);
		// this.observe(Rune.ins().postHuntRuneInfo, this.updateRuneDesc);

		//寻宝的类型   寻到的数据    寻宝/探宝
		this.updateView([param[0], param[1], param[2], param[3]]);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn0, this.closeCB);
		this.removeTouchEvent(this.buyBtn, this.buy);
		this.removeObserve();
	}
	private zwHunt:eui.Group;
	private zbHunt:eui.Group;
	private zw:eui.Label;
	private zb:eui.Label;
	private updateView(param: any[]): void {
		//寻宝的类型   寻到的数据    寻宝/探宝
		this.canClicck = true;
		this.huntType = param[0];
		this.arr = param[1];
		this.type = param[2];
		this.activityID = param[3];
		this.ybicon.visible = true;
		this.desc.visible = false;

		if (this.huntType == 0) { // 1
			// this.buyBtn.icon = 'xb_25';
			let num:number = 0;
			if (this.type == 0)
				num = GlobalConfig.TreasureHuntConfig.huntOnce;
			else if (this.type == 1)
				num = GlobalConfig.FuwenTreasureConfig.huntOnce;  
			else if (this.type == 2)
				num = GlobalConfig.HeirloomTreasureConfig.huntOnce;
			else if (this.type == 3)
				num = GlobalConfig.ActivityType27Config[this.activityID][1].yb;

			// this.num.text = num + "";
			this.yb = num;
			this.buyBtn.labelDisplay.text = `购买1次`;
		} else { // 10
			// this.buyBtn.icon = 'xb_26';
			let num:number = 0;
			if (this.type == 0)
				num = GlobalConfig.TreasureHuntConfig.huntTenth;
			else if (this.type == 1)
				num = GlobalConfig.FuwenTreasureConfig.huntTenth;
			else if (this.type == 2)
				num = GlobalConfig.HeirloomTreasureConfig.huntTenth;
			else if (this.type == 3)
				num = GlobalConfig.ActivityType27Config[this.activityID][2].yb;

			// this.num.text = num + "";
			this.yb = num;
			this.buyBtn.labelDisplay.text = `购买10次`;
		}
		// this.num.verticalCenter = this.ybicon.verticalCenter;
		// this.num.horizontalCenter = this.ybicon.horizontalCenter + this.ybicon.width + this.num.width/2;
		this.zbHunt.visible = this.type?false:true;
		this.zwHunt.visible = !this.zbHunt.visible;
		if (this.type == 0)
			this.updateHuntDescEx();
		else if (this.type == 1)
			this.updateRuneDescEx();
		else if (this.type == 2)
			this.updateHeirloomDescEx();
		else if (this.type == 3)
			this.updateAct27DescEx();
		
		this.playResult();
	}

	private updateAct27DescEx() {
		if (this.huntType == 0) { // 1
			this.zw.text = this.yb + "";
			this.zwHunt.visible = true;
			this.zwNum2.text = "/1";
			this.zw.text = this.yb + "";
		}else{//10
			this.zwHunt.visible = true;
			this.num.text = this.yb + "";
			this.zwNum2.text = "/10";
			this.zw.text = this.yb + "";
		}
		let itemId = GlobalConfig.ActivityType27Config[this.activityID][1].item
		this.icon.source = GlobalConfig.ItemConfig[itemId].icon + `_png`;
		let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,itemId);
		let colorStr: string = "";
		let sum:number = 0;
		if( item ){
			sum = item.count;
			colorStr = ColorUtil.GREEN_COLOR;
		}else{
			colorStr = ColorUtil.RED_COLOR;
		}
		
		this.zwNum1.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${sum}</font> `);
		this.ybicon.visible = this.num.visible = !this.zwHunt.visible;

		// if (this.huntType == 0) { // 1
		// 	this.zbHunt.visible = true;
		// 	this.zb.text = this.yb + "";
		// 	this.zbNum2.text = "/1";
		// 	this.zb.text = this.yb + ""; 
		// }else{//10
		// 	this.zbHunt.visible = true;
		// 	this.num.text = this.yb + "";
		// 	this.zbNum2.text = "/10";
		// 	this.zb.text = this.yb + ""; 
		// }
		// let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,GlobalConfig.ActivityType27Config[this.activityID][1].item);
		// let colorStr: string = "";
		// let sum:number = 0;
		// if( item ){
		// 	sum = item.count;
		// 	colorStr = ColorUtil.GREEN_COLOR;
		// }else{
		// 	colorStr = ColorUtil.RED_COLOR;
		// }
		// this.zbNum1.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${sum}</font> `);
		// this.ybicon.visible = this.num.visible = !this.zbHunt.visible;
	}

	private updateHuntDescEx(){
		if (this.huntType == 0) { // 1
			this.zbHunt.visible = true;
			this.zb.text = this.yb + "";
			this.zbNum2.text = "/1";
			this.zb.text = GlobalConfig.TreasureHuntConfig.huntOnce + ""; 
		}else{//10
			this.zbHunt.visible = true;
			this.num.text = this.yb + "";
			this.zbNum2.text = "/100";
			this.zb.text =GlobalConfig.TreasureHuntConfig.huntTenth + ""; 
		}
		let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,GlobalConfig.TreasureHuntConfig.huntItem);
		let colorStr: string = "";
		let sum:number = 0;
		if( item ){
			sum = item.count;
			colorStr = ColorUtil.GREEN_COLOR;
		}else{
			colorStr = ColorUtil.RED_COLOR;
		}
		this.zbNum1.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${sum}</font> `);
		this.ybicon.visible = this.num.visible = !this.zbHunt.visible;
	}
	private updateRuneDescEx(){
		if (this.huntType == 0) { // 1
			this.zw.text = this.yb + "";
			this.zwHunt.visible = true;
			this.zwNum2.text = "/1";
			this.zw.text = GlobalConfig.FuwenTreasureConfig.huntOnce + "";
		}else{//10
			this.zwHunt.visible = true;
			this.num.text = this.yb + "";
			this.zwNum2.text = "/10";
			this.zw.text = GlobalConfig.FuwenTreasureConfig.huntTenth + "";
		}
		this.icon.source = "200166_png";
		let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,GlobalConfig.FuwenTreasureConfig.huntItem);
		let colorStr: string = "";
		let sum:number = 0;
		if( item ){
			sum = item.count;
			colorStr = ColorUtil.GREEN_COLOR;
		}else{
			colorStr = ColorUtil.RED_COLOR;
		}
		
		this.zwNum1.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${sum}</font> `);
		this.ybicon.visible = this.num.visible = !this.zwHunt.visible;
	}

	private updateHeirloomDescEx():void
	{
		if (this.huntType == 0) { // 1
			this.zw.text = this.yb + "";
			this.zwHunt.visible = true;
			this.zwNum2.text = "/1";
			this.zw.text = GlobalConfig.HeirloomTreasureConfig.huntOnce + "";
		}else{//10
			this.zwHunt.visible = true;
			this.num.text = this.yb + "";
			this.zwNum2.text = "/10";
			this.zw.text = GlobalConfig.HeirloomTreasureConfig.huntTenth + "";
		}
		this.icon.source = "200300_png";
		let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,GlobalConfig.HeirloomTreasureConfig.huntItem);
		let colorStr: string = "";
		let sum:number = 0;
		if( item ){
			sum = item.count;
			colorStr = ColorUtil.GREEN_COLOR;
		}else{
			colorStr = ColorUtil.RED_COLOR;
		}
		
		this.zwNum1.textFlow = TextFlowMaker.generateTextFlow(`<font color=${colorStr}>${sum}</font> `);
		this.ybicon.visible = this.num.visible = !this.zwHunt.visible;
	}

	private updateHuntDesc(){
		let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,GlobalConfig.TreasureHuntConfig.huntItem);
		if( item  ){
			this.desc.visible = true;
			this.desc.text = `装备: 寻宝图 x `;
			if (this.huntType == 0) { // 1
				this.num.text = "1";
			}else{//10
				this.num.text = "10";
			}
			this.ybicon.visible = false;
			this.num.verticalCenter = this.desc.verticalCenter;
			this.num.horizontalCenter = this.desc.horizontalCenter + this.desc.width/2 + this.num.width/2;
		}
		this.ybicon.visible = this.num.visible = !this.zwHunt.visible;
	}

	private updateRuneDesc(){
		let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER,GlobalConfig.FuwenTreasureConfig.huntItem);
		if( item  ){
			this.desc.visible = true;
			this.desc.text = `符文: 寻宝图 x `;
			if (this.huntType == 0) { // 1
				this.num.text = "1";
			}else{//10
				this.num.text = "10";
			}
			this.ybicon.visible = false;
			this.num.verticalCenter = this.desc.verticalCenter;
			this.num.horizontalCenter = this.desc.horizontalCenter + this.desc.width/2 + this.num.width/2;
		}
	}

	private playResult(fun?) {
		this.releaseAllItem();
		let count = this.arr.length;
		for (let i = 0; i < count; i++) {
			this.items[i] = this.createItem(this.arr[i]);
			let t: egret.Tween = egret.Tween.get(this.items[i]);
			this.items[i].x = (i % 5) * c_distantX + c_firstX;
			this.items[i].y = Math.floor(i / 5) * c_distantY + c_firstY;
			this.items[i].alpha = 0;
			// this.items[i].showEquipEffect();
			t.wait(i * waitTime).to({alpha: 1}, 200).call(
				() => {
					count--;
					if (count == 0) {
						if (fun != undefined) {
							fun();
						}
						this.canClicck = true;
					}
				});
		}
	}

	private playGet(fun?) {
		let count = this.arr.length;
		for (let i = 0; i < count; i++) {
			if (!this.items[i])
				continue;
			let t: egret.Tween = egret.Tween.get(this.items[i]);
			t.to({
				"y": c_depotY,
				"x": c_depotX,
				"scaleX": 0,
				"scaleY": 0
			}, 300 - Math.floor(i / 5) * 50).call(
				() => {
					count--;
					if (count == 0) {
						if (fun != undefined) {
							fun();
						}
						this.releaseAllItem();
					}
				}
			);
		}
	}

	private createItem(data): ItemBase {
		let item = new ItemBase();
		this.listCon.addChild(item);
		let cfg:ItemConfig = GlobalConfig.ItemConfig[data[0]];
		if( cfg ){
			item.num = data[1];
			item.data = data[0];
		}else{
			item.data = {type:0,count:data[1],id:data[0]};
		}
		item.x = c_launchX;
		item.y = c_launchY;

		// if (item.getItemType() == 17)
		// 	item.showSpeicalDetail = false;

		return item;
	}

	private releaseAllItem() {
		for (let k in this.items) {
			this.items[k].destruct();
			this.listCon.removeChild(this.items[k]);
		}
		this.items = [];
	}

	private closeCB(e: egret.TouchEvent) {
		if (!this.canClicck) {
			return;
		}
		this.canClicck = false;

		let func = () => {
			ViewManager.ins().close(this);
		};
		this.playGet(func);
	}

	private buy(e: egret.TouchEvent) {
		if (!this.canClicck) {
			return;
		}

		// 判断背包容量
		if (UserBag.ins().getSurplusCount() <= UserBag.BAG_ENOUGH) {
			WarnWin.show("背包空间不足，请先清理背包!", ()=>{ViewManager.ins().open(BagWin);}, this);
			return;
		}

		if (this.type == 2 && this.huntType == 0 && Heirloom.ins().huntFreeTimes > 0)
		{
			Heirloom.ins().sendHunt(this.huntType);		
			return;
		}

		let itemId = 0;
		if (this.type == 3)
			itemId = GlobalConfig.ActivityType27Config[this.activityID][1].item;
		else if (this.type == 2)
			itemId = GlobalConfig.HeirloomTreasureConfig.huntItem;
		else if (this.type == 1)
			itemId = GlobalConfig.FuwenTreasureConfig.huntItem;
		else
			itemId = GlobalConfig.TreasureHuntConfig.huntItem;

		let item:ItemData = UserBag.ins().getItemByTypeAndId(UserBag.BAG_TYPE_OTHTER, itemId);
		if( item  ){
			let func = () => {
				if (this.type == 0)
					Hunt.ins().sendHunt(this.huntType);
				else if (this.type == 1)
					Rune.ins().sendHuntRune(this.huntType);
				else if (this.type == 2)
					Heirloom.ins().sendHunt(this.huntType);
				else if (this.type == 3)
					Activity.ins().sendReward(this.activityID, this.huntType == 0 ? 1 : 2);
			};
			this.playGet(func);
			this.canClicck = false;
			return;
		}

		if (Actor.yb >= this.yb) {
			let func = () => {
				if (this.type == 0)
					Hunt.ins().sendHunt(this.huntType);
				else if (this.type == 1)
					Rune.ins().sendHuntRune(this.huntType);
				else if (this.type == 2)
					Heirloom.ins().sendHunt(this.huntType);
				else if (this.type == 3)
					Activity.ins().sendReward(this.activityID, this.huntType == 0 ? 1 : 2);
			};

			this.playGet(func);
			this.canClicck = false;
		} else {
			UserTips.ins().showTips("|C:0xf3311e&T:元宝不足|");
		}

	}

}

ViewManager.ins().reg(HuntResultWin, LayerManager.UI_Main);
