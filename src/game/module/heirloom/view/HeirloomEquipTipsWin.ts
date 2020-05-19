/**
 *
 * 诛仙专用tips
 *
 */
class HeirloomEquipTipsWin extends BaseEuiView {
	private equipName:eui.Label;
	private slot:eui.Label;
	private power:eui.Label;

	// private value[0-3]eui.Label; 基础属性
	// private value[4-6]eui.Label; 特殊属性
	private skilldesc:eui.Label;

	private equipItem:HeirloomItem;

	private info:HeirloomInfo | HeirloomEquipConfig;
	private index:number;
	private curRole:Role;
	private powerPanel: PowerPanel;

	private bgClose:eui.Rect;
	constructor() {
		super();
		this.skinName = "heirloomitemtips";
	}


	public initUI(): void {
		super.initUI();

	}

	public open(...param: any[]): void {
		this.curRole   = param[0];
		this.index     = param[1];
		if( this.curRole && this.curRole.heirloom )
			this.info = this.curRole.heirloom.getInfoBySolt(this.index);
		if( !this.info || !this.info.lv )
			this.info = GlobalConfig.HeirloomEquipConfig[this.index+1][1];

		this.addTouchEndEvent(this.bgClose, this.onClick)
		this.init();
	}

	public close(...param: any[]): void {
		// this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this.bgClose);
		//this.removeTouchEvent(this.btn_toolbar, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onClick)
		this.removeObserve();
	}

	public init(){
		this.equipItem.data = {pos:this.index,info:this.info};
		this.equipItem.setTipsVisible();

		this.equipName.text = this.info.name;
		this.slot.text = HeirloomData.getEquipName(this.index);
		let attrs: AttributeData[] = this.setBasicsDesc();
		this.setSpecialDesc();
		this.setSkillDesc();

		let power:number = Math.floor(UserBag.getAttrPower(attrs));
		this.power.text = "评分:"+power;

		if (this.curRole) {
			power = this.curRole.getHeirloomSlotPower(this.index);
		}
		this.powerPanel.setPower(power);
	}
	private onClick(){
		ViewManager.ins().close(this);
	}
	public setBasicsDesc():AttributeData[]{
		let attrs:AttributeData[] = [];
		//0~3基础属性
		for( let i = 0; i < this.info.attr.length;i++ ){
			if( i > 3 ){
				break;
			}
			let ad:AttributeData = new AttributeData;
			let attr:{type:number,value:number} = this.info.attr[i];
			let str = AttributeData.getAttrStrByType(attr.type);
			str += "+"+attr.value;
			this["value"+i].text = str;
			ad.type  = attr.type;
			ad.value = attr.value;
			attrs.push(ad);
		}

		return attrs;
	}
	public setSpecialDesc(){
		//4~x特殊属性
		for( let i = 4; i < this.info.attr.length;i++ ){
			if( this["value"+i] ){
				let attr:{type:number,value:number} = this.info.attr[i];
				let str = AttributeData.getAttrStrByType(attr.type);
				str += "+"+attr.value;
				this["value"+i].text = str;
			}
		}
		let str = HeirloomData.getEquipName(this.index);
		str += "部件所有属性+" + this.info.attr_add + "%";
		this["value6"].text = str;
	}
	public setSkillDesc(){
		let str = "";
		if( this.info.skillname )
			str  = this.info.skillname + "\n" + this.info.skilldesc;
		else
			str  = "无";
		this.skilldesc.textFlow = TextFlowMaker.generateTextFlow1(str);
	}



}
ViewManager.ins().reg(HeirloomEquipTipsWin, LayerManager.UI_Popup);