/**
 * 剑灵部位升级tips
 * (已经废弃 移至WeaponSoulBreakWin)
 *
 */
class WeaponSoulUplvWin extends BaseEuiView {
	private bgClose:eui.Rect;
	/** 升级 **/
	private shengji:eui.Group;
	private name0:eui.Label;
	private item0:ItemIcon

	private attr1:eui.Label;
	private attr2:eui.Label;
	private attr3:eui.Label;
	private attr4:eui.Label;
	private attr5:eui.Label;
	private attr6:eui.Label;
	private rightIcon0:eui.Image;
	private rightIcon1:eui.Image;

	private btn1:eui.Button;
	private micon:eui.Image;
	private countLabel0:eui.Label;

	private costgroup:eui.Group;
	private maxdesc:eui.Label;

	private maxSum:number;
	private curSum:number;
	constructor() {
		super();
		this.skinName = 'weaponSoulUplv';

	}

	private roleId:number;
	private slot:number;
	private winfo:WeaponsInfo;
	public open(...param: any[]): void {
		this.addTouchEvent(this.btn1, this.onClick);//升级
		this.addTouchEvent(this.bgClose, this.onClick);
		this.observe(Weapons.ins().postWeaponsUpLevel, this.callback);
		this.roleId = param[0];
		this.slot = param[1];

		this.update();
	}
	public callback(){
		UserTips.ins().showTips("升级成功");
		this.update();
	}
	public update(){
		let role:Role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		let winfo:WeaponsInfo = role.weapons.getSlotByInfo(this.slot);
		let wspconfig:WeaponSoulPosConfig  = GlobalConfig.WeaponSoulPosConfig[winfo.id][0];
		let nextconfig:WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[winfo.id][winfo.level+1];
		if( !nextconfig ){
			//满级
			this.costgroup.visible = false;
			this.btn1.visible = this.costgroup.visible;
			this.rightIcon0.visible = this.costgroup.visible;
			this.rightIcon1.visible = this.costgroup.visible;
			this.attr6.visible = this.costgroup.visible;
			this.attr4.visible = this.costgroup.visible;
			this.maxdesc.visible = !this.costgroup.visible;
			if( winfo.attr ){
				this.attr5.text = winfo.attr[0].value + "";
				this.attr2.text = AttributeData.getAttrStrByType(winfo.attr[0].type);//属性名
			}
			this.name0.text = wspconfig.name;
			this.item0.imgIcon.source = wspconfig.icon + "_png";//图片资源只有0级有数据
			// this.item0.imgBg.source = ""
			this.item0.imgJob.visible = false;
			return;
		}

		this.item0.imgIcon.source = wspconfig.icon + "_png";//图片资源只有0级有数据
		// this.item0.imgBg.source = ""
		this.item0.imgJob.visible = false;
		this.name0.text = wspconfig.name;


		if( winfo.attr ){
			//从X->Y
			this.attr5.text = winfo.attr[0].value + "";
			this.attr6.text = nextconfig.attr[0].value + "";
			this.rightIcon0.x = this.attr5.x + this.attr5.width + this.rightIcon0.width;
			this.attr6.x = this.rightIcon0.x;

			//从Z->X
			this.attr2.text = AttributeData.getAttrStrByType(winfo.attr[0].type);//属性名
			this.attr3.text = winfo.attr[0].value + "";//当前属性
			this.attr4.text = nextconfig.attr[0].value + "";//下一个属性
			this.rightIcon1.x = this.attr3.x + this.attr3.width + this.rightIcon1.width;
			this.attr4.x = this.rightIcon1.x;

			//背包拥有数
			let itemData:ItemData = UserBag.ins().getBagItemById(winfo.costItem);
			let costItemLen:number = itemData?itemData.count:0;
			let itemconfig:ItemConfig = GlobalConfig.ItemConfig[winfo.costItem];
			this.micon.source = itemconfig.icon + "";
			this.countLabel0.text = costItemLen + "/" + winfo.costNum;

			this.curSum = costItemLen;
			this.maxSum = winfo.costNum;
		}

	}
	private onClick(e: egret.Event){
		switch( e.target ){
			case this.btn1://升级
				if( this.curSum < this.maxSum ){
					UserTips.ins().showTips("材料不足");
					return;
				}
				Weapons.ins().sendWeaponsUpLevel(this.roleId,this.slot);
				break;
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.btn1, this.onClick);
		this.removeTouchEvent(this.bgClose, this.onClick);
		this.removeObserve();
	}
}
ViewManager.ins().reg(WeaponSoulUplvWin, LayerManager.UI_Popup);