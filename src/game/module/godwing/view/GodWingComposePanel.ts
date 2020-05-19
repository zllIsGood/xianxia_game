/**
 * 神羽合成装备界面
 */
class GodWingComposePanel extends BaseView {
	public powerPanel: PowerPanel;

	/**控件*/
	public skill:eui.Image;
	// public item0:GodWingItem
	public attr:eui.Button;
	private list:eui.List;
	// private item0:GodWingItem

	private now:GodWingItem;
	private next:GodWingItem;


	private compose:eui.Button;
	private redPoint:eui.Label;

	private attr0:eui.Label;
	private power0:eui.Label;

	private attr1:eui.Label;
	private power1:eui.Label;
	private attr2:eui.Label;
	private power2:eui.Label;

	public curIndex:number;
	private slot:number;//选中部位
	private itemList:eui.ArrayCollection;
	private dataList:{slot:number,suitConfig:GodWingSuitConfig}[];
	private number:eui.Label;
	constructor() {
		super();

	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.compose,this.onClick)
		this.removeObserve();
		//部位
		for( let i = 0;i < Wing.GodWingMaxSlot;i++ ){
			this.removeTouchEvent(this[`item${i}`], this.onSlot);
		}
	}


	public open(...param: any[]): void {
		this.addTouchEndEvent(this.compose,this.onClick);
		this.addTouchEvent(this.now, this.onClick);
		this.addTouchEndEvent(this.next,this.onClick);

		this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP,this.onListTap,this);
		this.observe(GodWingRedPoint.ins().postGodWingCompose,this.updateItem);
		this.slot = 1;//部位
		//套装阶级
		for ( let i in GlobalConfig.GodWingSuitConfig ){
			this.curIndex = GlobalConfig.GodWingSuitConfig[i].lv;//第一件
			break;
		}
		//部位
		for( let i = 0;i < Wing.GodWingMaxSlot;i++ ){
			this.addTouchEvent(this[`item${i}`], this.onSlot);
			this[`item${i}`].setSelect(false);
		}
		this[`item${0}`].setSelect(true);
		this.list.itemRenderer = GodWingComposeItem;
		this.itemList = new eui.ArrayCollection([]);
		// this.observe(Wing.ins().postBoost, this.showBoost);
		this.updateGodWing()
	}
	//选择列表
	private onListTap(e: eui.ItemTapEvent): void {
		if (e && e.itemRenderer && e.item) {
			let suit:{slot:number,suitConfig:GodWingSuitConfig} = e.item as {slot:number,suitConfig:GodWingSuitConfig};//GodWingSuitConfig
			this.curIndex = suit.suitConfig.lv;
			this.updateItem();
		}
	}
	//选择部位
	private onSlot(e:egret.TouchEvent):void{
		for( let i = 0;i < Wing.GodWingMaxSlot;i++ ){
			if( e.currentTarget == this[`item${i}`] ){
				this[`item${i}`].setSelect(true);
				this.slot = i+1;
				this.updateItem();
			}else{
				this[`item${i}`].setSelect(false);
			}
		}
	}
	private onClick(e:egret.TouchEvent):void{
		switch (e.currentTarget){
			case this.compose:
				let gwconfig:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[this.curIndex][this.slot];
				if( Wing.ins().isComposeGodWingOnly(gwconfig.itemId) ){
					let glconfig:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[this.curIndex][this.slot];
					//请求合成神羽
					Wing.ins().sendWingCompose(2,glconfig.itemId);
				}
				else{
					UserTips.ins().showTips(`|C:0xff0000&T:材料不足`);
				}
				break;
			case this.now:
				let gwConfig:GodWingItemConfig;
				if( e.currentTarget.data instanceof ItemConfig){
					//碎片
					let cfg:ItemConfig = e.currentTarget.data as ItemConfig;
					let itemdata:ItemData = UserBag.ins().getBagItemById(cfg.id);
					let count:number = itemdata?itemdata.count:0;
					ViewManager.ins().open(ItemDetailedWin, 0, cfg.id, count);
				}else{
					let cfg:GodWingLevelConfig = e.currentTarget.data as GodWingLevelConfig;
					gwConfig = GlobalConfig.GodWingItemConfig[cfg.itemId];
					ViewManager.ins().open(GodWingTipsWin, gwConfig);
				}

				break;
			case this.next:
				let cfg:GodWingLevelConfig = e.currentTarget.data as GodWingLevelConfig;
				gwConfig = GlobalConfig.GodWingItemConfig[cfg.itemId];
				ViewManager.ins().open(GodWingTipsWin, gwConfig);
				break;
		}

	}



	/**UI*/
	private updateGodWing(){
		//左边的套装列表
		this.dataList = [];
		let slot:number = 1;
		for( let i in GlobalConfig.GodWingSuitConfig ){
			let suitConfig:GodWingSuitConfig = GlobalConfig.GodWingSuitConfig[i];
			this.dataList.push({slot:slot,suitConfig:suitConfig});//同一个部位5阶
		}
		this.itemList.replaceAll(this.dataList);
		this.list.dataProvider = this.itemList;
		this.list.validateNow();
		this.list.selectedIndex = 0;

		this.updateItem();
	}

	private updateItem(){
		let glconfig:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[this.curIndex][this.slot];
		let mysum:number = 0;
		let totalsum:number = 0;
		this[`power0`].visible = this[`attr0`].visible = false;
		if( glconfig ){
			this.next.data = glconfig;//当前
			this.next.setCountVisible(false);
			let gwconfig:GodWingItemConfig = GlobalConfig.GodWingItemConfig[glconfig.itemId];
			gwconfig = GlobalConfig.GodWingItemConfig[gwconfig.composeItem.id];//是否是碎片
			if( !gwconfig ){//碎片
				//1阶去道具表找碎片
				gwconfig = GlobalConfig.GodWingItemConfig[glconfig.itemId];
				let itemconfig:ItemConfig = GlobalConfig.ItemConfig[gwconfig.composeItem.id];
				this.now.data = itemconfig;
				this.now.setCountVisible(false);
				let attrtext:string = AttributeData.getAttStr(gwconfig.attr, 0, 1, "：") + "\n";
				attrtext += AttributeData.getExAttrNameByAttrbute(gwconfig.exattr[0], true);
				this[`attr0`].text = attrtext;
				let power0:number = Math.floor(UserBag.getAttrPower(gwconfig.attr));
				this[`power0`].text = `战斗力：${power0+gwconfig.exPower}`;


				let itemdata:ItemData = UserBag.ins().getBagItemById(itemconfig.id);
				mysum = itemdata?itemdata.count:0;
				totalsum = gwconfig.composeItem.count;


				this[`power0`].visible = this[`attr0`].visible = true;
			}else{
				//左边
				let prelevel:number = Wing.ins().getPreLevel(this.curIndex);
				let preconfig:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[prelevel][this.slot];
				this.now.data = preconfig;
				this.now.setCountVisible(false);
				let pregwconfig:GodWingItemConfig = GlobalConfig.GodWingItemConfig[preconfig.itemId];
				let preattrtext:string = AttributeData.getAttStr(pregwconfig.attr, 0, 1, "：") + "\n";
				preattrtext += AttributeData.getExAttrNameByAttrbute(pregwconfig.exattr[0], true);
				this[`attr1`].text = preattrtext;
				let power1:number = Math.floor(UserBag.getAttrPower(pregwconfig.attr));
				this[`power1`].text = `战斗力：${power1+pregwconfig.exPower}`;

				//右边
				gwconfig = GlobalConfig.GodWingItemConfig[glconfig.itemId];
				let attrtext:string = AttributeData.getAttStr(gwconfig.attr, 0, 1, "：") + "\n";
				attrtext += AttributeData.getExAttrNameByAttrbute(gwconfig.exattr[0], true);
				this[`attr2`].text = attrtext;
				let power2:number = Math.floor(UserBag.getAttrPower(gwconfig.attr));
				this[`power2`].text = `战斗力：${power2+gwconfig.exPower}`;

				//数量
				let itemdata:ItemData = UserBag.ins().getBagItemById(gwconfig.composeItem.id);
				mysum = itemdata?itemdata.count:0;
				totalsum = gwconfig.composeItem.count;


			}
		}
		this[`attr1`].visible = this[`attr2`].visible = !this[`attr0`].visible;
		this[`power1`].visible = this[`power2`].visible = !this[`power0`].visible;
		//
		let colorStr: number;
		if (mysum >= totalsum)
			colorStr = ColorUtil.GREEN;
		else
			colorStr = ColorUtil.RED;

		this.number.textFlow = TextFlowMaker.generateTextFlow1(`|C:${colorStr}&T:${mysum}|/|C:0xD1C28F&T:${totalsum}`);

		//刷新部位列表
		for( let i = 0;i < this.dataList.length;i++ ){
			this.dataList[i].slot = this.slot;
		}
		this.itemList.replaceAll(this.dataList);
		this.list.dataProvider = this.itemList;

		this.updateRedPoint();
		this.updateGodWingItem();

	}

	private updateGodWingItem(){
		for( let i = 0;i < Wing.GodWingMaxSlot;i++ ){
			let glconfig:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[this.curIndex][i+1];
			let config:GodWingItemConfig = GlobalConfig.GodWingItemConfig[glconfig.itemId];
			this[`item${i}`].data = config;
			this[`item${i}`].setImgIcon(`sybg${(i+1)}`);
			this[`item${i}`].setCountVisible(false);
			this[`item${i}`].setNameVisible(false);
		}
	}

	private updateRedPoint(){
		let gwconfig:GodWingLevelConfig = GlobalConfig.GodWingLevelConfig[this.curIndex][this.slot];
		this.redPoint.visible = Wing.ins().isComposeGodWingOnly(gwconfig.itemId);

		//同一个部位某阶
		for( let i = 0;i < this.list.numElements;i++ ){
			let render: GodWingComposeItem = this.list.getVirtualElementAt(i) as GodWingComposeItem;
			let slotdata:{slot:number,suitConfig:GodWingSuitConfig} = this.list.dataProvider.getItemAt(i) as {slot:number,suitConfig:GodWingSuitConfig};
			let b:boolean = Wing.ins().isComposeGodWingLevel(slotdata.suitConfig.lv,this.slot);
			render.setRedPoint(b);
		}
		//某阶某部位
		for( let i = 1;i <= Wing.GodWingMaxSlot;i++ ){
			let b:boolean = Wing.ins().isComposeGodWingSlot(this.curIndex,i);
			this[`item${i-1}`].updateRedPoint(b);
		}


	}

}
