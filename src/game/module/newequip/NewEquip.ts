/**
 * 新装备提示穿戴系统
 */
class NewEquip extends BaseSystem {
	public equipsList:ItemData[];

	public static ins(): NewEquip {
		return super.ins() as NewEquip;
	}

	public constructor() {
		super();
		// this.observe(UserBag.ins().postItemAdd, this.updateItem);//道具添加
		this.observe(UserEquip.ins().postEquipChange, this.callBack);//装备穿戴返回
		this.equipsList = [];
	}


	/**是否开启提示**/
	public check():boolean{
		//检测当前是否开启
		if(!OpenSystem.ins().checkSysOpen(SystemType.NEWEQUIP)){
			return false;
		}
		return true;
	}
	/**穿戴返回*/
	public callBack(){
		// //头装备已传戴成功
		// this.equipsList.shift();
	}
	/**新增装备道具*/
	public addItem(newItem:ItemData){
		if( !newItem ) return;
		if( !this.check() ) return;

		let newPos = ItemConfig.getSubType(newItem.itemConfig);
		let newJob = ItemConfig.getJob(newItem.itemConfig);
		let role:Role = SubRoles.ins().getSubRoleByIndex(0);
		if( role.job != newJob )return;//不同职业
		//是否可穿
		if (UserZs.ins().lv >= (newItem.itemConfig.zsLevel || 0) && Actor.level >= (newItem.itemConfig.level || 1)) {

		} else {
			// UserTips.ins().showTips("|C:0xF3311E&T:等级不足，无法穿戴|");
			return;
		}

		let isInList:boolean = false;//是否在列表中
		//先检查列表中是否有相同部位的道具 有则与列表中的对比 好则替换 除了列表头部位以外(当前正在处理列表头)
		for( let i = 0;i < this.equipsList.length;i++ ){
			let curItem:ItemData = this.equipsList[i];
			let pos:number = ItemConfig.getSubType(curItem.itemConfig);
			//与列表头相同部位并且评分比它高 允许重复插入
			if( i == 0 && newPos == pos ){
				if( newPos == pos ){
					isInList = true;
					//当前列表同部位装备和新装备比
					if( this.compareEquip(curItem,newItem) ){
						this.equipsList.push(newItem);
					}
					break;
				}
			}else{
				if( newPos == pos ){
					isInList = true;
					//当前列表同部位装备和新装备比
					if( this.compareEquip(curItem,newItem) ){
						this.equipsList[i] = newItem;//新装备替代列表旧装备
					}
					break;
				}
			}
		}

		/***没在放入列表跟身上装备比(因为在操作列表头（相同部位）装备同时获得一件比列表头（相同部位）差  却有比身上装备好的装备)*/
		if( !isInList ){
			let equip:EquipsData = role.equipsData[newPos];
			if( equip && equip.item && equip.item.itemConfig ){
				//身上装备和新装备比
				if( this.compareEquip(equip.item,newItem) ){
					this.equipsList.push(newItem);
				}
			}else{
				//角色身上这个部位没有装备
				this.equipsList.push(newItem);
			}
		}

		let view:PlayFunView = ViewManager.ins().getView(PlayFunView) as PlayFunView;
		if( view )
			view.updateNewEquip();
	}

	//比较两个装备的评分
	private compareEquip(curItem:ItemData,newItem:ItemData){
		let curPower = curItem.point;//Math.floor(UserBag.getAttrPower(curItem.att));
		let newPower = newItem.point;//Math.floor(UserBag.getAttrPower(newItem.att));
		return newPower > curPower;
	}

}
namespace GameSystem {
	export let  newEquip = NewEquip.ins.bind(NewEquip);
}