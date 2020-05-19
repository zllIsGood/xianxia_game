/**子角色数据管理器 */
class SubRoles extends BaseSystem {

	public roles: Role[] = [];

	public jobDic: Role[] = [];

	static MAX_ROLES: number = 3;

	public static ins(): SubRoles {
		return super.ins() as SubRoles;
	}

	public constructor() {
		super();
		this.observe(Guild.ins().postQuitGuild, this.setGuildName);
		this.observe(Guild.ins().postGuildInfo, this.setGuildName);
		this.observe(LiLian.ins().postLilianData, this.updateName);
	}


	public init(): void {
		this.roles = [];
		this.jobDic = [];
	}

	/**
	 * 子角色列表
	 * 0-2
	 * @param bytes
	 */
	public doSubRole(bytes: GameByteArray): void {
		this.init();
		let count: number = bytes.readShort();
		let roleLen: number = SubRoles.ins().subRolesLen;
		for (let i = 0; i < count; i++) {
			let model: Role = this.roles[i];
			if (!model)
				model = new Role();
			model.parser(bytes);
			model.updateFlySword();
			if (!this.roles[i]) {
				this.roles.push(model);
			}

			if (!this.jobDic[model.job]) {
				this.jobDic[model.job] = model;
			}
		}
		if (roleLen && roleLen < this.roles.length)
			UserTips.ins().showTips(`成功开启新角色`);
	}
	// /**
	//  * 子角色数据array[3]
	//  * 0-2
	//  * @param bytes
	//  */
	// public doSubHeirloomRole(bytes: GameByteArray): void {
	// 	let title:number = bytes.readInt();//当前称号
	// 	//RoleData
	// 	bytes.read
	// }

	/**
	 * 处理属性变化
	 * 0-8
	 * @param bytes
	 */
	public doSubRoleAtt(bytes: GameByteArray): void {
		let roleID: number = bytes.readInt();
		let power: number = 0;
		let len: number = this.roles.length;
		for (let i = 0; i < len; i++) {
			let model: Role = this.getSubRoleByIndex(i);
			if (model.index == roleID) {
				model.parserAtt(bytes, true);
				model.power = bytes.readDouble();
			}
			power += model.power;
		}
		Actor.ins().postPowerChange(power);
		//处理神兵提示:屏蔽绿色字提示
		//原因:60-5升级神兵时候 服务器会根据N个角色同步N次0-8消息过来 因此提示了N次N角色信息
		if( GodWeaponCC.ins().gwshowTips ){
			if( GodWeaponCC.ins().roleshowTips )
				GodWeaponCC.ins().roleshowTips--;
			if( GodWeaponCC.ins().roleshowTips <= 0 ){
				GodWeaponCC.ins().roleshowTips = 0;
				GodWeaponCC.ins().gwshowTips = false;
			}
		}
	}

	/**
	 * 处理扩张属性变化
	 * 0-27
	 * @param bytes
	 */
	public doSubRoleExtAtt(bytes: GameByteArray): void {
		let roleID: number = bytes.readInt();
		let len: number = this.roles.length;
		for (let i = 0; i < len; i++) {
			let model: Role = this.getSubRoleByIndex(i);
			if (model.index == roleID) {
				model.parserExtAtt(bytes, true);
			}
		}
	}

	public getSubRoleByIndex(index: number): Role {
		return this.roles[index];
	}

	public getSubRoleByJob(jobId: number): Role {
		let len: number = this.roles.length;
		for (let i = 0; i < len; i++) {
			let model: Role = this.getSubRoleByIndex(i);
			if (model.job == jobId) {
				return this.roles[i];
			}
		}
		return null;
	}

	public get subRolesLen(): number {
		return this.roles.length;
	}

	public resetRolesModel(): void {
		this.roles.length = 0;
	}

	/**
	 * 更新所有角色的名字
	 */
	private updateName(): void {
		let len: number = this.subRolesLen;
		for (let i: number = 0; i < len; i++) {
			let entity = EntityManager.ins().getMainRole(i);
			if (entity) {
				let model: Role = this.getSubRoleByIndex(i);
				entity.setCharName(model.guildAndName);
				entity.setLilian(model.lilianUrl);
			}
		}
	}

	private setGuildName(arr: [number, string]): void {
		let [id, name] = arr;
		let len: number = this.subRolesLen;
		for (let i: number = 0; i < len; i++) {
			this.roles[i].guildName = name;
			this.roles[i].guildID = id;
		}
		this.updateName();
	}

	/**是否是自己的子角色 */
	public getIsMyPlayer(han: number): boolean {
		for (var k in this.roles) {
			if (this.roles[k].handle == han) {
				return true;
			}
		}
		return false;
	}
	/***
	 * 是否有可解锁英雄
	 */
	public isLockRole(){
		let len = 3;//SubRoles.ins().subRolesLen;
		for( let i = 0;i < len;i++ ){
			let role: Role = SubRoles.ins().getSubRoleByIndex(i);
			if( !role ){
				let config: NewRoleConfig = GlobalConfig.NewRoleConfig[i];
				if( !config )
					continue;
				if (config.zsLevel) {
					if (UserZs.ins().lv >= config.zsLevel) {
						return true;
					}
				}else{
					if (Actor.level >= config.level) {
						return true;
					}
				}
				if (config.vip && UserVip.ins().lv >= config.vip) {
					return true;
				}
			}
		}
		return false;
	}
}