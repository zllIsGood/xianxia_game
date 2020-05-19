/**
 * 剑灵技能tips
 *
 */
class WeaponSoulSkillTips extends BaseEuiView {
	private bgClose:eui.Rect;
	private skillicon:WeaponSkillItem;
	private skillname:eui.Label;

	/** 当前技能等级 **/
	private num0:eui.Label;
	private informationname0:eui.Label;
	private desc0:eui.Label;

	/** 下一个技能等级 **/
	private name1:eui.Label;
	private num1:eui.Label;
	private nextdesc1:eui.Label;
	private informationname1:eui.Label;
	private ndesc0:eui.Label;


	private roleId:number;
	private weaponId:number;//剑灵id(套装)
	constructor() {
		super();
		this.skinName = 'weaponSoulSkilltips';

	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onClick);

		this.roleId = param[0];
		this.weaponId = param[1];
		let role:Role = SubRoles.ins().getSubRoleByIndex(this.roleId);

		this.head(role);
		this.curSkill(role);
		this.nextSkill(role);
	}
	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onClick);

	}
	private head(role:Role){
		let config:WeaponSoulSuit = role.weapons.getSuitConfig(this.weaponId);
		if( !config )
			config = GlobalConfig.WeaponSoulSuit[this.weaponId][0]
		this.skillicon.data = {icon:config.skillicon};
		this.skillname.text = config.skillname;
	}
	private curSkill(role:Role){
		let config:WeaponSoulSuit = role.weapons.getSuitConfig(this.weaponId);
		if( !config )
			config = GlobalConfig.WeaponSoulSuit[this.weaponId][0]
		let wsconfig:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[this.weaponId];
		let slotStrs:string = "";
		let curNum:number = 0;
		for( let i = 0;i < wsconfig.actcond.length;i++ ){
			let slot:number = wsconfig.actcond[i];
			let level:number = role.weapons.getInfoLevel(slot);
			let wname:string = GlobalConfig.WeaponSoulPosConfig[slot][0].name;
			if( level && level >= config.level ){
				slotStrs +=  `|C:${ColorUtil.WHITE_COLOR2}&T:${wname}| `;
				curNum++;
			}else{
				slotStrs +=  `|C:${ColorUtil.GRAY_COLOR2}&T:${wname}| `;
			}
		}
		this.num0.text = `（${curNum}/${wsconfig.actcond.length}）`;
		this.informationname0.textFlow = TextFlowMaker.generateTextFlow1(slotStrs);
		this.desc0.text = this.ShowSkillDesc(config);
	}
	private nextSkill(role:Role){
		let config:WeaponSoulSuit = role.weapons.getNextSuitConfig(this.weaponId);
		if( !config ){
			this.name1.text = "已满级";
			this.num1.visible = false;
			this.nextdesc1.visible = false;
			this.informationname1.visible = false;
			this.ndesc0.visible = false;
			return;
		}
		let wsconfig:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[this.weaponId];
		let slotStrs:string = "";
		let curNum:number = 0;
		for( let i = 0;i < wsconfig.actcond.length;i++ ){
			let slot:number = wsconfig.actcond[i];
			let level:number = role.weapons.getInfoLevel(slot);
			let wname:string = GlobalConfig.WeaponSoulPosConfig[slot][0].name;
			if( level >= config.level ){
				slotStrs +=  `|C:${ColorUtil.WHITE_COLOR2}&T:${wname}| `;
				curNum++;
			}else{
				slotStrs +=  `|C:${ColorUtil.GRAY_COLOR2}&T:${wname}| `;
			}
		}
		this.num1.text = `（${curNum}/${wsconfig.actcond.length}）`;
		this.informationname1.textFlow = TextFlowMaker.generateTextFlow1(slotStrs);
		this.ndesc0.text = this.ShowSkillDesc(config);

		//所有等级达到X
		let str:string = this.nextdesc1.text;
		let tmp:string[] = str.split("X");
		let s1:string = tmp[0];
		let s2:string = tmp[1];
		let newstr:string = s1 + `${config.level}` +s2;
		this.nextdesc1.text = newstr;
	}
	private ShowSkillDesc(config:WeaponSoulSuit):string{
		return config.skilldesc;
		// let str:string = "";
		// for( let i = 0;i < config.attr.length;i++ ){
		// 	let att:{type:number,value:number} = config.attr[i];
		// 	let sname:string = AttributeData.getAttrStrByType(att.type);//属性名
		// 	str += sname + "+" + att.value +"\n";
		// }
		// return str;
	}

	private onClick(e: egret.Event){
		switch (e.target){
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}

}
ViewManager.ins().reg(WeaponSoulSkillTips, LayerManager.UI_Popup);