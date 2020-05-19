/**
 * 心法部位tips界面
 *
 */
class HeartMethodTips extends BaseEuiView {
	private bgClose: eui.Rect;
	private nameLabel: eui.Label;

	private attr: eui.Label;
	private value: eui.Label;
	private ModelGroup: eui.Group;
	private powerPanel: PowerPanel;
	private addStar: eui.Button;
	private replace: eui.Button;
	private icon: eui.Image;//部位底图
	private mc: MovieClip;//部位特效
	private effGroup: eui.Group;
	private cost: eui.Label;

	private roleId: number;
	private heartId: number;//心法id
	private pId;//部位索引(12345)
	private id: number;//部位itemid
	private isAdd: boolean;//是否可升星
	private isMax: boolean;//是否满级
	private isChange: boolean;//是否可替换
	private starList: StarList;
	private starGroup: eui.Group;
	private redPoint1: eui.Image;
	private redPoint2: eui.Image;
	private qualityImg:eui.Image;

	constructor() {
		super();
		this.skinName = 'heartmethodTips';

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onClick);
		this.addTouchEvent(this.addStar, this.onClick);
		this.addTouchEvent(this.replace, this.onClick);
		this.observe(HeartMethod.ins().postHeartUpLevel, this.updateUI);
		this.roleId = param[0];
		this.heartId = param[1];
		this.id = param[2];
		this.updateUI();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onClick);
		this.removeTouchEvent(this.addStar, this.onClick);
		this.removeTouchEvent(this.replace, this.onClick);
		DisplayUtils.removeFromParent(this.starList);
		this.starList = null;
	}


	private onClick(e: egret.Event) {
		switch (e.target) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.addStar:
				if (this.isMax) {
					UserTips.ins().showTips(`已满星`);
					return;
				}
				if (this.isAdd) {
					HeartMethod.ins().sendHeartUpLevel(this.roleId, this.heartId, this.pId);
				}
				else
					UserTips.ins().showTips(`|C:0xff0000&T:材料不足`);
				break;
			case this.replace:
				let itemid: number = HeartMethod.ins().calcHeartSlotChange(this.roleId, this.heartId, this.id);
				if (!itemid) {
					UserTips.ins().showTips(`没有更好的部位被替换`)
					return;
				}
				// let pos = HeartMethod.ins().getSuitPosFromItemId(this.id);
				if (!this.pId) {
					UserTips.ins().showTips(`道具:${this.id}套装部位数据异常`);
					return;
				}
				HeartMethod.ins().sendHeartChange(this.roleId, this.heartId, this.pId, itemid);
				break;
		}
	}


	private updateUI() {
		this.pId = HeartMethod.ins().getSuitPosFromItemId(this.id);
		if (!this.pId) return;
		this.id = HeartMethod.ins().HeartMethodInfo[this.roleId][this.heartId].slots[this.pId - 1];
		//特效
		let config: HeartMethodStarConfig = GlobalConfig.HeartMethodStarConfig[this.id];
		if (!config)return;
		this.icon.source = config.bigIcon;
		if (!this.mc)
			this.mc = new MovieClip;
		if (!this.mc.parent)
			this.effGroup.addChild(this.mc);
		this.mc.playFile(RES_DIR_EFF + config.effect, -1);

		//部位名字
		let itemConfig: ItemConfig = GlobalConfig.ItemConfig[this.id];
		this.nameLabel.textFlow = TextFlowMaker.generateTextFlow1(`|C:${ItemConfig.getQualityColor(itemConfig)}&T:${itemConfig.name}`);

		//战力
		let power = UserBag.getAttrPower(config.attr as AttributeData[]);
		this.powerPanel.setPower(power);
		
		//属性描述
		let strAttrName = "";
		let strAttrValue = "";
		for (let idata of HeartMethod.ins().proShowList) {
			for (let jdata of config.attr) {
				if (idata.id == jdata.type) {
					let sname = HeartMethod.ins().getAttrStrByType(jdata.type);
					if (!sname)continue;
					if (!jdata.value)continue;//属性值0跳过
					strAttrName += sname;
					strAttrValue += `+${jdata.value}`;
					strAttrName += "\n";
					strAttrValue += "\n";
				}
			}
		}
		if (strAttrName) {
			let index: number = strAttrName.lastIndexOf("\n");
			strAttrName = strAttrName.substring(0, index);
		}
		if (strAttrValue) {
			let index: number = strAttrValue.lastIndexOf("\n");
			strAttrValue = strAttrValue.substring(0, index);
		}

		this.attr.text = strAttrName;
		this.value.text = strAttrValue;


		//消耗
		let costStr = "";
		this.isMax = false;
		if (config.nextItem) {
			let itemcfg: ItemConfig = GlobalConfig.ItemConfig[config.costItem];
			if (itemcfg) {
				let color = ItemConfig.getQualityColor(itemcfg);
				costStr = `|C:0xFFFFCC&T:消耗 |C:${color}&T:${itemcfg.name}|C:0xFFFFCC&T: X${config.costNum}`;
				this.cost.textFlow = TextFlowMaker.generateTextFlow1(costStr);
			}
			this.isAdd = HeartMethod.ins().calcHeartSlotCost(this.id);
		} else {
			//满级
			this.isMax = true;
			this.isAdd = false;
		}
		this.cost.visible = costStr ? true : false;

		let hmpconfig: HeartMethodPosConfig[] = GlobalConfig.HeartMethodPosConfig[config.posId][config.quality];
		if (hmpconfig) {
			let stars = Object.keys(hmpconfig).length - 1;//有0星 所以-1
			if (!this.starList) {
				this.starList = new StarList(stars);
				this.starList.horizontalCenter = 0;
				this.starList.y = 0;
				this.starGroup.addChild(this.starList);
			} else {
				this.starList.setlistLength(stars, config.star);
			}
			//星数
			this.starList.setStarNum(config.star);
		}

		this.qualityImg.source = "common1_tips_" + config.quality;
		this.updateRedPoint();
	}

	private updateRedPoint() {
		this.redPoint1.visible = this.isAdd;
		this.redPoint2.visible = HeartMethod.ins().calcHeartSlotChange(this.roleId, this.heartId, this.id) ? true : false;
	}


}
ViewManager.ins().reg(HeartMethodTips, LayerManager.UI_Popup);