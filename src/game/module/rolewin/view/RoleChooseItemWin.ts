class RoleChooseItemWin extends BaseEuiView{
	public bgClose:eui.Rect;
	public gift:eui.List;
	public get:eui.Button;
	public closeBtn0:eui.Button;

	private id:number;//人物id

	private desc:string;
	private callback:Function;
	private roleMovie: MovieClip[];
	public roles: eui.ToggleButton[];
	public role1: eui.ToggleButton;
	public role2: eui.ToggleButton;
	public role3: eui.ToggleButton;
	private material:ItemBase;
	private btntupo:eui.Button;
	private curUse:eui.Label;
	private nextUse:eui.Label;
	public constructor() {
		super();
		this.initMc();
		this.skinName = "weaponSoulUse";
	}

	public open(...args:any[]):void
	{
		this.id = args[0];
		this.addTouchEvent(this, this.onClick);
		this.addTouchEvent(this.btntupo,this.onTouch);
		this.addTouchEvent(this.bgClose,this.onTouch);
		this.observe(Weapons.ins().postWeaponsFlexibleCount, this.otherClose);
		// this.observe(GameLogic.ins().postSubRoleChange, this.updateRole);
		// this.observe(Actor.ins().postLevelChange, this.updateRole);
		// this.observe(UserVip.ins().postUpdateVipData, this.updateRole);
		// this.observe(UserZs.ins().postZsData, this.updateRole);
		this.init();
		this.setCurRole(this.id);
	}
	public init(): void {
		this.roles = [this.role1, this.role2, this.role3];
		for (let i = 0; i < 2; i++) {
			let mc = this.roleMovie[i];
			this.roles[i + 1].addChild(mc);
		}
		this.updateRole();
		this.updateSelect(this.id);
	}
	public getCurRole(): number {
		return this.id;
	}
	public setCurRole(value: number) {
		this.id = value;
		for (let i = 0; i < this.roles.length; i++) {
			let element: eui.ToggleButton = this.roles[i];
			element.selected = i == value;
		}
		this.dispatchEventWith(egret.Event.CHANGE, false, this.id);
	}
	private initMc(){
		this.roleMovie = [];
		for (let i = 0; i < 2; i++) {
			let mc: MovieClip = new MovieClip;
			mc.x = 44;
			mc.y = 44;
			mc.touchEnabled = false;
			this.roleMovie.push(mc);
		}
	}
	private onTouch(e: egret.TouchEvent):void{
		switch (e.currentTarget){
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.btntupo:
				let role:Role = SubRoles.ins().getSubRoleByIndex(this.id);
				if( !role ){
					UserTips.ins().showTips(`角色数据异常`);
					return;
				}
				if( role.weapons.flexibleCount-1 >= GlobalConfig.WeaponSoulBaseConfig.maxItemNum ){
					UserTips.ins().showTips(`每角色兵魂之灵最大使用上限为${GlobalConfig.WeaponSoulBaseConfig.maxItemNum}`);
					return;
				}
				Weapons.ins().sendWeaponsFlexibleCount(this.id);
				break;
		}

	}

	private onClick(e: egret.TouchEvent): void {
		let index: number = this.roles.indexOf(e.target);
		if (index > -1)
			this.changeRole(index);
	}

	private changeRole(value: number): void {
		let model: Role = SubRoles.ins().getSubRoleByIndex(value);
		if (model) {
			this.setCurRole(value);
			this.updateSelect(value);
		} else {
			ViewManager.ins().open(NewRoleWin);
			this.roles[value].selected = false;
			ViewManager.ins().close(this);
		}
	}

	private updateSelect(roleId:number){
		for( let i = 1; i <= 3;i++ ){
			if( (roleId+1) == i ){
				this[`selectrole${i}`].visible = true;
			}else{
				this[`selectrole${i}`].visible = false;
			}
		}
		let role:Role = SubRoles.ins().getSubRoleByIndex(roleId);
		//UI
		this.btntupo.visible = role.weapons.flexibleCount-1 < GlobalConfig.WeaponSoulBaseConfig.maxItemNum;
		let index = role.weapons.flexibleCount;
		index = index?(index-1):1;//当前数据 有值:实际使用次数 无值:1
		index = index >= GlobalConfig.WeaponSoulBaseConfig.maxItemNum?GlobalConfig.WeaponSoulBaseConfig.maxItemNum:index;
		let config:WeaponSoulItemAttr = GlobalConfig.WeaponSoulItemAttr[index];
		let nindex =  role.weapons.flexibleCount?index+1:index;
		let nextconfig:WeaponSoulItemAttr = GlobalConfig.WeaponSoulItemAttr[nindex];
		let curCount = role.weapons.flexibleCount?index:0;
		curCount = curCount>= GlobalConfig.WeaponSoulBaseConfig.maxItemNum?GlobalConfig.WeaponSoulBaseConfig.maxItemNum:curCount;
		this.curUse.text = curCount + "";
		this.nextUse.visible = true;
		for( let i = 0; i < 4; i++ ){
			this[`name${i}`].text = AttributeData.getAttrStrByType(config.attr[i].type);//属性名
			this[`tpattr${i}`].text =  role.weapons.flexibleCount?config.attr[i].value:0;
			if( nextconfig ){
				this.nextUse.text = nindex + "";
				this[`ntpattr${i}`].visible = this[`dir${i}`].visible = true;
				this[`ntpattr${i}`].text = nextconfig.attr[i].value;
			}else{
				this[`ntpattr${i}`].visible = this[`dir${i}`].visible = false;
				this.nextUse.visible = false;
			}
		}
		this[`dir`].visible = this.nextUse.visible;

		this.material.data = GlobalConfig.WeaponSoulBaseConfig.itemid;

	}

	public close(...args:any[]):void{

	}

	public updateRole(): void {
		let role: eui.ToggleButton;
		let roleData: Role;
		let len: number = this.roles.length;
		for (let i = 0; i < len; i++) {
			role = this.roles[i];
			roleData = SubRoles.ins().getSubRoleByIndex(i);
			if (roleData) {
				role['jobImg'].visible = true;
				role['jobImg'].source = `common1_profession${roleData.job}`;
				role['stageImg'].visible = false;
				role['stageImg'].source = "";
				role.icon = `main_role_head${roleData.job}`;
				if (this.roleMovie[i - 1])
					DisplayUtils.removeFromParent(this.roleMovie[i - 1]);
			}
			else {
				let config: NewRoleConfig = GlobalConfig.NewRoleConfig[i];
				if(!config){
					let parName = egret.getQualifiedClassName(this.parent);
					Assert(false, `角色索引${i}不存在，出错类：${parName}`);
					continue;
				}
				role['jobImg'].visible = false;
				role['stageImg'].visible = true;
				if (config.zsLevel) {
					if (UserZs.ins().lv < config.zsLevel) {
						role['stageImg'].source = config.zsLevel == 1?`common1_word_80`:`common1_word_4zhuan`;
					}
					else {
						role['stageImg'].source = "common1_word_kejiesuo";
					}
				}
				else {
					if (Actor.level < config.level) {
						role['stageImg'].source = `toujiesuo${config.level}`;
					}

					else {
						role['stageImg'].source = "common1_word_kejiesuo";
					}
				}
				if (config.vip && UserVip.ins().lv >= config.vip) {
					role['stageImg'].source = "common1_word_kejiesuo";
				}
				role.icon = "";
			}
			if (this.roleMovie[i - 1] && role['stageImg'].source == "common1_word_kejiesuo" && role['stageImg'].visible) {
				this.roleMovie[i - 1].playFile(RES_DIR_EFF + 'juesejiesuo', -1);
				this.showRedPoint(i,true);
			}
		}
	}

	showRedPoint(index: number, b: boolean) {
		if (this.roles == null) return;

		this.roles[index]['redPoint'].visible = b;
	}

	private otherClose():void
	{
		ViewManager.ins().close(this);
	}


}

ViewManager.ins().reg(RoleChooseItemWin, LayerManager.UI_Popup);