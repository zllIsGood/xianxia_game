class JadeNew extends BaseSystem{
	
	/** 玉佩数据 */
	public jadeData:JadeDataNew[];
	
	public constructor() {
		super();

		this.jadeData = [];
		this.sysId = PackageID.JadeNew;
		this.regNetMsg(1, this.postJadeData);
		
	}

	public static ins(): JadeNew {
		return super.ins() as JadeNew;
	}

	/** 玉佩数据
	 * 70-1
	 * @return 当前roleID
	 */
	public postJadeData(bytes:GameByteArray):number
	{
		let roleID:number = bytes.readShort();
		let jade:JadeDataNew = this.jadeData[roleID];
		if (!jade)
		{
			jade = new JadeDataNew();
			this.jadeData[roleID] = jade;
		}

		jade.parser(bytes);
		return roleID;
	}

	/** 使用提升丹
	 * 70-2
	 * @param roleID 角色ID
	 * @param itemID 道具ID
	 */
	public sendUseDan(roleID:number, itemID:number):void
	{
		let bytes:GameByteArray = this.getBytes(2);
		bytes.writeShort(roleID);
		bytes.writeInt(itemID);
		this.sendToServer(bytes);
	}

	/** 升级
	 * 70-3
	 * @param roleID 角色ID
	 * @param itemID 道具ID
	 */
	public sendUpgrade(roleID:number, itemID:number):void
	{
		let bytes:GameByteArray = this.getBytes(3);
		bytes.writeShort(roleID);
		bytes.writeInt(itemID);
		this.sendToServer(bytes);
	}

	/** 根据角色ID获得 */
	public getJadeDataByID(roleID:number):JadeDataNew
	{
		if (!this.jadeData || !this.jadeData.length)
			return null;

		return this.jadeData[roleID];
	}

	/** 玉佩是否达到最大等级 */
	public isJadeMax(roleID:number):boolean
	{
		let jadeData:JadeDataNew = this.getJadeDataByID(roleID); 
		if (!jadeData)
			return false;
		
		return jadeData.lv >= Object.keys(GlobalConfig.JadePlateLevelConfig).length - 1;
	}

	/** 是否显示红点 */
	public checkRed():boolean
	{
		for (let i:number = 0; i < 3; i++)
		{
			if (this.checkRedByRoleID(i))
				return true;
		}

		return false;
	}

	/** 新玉佩是否开启 */
	public checkOpen():boolean
	{
		if (Actor.level < GlobalConfig.JadePlateBaseConfig.openlv)
			return false;

		if (GameServer.serverOpenDay < GlobalConfig.JadePlateBaseConfig.openDay - 1)
			return false;

		return true;
	}

	/** 根据roleID是否显示红点
	 * @param
	 */
	public checkRedByRoleID(roleID:number):boolean
	{
		if (!this.checkOpen())
			return false;

		if (!SubRoles.ins().getSubRoleByIndex(roleID))
			return false;

		let jadeData:JadeDataNew = this.getJadeDataByID(roleID);
		if (!jadeData)
			return false;

		let level:number = jadeData.lv;
		let itemData: ItemData;
		let addExp:number = 0;

		let checkJade = () => {
			//蕴养丹
			let lvCfg:JadePlateLevelConfig;
			let phase:number = Math.floor(level / GlobalConfig.JadePlateBaseConfig.perLevel) + 1;
			let used:number = 0, count:number = 0, curMax:number = 0;
			for (let key in GlobalConfig.JadePlateBaseConfig.upgradeInfo)
			{
				itemData = UserBag.ins().getBagItemById(+key);
				count = itemData ? itemData.count : 0;
				used = jadeData.danDate && jadeData.danDate[key] ? (+jadeData.danDate[key]) : 0;
				lvCfg = GlobalConfig.JadePlateLevelConfig[(phase - 1) * GlobalConfig.JadePlateBaseConfig.perLevel];
				curMax = lvCfg.upgradeItemInfo && lvCfg.upgradeItemInfo[key] ? (+lvCfg.upgradeItemInfo[key]) : 0;
				if (used < curMax && count)
					return true;
			}
			return false;
		}

		if (this.isJadeMax(roleID)) {
			return checkJade();
		}
			
		
		// let level:number = jadeData.lv;
		// let itemData: ItemData;
		// let addExp:number = 0;
		for (let key in GlobalConfig.JadePlateBaseConfig.itemInfo)
		{
			itemData = UserBag.ins().getBagItemById(+key);
			addExp += ((+GlobalConfig.JadePlateBaseConfig.itemInfo[key]) * (itemData ? itemData.count : 0));
		}

		if ((addExp + jadeData.exp) >= GlobalConfig.JadePlateLevelConfig[level].exp)
			return true;

		return checkJade();
	}

	/** 根据玉佩等级已开启技能 
	 * @param 玉佩等级
	 * @return number[] 有技能返回技能列表，没有则为null
	*/
	public getSkillsByLv(lv:number):number[]
	{
		//阶
		let phase:number = Math.floor(lv / GlobalConfig.JadePlateBaseConfig.perLevel) + 1;
		//技能
		let cfg:JadePlateLevelConfig = GlobalConfig.JadePlateLevelConfig[(phase - 1) * GlobalConfig.JadePlateBaseConfig.perLevel];
		let skillLen:number = cfg.skillIdList ? cfg.skillIdList.length : 0;
		if (skillLen <= 0)
			return null;
		
		let len:number = GlobalConfig.JadePlateBaseConfig.skillUnlock.length;
		let skillList:number[] = [];
		let skillID:number;
		for (let i:number = 0; i < len; i++)
		{	
			for (let j:number = 0; j < skillLen; j++)
			{
				skillID = cfg.skillIdList[j];
				if (skillID == GlobalConfig.JadePlateBaseConfig.skillUnlock[i].id && skillID > 100)
					skillList.push(skillID);
			}
		}

		return skillList.length ? skillList : null;
	}
}
namespace GameSystem {
	export let jadeNew = JadeNew.ins.bind(JadeNew);
}