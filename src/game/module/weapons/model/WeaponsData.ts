/**
 * WeaponsData
 */
class WeaponsData {
	private WeaponsInfoData:Map<Map<WeaponsInfo>>;//剑灵部位 索引0没数据
	private WeaponsSoulInfoData:Map<WeaponsSoulInfo>;//剑灵 索引0没数据
	private WeaponsFlexibleInfoData: number[];//兵魂之灵
	public flexibleCount: number;//兵魂之灵使用个数
	/**当前使用剑灵id*/
	public weaponsId:number;


	constructor() {
		//剑灵初始化
		let configIds:string[] = Object.keys(GlobalConfig.WeaponSoulConfig);
		this.WeaponsSoulInfoData = {};
		for( let i = 0;i < configIds.length;i++  ){
			let index:string = configIds[i];
			let info = new WeaponsSoulInfo();
			this.WeaponsSoulInfoData[index] = info;
		}
		//部位初始化
		configIds = Object.keys(GlobalConfig.WeaponSoulPosConfig);
		this.WeaponsInfoData = {};
		for( let i = 0;i < configIds.length;i++  ){
			let index:string = configIds[i];
			if( !this.WeaponsInfoData[index] )
				this.WeaponsInfoData[index] = {};
			// let lvs:string[] = Object.keys(GlobalConfig.WeaponSoulPosConfig[index]);
			// for( let j = 0;j < lvs.length;j++  ){
			// 	let lv:string = lvs[j];
			// 	let info = new WeaponsInfo();
			// 	this.WeaponsInfoData[index][lv] = info;
			// }
		}
		this.WeaponsFlexibleInfoData = [];
		this.weaponsId = 0;
		this.flexibleCount = 0;
	}
	/**
	 * 获取当前剑灵套装等级(取激活后 各个部位最小等级 若有一个部件没激活返回null)
	 * @param 剑灵id
	 * */
	public getSuitConfig(id:number):WeaponSoulSuit{
		let winfos:Map<Map<WeaponsInfo>> = this.getInfoData();
		let minLv:number = 0;
		let everyLv:boolean = false;//判断是否每一件lv都>0 否则该套装未被激活
		// let i = 0;
		let soulConfig:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
		for( let z=0;z < soulConfig.actcond.length;z++ ){//每一个部位
			let slot:number = soulConfig.actcond[z];
			everyLv = true;
			if( !Object.keys(winfos[slot]).length )
				everyLv = false;
			else
				for( let k in winfos[slot] ){//部位一般只有一个等级
					let info:WeaponsInfo = winfos[slot][k];
					if( z == 0 )
						minLv = info.level;
					if( !info.level ){//0级是未激活状态
						everyLv = false;
						break;
					}
					if( info.level <= minLv )
						minLv = info.level;
					// i++
				}
			if( !everyLv )
				break;
		}

		let suitConfig:WeaponSoulSuit;
		if( everyLv ){
			//取最小套装
			let minSuitId:string = "";
			for( let i in GlobalConfig.WeaponSoulSuit[id] ){
				if( minLv >= Number(i) )
					minSuitId = i;
				else
					break;
			}
			if( minSuitId )
				suitConfig = GlobalConfig.WeaponSoulSuit[id][minSuitId];
		}
		return suitConfig;
	}
	/**
	 * 获取下一级剑灵套装等级(满级返回null)
	 * @param 剑灵id
	 * */
	public getNextSuitConfig(id:number):WeaponSoulSuit{
		let curConfig:WeaponSoulSuit = this.getSuitConfig(id);
		let nextConfig:WeaponSoulSuit;
		if( !curConfig )
			curConfig = GlobalConfig.WeaponSoulSuit[id][0];

		for( let i in GlobalConfig.WeaponSoulSuit[id] ){
			if( GlobalConfig.WeaponSoulSuit[id][i].level > curConfig.level ){
				nextConfig = GlobalConfig.WeaponSoulSuit[id][i];
				break;
			}
		}

		return nextConfig;
	}


	/**
	 * 解析下发剑灵数据
	 * 56-0
	 * */
	parser(bytes: GameByteArray){
		this.parserInfo(bytes);
		this.parserSoulInfo(bytes);
		this.parserWeaponFlexibleInfo(bytes);
	}
	/**
	 * 解析下发剑灵具体部位
	 * */
	private parserInfo(bytes: GameByteArray) {
		let len:number = bytes.readShort();
		for( let i=0;i < len;i++ ){
			let id:number = bytes.readShort();
			let level:number = bytes.readInt();
			//清空上一次部位数据 每个部位只允许一个等级数据存在
			this.WeaponsInfoData[id] = {};
			let info = new WeaponsInfo();
			info.setInfo(id,level);
			this.WeaponsInfoData[id][level] = info;
			// let config:WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[id][level];
			// if(config)
				// this.WeaponsInfoData[id] = JSON.parse(JSON.stringify(config));
		}
	}
	/**
	 * 解析下发剑灵
	 * */
	private parserSoulInfo(bytes: GameByteArray) {
		let len:number = bytes.readShort();
		for( let i=0;i < len;i++ ){
			let id:number = bytes.readShort();
			this.WeaponsSoulInfoData[id].setSoulInfo(id);
			// let config:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
			// if(config)
			// 	this.WeaponsSoulInfoData[id] = JSON.parse(JSON.stringify(config));
		}
	}

	/**
	 * 解析下发兵魂之灵
	 * 注:
	 * 吃丹药的时候 如果当前有正在使用的兵魂 这里过来的数据就是1 代表当前正在使用的兵魂用了兵魂之灵 反之是0
	 * 除了登陆外 只有第一次吃丹药的时候会推这条消息
	 * 56-0
	 * */
	private parserWeaponFlexibleInfo(bytes: GameByteArray) {
		let len: number = bytes.readShort();
		for (let i = 0; i < len; i++) {
			let id: number = bytes.readShort();
			this.WeaponsFlexibleInfoData.push(id);
		}
		this.flexibleCount = bytes.readShort();
		if (this.flexibleCount)
			this.flexibleCount++;
	}

	/**
	 * 解析下发 激活/突破/升级 单一剑灵部位
	 * 56-1
	 * */
	public parserInfoOnly(bytes: GameByteArray){
		let id:number = bytes.readShort();
		let level:number = bytes.readInt();
		//清空上一次部位数据 每个部位只允许一个等级数据存在
		this.WeaponsInfoData[id] = {};
		let info = new WeaponsInfo();
		info.setInfo(id,level);
		this.WeaponsInfoData[id][level] = info;
		// let config:WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[id][level];
		// if(config)
		// 	this.WeaponsInfoData[id] = JSON.parse(JSON.stringify(config));
	}

	/**
	 * 解析下发 激活 单一剑灵
	 * 56-2
	 * */
	public parserSoulInfoOnly(bytes: GameByteArray,roleId:number){
		let id:number = bytes.readShort();
		if( id > 0 ){
			this.WeaponsSoulInfoData[id].setSoulInfo(id);
			// let config:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
			// this.WeaponsSoulInfoData[id] = JSON.parse(JSON.stringify(config));
			let role:Role = SubRoles.ins().getSubRoleByIndex(roleId);
			if( role ){
				let eff:string = this.WeaponsSoulInfoData[id].inside[role.job-1];
				if( eff ){
					ViewManager.ins().close(WeaponPanel);
					Activationtongyong.show(0, this.WeaponsSoulInfoData[id].name, `ws_weapon_icon1_png`, ActivationtongyongShareType.None, true,()=>{
						let view:ForgeWin = ViewManager.ins().getView(ForgeWin) as ForgeWin;
						if ( view && view.weaponsoul ){
							ViewManager.ins().open(WeaponPanel,view.weaponsoul.roleId,view.weaponsoul.weaponId);
						}
					},eff,{rotation:30,y:0,x:120});
				}

			}
		}
	}
	/**
	 * 获取角色套装红点
	 * @parma 套装id
	 * **/
	public getRedPointBySuit(id:number):boolean{
		let wsconfig:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
		if( !wsconfig )
			return false;
		//未激活时候检测是否可激活
		if( !this.WeaponsSoulInfoData[id].id && this.IsActivityWeapon(id)){
			return true;
		}

		//获取套装所属部位 是否有一件足够材料 并且不满级
		for( let k in wsconfig.actcond ){
			let slot:number = wsconfig.actcond[k];
			let level:number = this.getInfoLevel(slot);
			//所需材料数
			let wspconfig:WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[slot][level];
			let need:number = wspconfig.costNum;
			let nextwspconfig:WeaponSoulPosConfig = GlobalConfig.WeaponSoulPosConfig[slot][level+1];
			if( !need || !nextwspconfig )continue;//满级
			//背包拥有数
			let itemData:ItemData = UserBag.ins().getBagItemById(wspconfig.costItem);
			let costItemLen:number = itemData?itemData.count:0;
			if( costItemLen >= need )
				return true;
		}

		return this.IsHaveAndNotWear(id);
	}
	/**
	 * 有套装 却未穿戴
	 * @param 检查指定套装是存在 并且身上未穿戴
	 * **/
	public IsHaveAndNotWear(id?:number){
		if( !this.weaponsId ){
			for( let i in this.WeaponsSoulInfoData ){
				let info:WeaponsSoulInfo = this.WeaponsSoulInfoData[i];
				if( id ){
					if( id == info.id )
						return true;
				}else{
					if( info.id )
						return true;
				}

			}
		}
		return false;
	}




	/**
	 * 获取当前角色剑灵部位等级
	 * @param 部位id
	 * */
	public getInfoLevel(id:number):number{
		let level:number = 0;
		if( !this.WeaponsInfoData[id] )return 0;
		for( let j in this.WeaponsInfoData[id] ){
			level = this.WeaponsInfoData[id][j].level;
			break;
		}

		return level;
	}
	/**
	 * 获取当前角色剑灵部位数据
	 * @param 部位id
	 * */
	public getSlotByInfo(id:number):WeaponsInfo{
		let wsinfo:WeaponsInfo;
		if( !this.WeaponsInfoData[id] )
			return wsinfo;

		for( let j in this.WeaponsInfoData[id] ){
			wsinfo = this.WeaponsInfoData[id][j];
			break;
		}
		return wsinfo;
	}

	/**
	 * 获取当前角色剑灵数据
	 * @param 剑灵id
	 * */
	public getWeapsInfoBySoulId(id:number):WeaponsSoulInfo{
		let wsinfo:WeaponsSoulInfo = this.WeaponsSoulInfoData[id];

		return wsinfo;
	}

	/**
	 * 剑灵是否可激活
	 * @param 剑灵id
	 * */
	public IsActivityWeapon(id:number):boolean{
		let wsconfig:WeaponSoulConfig = GlobalConfig.WeaponSoulConfig[id];
		if( wsconfig ){
			for( let i = 0;i < wsconfig.actcond.length;i++ ){
				let slot:number = wsconfig.actcond[i];
				if( !CommonUtils.getObjectLength(this.WeaponsInfoData[slot]) )
					return false;//有一个所需部位没有就不可激活
			}

			return true;
		}
		return false;
	}

	/**获取当前角色剑灵部位数据*/
	public getInfoData():Map<Map<WeaponsInfo>>{
		return this.WeaponsInfoData;
	}
	/**获取当前角色剑灵数据*/
	public getSoulInfoData():Map<WeaponsSoulInfo>{
		return this.WeaponsSoulInfoData;
	}

	/**获取当前角色兵魂之灵数据*/
	public getFlexibleData(): number[] {
		return this.WeaponsFlexibleInfoData;
	}
}
