/**
 * 剑灵展示
 */
class WeaponShowPanel extends BaseView {
	/** item4 **/
	//item40-item43
	//lianjiexian40-lianjiexian43
	//zhan40-zhan43
	//fa40-fa43
	//dao40-dao43
	private model4: eui.Image;//定位动态特效和静态模型

	/** item6 **/
	//item60-item65
	//lianjiexian60-lianjiexian65
	//zhan60-zhan65
	//fa60-fa65
	//dao60-dao65
	private model6: eui.Image;//定位动态特效和静态模型

	/** item8 **/
	//item80-item87
	//lianjiexian80-lianjiexian87
	//zhan80-zhan87
	//fa80-fa87
	//dao80-dao87
	private model8: eui.Image;//定位动态特效和静态模型

	private weaponImg: eui.Image;
	private effgroup: eui.Group;
	private effpos: eui.Image;

	private role: Role;
	private mc: MovieClip;
	private weaponId: number;//当前选中的剑灵id
	private roleId: number;

	private masksp: egret.Sprite;
	constructor() {
		super();
		this.skinName = 'weaponSoulSkinState';
	}

	public childrenCreated(): void {

	}
	public open(...param: any[]): void {
		this.observe(Weapons.ins().postWeaponsUpLevel, this.callback);
		this.roleId = 0;
		this.weaponId = 0;
	}
	public close(...param: any[]): void {
		this.releaseEvent();
		this.removeObserve();
	}
	public releaseEvent() {
		if (!this.currentState) return;
		DisplayUtils.removeFromParent(this.mc);
		this.mc = null;
		DisplayUtils.removeFromParent(this.masksp);
		this.masksp = null;
		for (let i = 0; i < Number(this.currentState); i++) {
			this.removeTouchEvent(this["item" + i], this.onClick);
			// this.cleanFilters(this.currentState,i);
		}

	}
	/**
	 * 初始化
	 * @param 剑灵id
	 * @param 角色id
	 * **/
	public init(idx?: number, rId?: number): void {
		let id: number = idx ? idx : this.weaponId;
		let roleId: number = !isNaN(rId) ? rId : this.roleId;
		this.weaponId = id;
		this.roleId = roleId;
		let wsconfig: WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
		if (!wsconfig) return;
		let state: number = wsconfig.actcond.length;
		this.releaseEvent();//清除上一次监听
		let role = SubRoles.ins().getSubRoleByIndex(roleId);
		this.currentState = state + "";
		let wsinfo: WeaponsSoulInfo = role.weapons.getWeapsInfoBySoulId(wsconfig.id);
		// let jobStr:string = this.getJobSkinName(role.job);
		// this.setWeaponsModel();
		let isActNum: number = 0;
		for (let i = 0; i < wsconfig.actcond.length; i++) {
			this.addTouchEvent(this["item" + i], this.onClick);
			// this.addTouchEvent(this["item"+this.currentState+i], this.onClick);
			// this["model"+state+"zhan"].visible = false;
			// this["model"+state+"fa"].visible = false;
			// this["model"+state+"dao"].visible = false;
			// this[jobStr + this.currentState + i ] = true;
			//激活剑灵
			if (wsinfo.id) {
				isActNum++;
				if (this["lianjiexian" + i])
					this.setLight(this["lianjiexian" + i]);
				if (this["item" + i])
					this["item" + i].data = role.weapons.getSlotByInfo(wsconfig.actcond[i]);
				// this.setEff(wsinfo,role);
				// if( this["jobeff"+state] ){
				// 	let eff:string = wsinfo.inside[role.job-1];
				// 	// this["model"+state+jobStr].visible = false;//用于定位特效
				// 	if(!this.mc)
				// 		this.mc = new MovieClip;
				// 	if( !this.mc.parent )
				// 		this["jobeff" + state].addChild(this.mc);
				// 	this.mc.playFile(RES_DIR_EFF + eff,-1);
				// 	this.mc.x = this["model"+state+jobStr].x;
				//
				// 	this.mc.y = this["model"+state+jobStr].y;
				// }

			}
			//未激活剑灵
			else {
				let winfo: WeaponsInfo = role.weapons.getSlotByInfo(wsconfig.actcond[i]);
				// this.setEff(wsinfo,role);
				//部位激活
				if (winfo) {
					isActNum++;
					if (this["lianjiexian" + i])
						this.setLight(this["lianjiexian" + i]);
					if (this["item" + i])
						this["item" + i].data = role.weapons.getSlotByInfo(wsconfig.actcond[i]);
				}
				//部位未激活
				else {
					// if( this.mc )
					// 	this.setGray(this.mc);
					// this.setGray(this.weaponImg);
					// this.setGray(this[jobStr + this.currentState + i ]);
					if (this["lianjiexian" + i])
						this.setGray(this["lianjiexian" + i]);
					if (this["item" + i])
						this["item" + i].data = GlobalConfig.WeaponSoulPosConfig[wsconfig.actcond[i]][0];
					// if( this["model"+state] ){
					// 	let pic:string = wsconfig.pic[role.job-1];
					// 	this["model"+state].visible = true;
					// 	this["model"+state].source = pic;
					// }
				}
				// this[this["model"+state+jobStr]].visible = false;//拆分到界面皮肤去拼

			}
		}

		this.setEff(isActNum, wsconfig.actcond.length, wsconfig, role);

	}

	private setEff(curEf: number, maxEf: number, wsconfig: WeaponSoulConfig, role: Role) {
		if (!wsconfig)
			return;
		let eff: string = wsconfig.inside[role.job - 1];
		if (!this.mc)
			this.mc = new MovieClip;
		if (!this.mc.parent)
			this.effgroup.addChild(this.mc);
		this.mc.playFile(RES_DIR_EFF + eff, -1);
		this.mc.x = this.effpos.x;
		this.mc.y = this.effpos.y;
		this.mc.rotation = this.effpos.rotation;

		// let percent:number = curEf/maxEf;
		// percent = percent<1?percent:1;
		//
		// //不需要蒙版
		// if( percent>=1 ){
		// 	DisplayUtils.removeFromParent(this.masksp);
		// 	return;
		// }
		//
		//
		// if( !this.masksp ){
		// 	this.masksp = new egret.Sprite();
		// 	let square: egret.Shape = new egret.Shape();
		// 	square.graphics.beginFill(0xffff00);
		// 	square.graphics.drawRect(this.weaponImg.x, this.weaponImg.y-37, 111, 437);
		// 	square.graphics.endFill();
		// 	this.masksp.addChild(square);
		// 	this.effgroup.addChild(this.masksp);
		// 	this.mc.mask = this.masksp;
		// }
		//
		//
		//
		// this.masksp.y  = -400 + 400 *percent;

	}
	private setWeaponsModel() {
		this.weaponImg.source = "";
		let role = SubRoles.ins().getSubRoleByIndex(this.roleId);
		let weaponConf: EquipsData = role.getEquipByIndex(0);
		let weaponConfId: number = weaponConf.item.configID;
		if (weaponConfId > 0) {
			this.weaponImg.source = DisplayUtils.getAppearanceByJobSex(
				GlobalConfig.EquipConfig[weaponConfId].appearance, role.job, role.sex
			);
		}
	}
	private onClick(e: egret.Event) {
		for (let i = 0; i < Number(this.currentState); i++) {
			if (e.currentTarget == this["item" + i]) {
				let slot: number = this["item" + i].slot;
				let role = SubRoles.ins().getSubRoleByIndex(this.roleId);
				let winfo: WeaponsInfo = role.weapons.getSlotByInfo(slot);
				//显示激活
				if (!winfo || !winfo.level) {
					ViewManager.ins().open(WeaponSoulBreakWin, WeaponSoulBreakWin.JIHUO, role.index, slot);
				}
				//突破
				else if (winfo.assault) {
					ViewManager.ins().open(WeaponSoulBreakWin, WeaponSoulBreakWin.TUPO, role.index, slot);
				}
				//升级
				else {
					// ViewManager.ins().open(WeaponSoulUplvWin,role.index,slot);
					ViewManager.ins().open(WeaponSoulBreakWin, WeaponSoulBreakWin.SHENGJI, role.index, slot);
				}
				break;
			}
		}
	}
	private getJobSkinName(job: number): string {
		switch (job) {
			case 1:
				return "zhan";
			case 2:
				return "fa";
			case 3:
				return "dao";
		}
		return "";
	}
	public callback() {
		this.init();
	}
	/** 设置图片灰化 */
	public setGray(pic: egret.DisplayObject): void {
		let colorMatrix: number[] = [0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0, 0, 0, 1, 0];
		pic.filters = [new egret.ColorMatrixFilter(colorMatrix)];
	}
	public setLight(pic: egret.DisplayObject): void {
		pic.filters = [];
	}
	public cleanFilters(State: string, i: number) {
		this["zhan" + State + i].filters = [];
		this["fa" + State + i].filters = [];
		this["dao" + State + i].filters = [];
	}

	public destructor(): void {

	}
}