/**
 * Created by Peach.T on 2018/1/5.
 */
class ExtremeEquipModel extends BaseClass {

	public selectJob: number = 0;

	public static ins(): ExtremeEquipModel {
		return super.ins() as ExtremeEquipModel;
	}

	public get descNames(): string[] {
		return ["至尊神剑","至尊头盔" ,"至尊神甲", "至尊项链",  "至尊手镯", "至尊腰带", "至尊戒指", "至尊鞋子"];
	}

	public get positions(): number[] {
		return [EquipPos.WEAPON, EquipPos.CLOTHES, EquipPos.Wrist, EquipPos.RING, EquipPos.SHOE, EquipPos.BRACELET, EquipPos.NECKLACE, EquipPos.HEAD];
	}

	public getZhiZunLv(job: number, subType: number): number {
		let role = SubRoles.ins().getSubRoleByJob(job);
		let data: EquipsData = role.getEquipByIndex(subType);
		let id = data.item.configID;
		if (id) {
			return data.soulLv;
		}
		return 0;
	}
	//查看至尊装备等级
	public getZhiZunLvByRoleID(role: Role, subType: number): number {
		if (!role || subType > EquipPos.SHOE)
			return 0;

		let data: EquipsData = role.getEquipByIndex(subType);
		let id = data.item.configID;
		if (id) {
			return data.soulLv;
		}
		return 0;
	}

	public isWear(job: number, subType: number): boolean {
		let role = SubRoles.ins().getSubRoleByJob(job);
		let data: EquipsData = role.getEquipByIndex(subType);
		let id = data.item.configID;
		if (id) {
			return true;
		}
		return false;
	}

	/**
	 * 判断职业部位装备，能否激活或者升级
	 * @param job
	 * @param subType
	 */
	public canOperate(job: number, subType: number): boolean {
		let role = SubRoles.ins().getSubRoleByJob(job);
		let data: EquipsData = role.getEquipByIndex(subType);
		let id = data.item.configID;
		if (id) {
			let lv = data.soulLv;
			if (lv < this.getMaxZhiZunEquipLevel(ItemConfig.getSubType(data.item.itemConfig))) {
				let cfg = GlobalConfig.ZhiZunEquipLevel[subType][lv+1];
				let need = cfg.materialInfo.count;
				let count = UserBag.ins().getItemCountById(0, cfg.materialInfo.id);
				return count >= need;
			}
		}
		return false;
	}

	public getRedPointByJob(job: number): boolean {
		for (let i = EquipPos.WEAPON; i <= EquipPos.SHOE; i++) {
			if (this.canOperate(job, i))return true;
		}
		return false;
	}

	public getRedPoint(): boolean {
		let len = SubRoles.ins().subRolesLen;
		for (let i = 0; i < len; i++) {
			let role = SubRoles.ins().getSubRoleByIndex(i);
			let job = role.job;
			if (this.getRedPointByJob(job))return true;
		}
		return false;
	}

	public getMaxZhiZunEquipLevel(subType:number): number {
		let count: number = CommonUtils.getObjectLength(GlobalConfig.ZhiZunEquipLevel[subType]);
		// for (let i in GlobalConfig.ZhiZunEquipLevel) {
		// 	for (let j in GlobalConfig.ZhiZunEquipLevel[i]) {
		// 		count++;
		// 	}
		// 	return count;
		// }
		return count;
	}

	public getZhiZunSkills(role:Role):SkillData[] {
		let equipPos = [EquipPos.WEAPON, EquipPos.CLOTHES];
		let skills = [];
		for (let pos of equipPos) {
			let data = role.getEquipByIndex(pos);
			if (data.item.configID) {
				let lv = data.soulLv;
				if(lv > 0){
					let cfg = GlobalConfig.ZhiZunEquipLevel[pos][lv];
					if(cfg.skillId) {
						skills.push(new SkillData(cfg.skillId));
					}
				}
			}
		}
		return skills;
	}

	public getZhiZunSkill(job: number, subType: number): number {
		let role = SubRoles.ins().getSubRoleByJob(job);
		let data: EquipsData = role.getEquipByIndex(subType);
		let id = data.item.configID;
		if (id) {
			let lv = data.soulLv;
			if (lv > 0) {
				let cfg = GlobalConfig.ZhiZunEquipLevel[subType][lv];
				return cfg.skillId;
			}
		}
		return 0;
	}

	/**
	 * 获取灵魂锁链等级
	 * @param roleIndex
	 * @param mainPos
	 * @param soullv
	 */
	public getZhiZunLinkLv(roleIndex: number, mainPos: number, soullv: number): number {
		let secPos = this.getLinkEquipPos(mainPos);
		let role = SubRoles.ins().getSubRoleByIndex(roleIndex - 1);
		if (Assert(role, `函数getZhiZunLinkLv， roleIndex:${roleIndex},mainPos:${mainPos},soullv:${soullv}`))
			return 0;
		let mainEquip: EquipsData = role.getEquipByIndex(mainPos);
		let secEquip: EquipsData = role.getEquipByIndex(secPos);
		if (mainEquip && secEquip) {
			return Math.min(soullv, secEquip.soulLv);
		}

		return 0;
	}
	/**
	 * 获取灵魂锁链展示等级
	 * 无需关注另外部位是否开启情况 只挂钩当前装备的至尊装备等级 只用于展示
	 * @param roleIndex
	 * @param mainPos
	 * @param soullv
	 */
	public getZhiZunLinkLvShow(roleIndex: number, mainPos: number, soullv: number): number {
		let role = SubRoles.ins().getSubRoleByIndex(roleIndex);
		let mainEquip: EquipsData = role.getEquipByIndex(mainPos);
		if (mainEquip && soullv) {
			let config:ZhiZunEquipLevel = GlobalConfig.ZhiZunEquipLevel[mainPos][soullv];
			return config.soulLinkLevel;
		}

		return 1;//未激活展示1
	}


	public getLinkEquipPos(mainPos: number): number {
		for (let i in GlobalConfig.ZhiZunLinkLevel) {
			if (i == mainPos.toString()) {
				for (let j in GlobalConfig.ZhiZunLinkLevel[i]) {
					return +(j);
				}
			}
		}
		return null;
	}
	/**获取主界面展示配置ZhiZunLinkLevel*/
	public getZhiZunLinkLevelConfig(pos:number,roleJob:number,next?:boolean):ZhiZunLinkLevel{
		let subType = pos;//position数据
		let job = roleJob;
		let zhiZunLv = ExtremeEquipModel.ins().getZhiZunLv(job, subType);
		if( !zhiZunLv )
			zhiZunLv = 1;
		// level = ExtremeEquipModel.ins().getZhiZunLinkLvShow(this.curRole,subType,zhiZunLv);
		let secPos = ExtremeEquipModel.ins().getLinkEquipPos(subType);
		if( next )
			zhiZunLv += 1;
		let linkconfig:ZhiZunLinkLevel = GlobalConfig.ZhiZunLinkLevel[subType][secPos][zhiZunLv];
		return linkconfig;
	}
	/**获取主界面展示配置ZhiZunEquipLevel*/
	public getZhiZunEquipLevelConfig(pos:number,level:number,next?:boolean):ZhiZunEquipLevel{
		let subType = pos;
		let zhiZunLv = level;
		if( !zhiZunLv )
			zhiZunLv = 1;
		if( next )
			zhiZunLv += 1;
		let config:ZhiZunEquipLevel =GlobalConfig.ZhiZunEquipLevel[subType][zhiZunLv];
		return config;
	}

	/**获取部位的技能名描述*/
	public getSkillName(pos:number):string{
		let zzel:ZhiZunEquipLevel = GlobalConfig.ZhiZunEquipLevel[pos][1];
		if( !zzel )return "";
		let skillconfig:SkillsConfig = GlobalConfig.SkillsConfig[zzel.skillId];
		if( !skillconfig )return "";
		let sdconfig:SkillsDescConfig = GlobalConfig.SkillsDescConfig[skillconfig.desc];
		if( !sdconfig )return "";
		return sdconfig.name;
	}
	/**获取部位的技能描述*/
	public getSkillDesc(pos:number):string{
		let zzel:ZhiZunEquipLevel = GlobalConfig.ZhiZunEquipLevel[pos][1];
		if( !zzel )return "";
		let skillconfig:SkillsConfig = GlobalConfig.SkillsConfig[zzel.skillId];
		if( !skillconfig )return "";
		let sdconfig:SkillsDescConfig = GlobalConfig.SkillsDescConfig[skillconfig.desc];
		if( !sdconfig )return "";
		let desc = sdconfig.desc;
		desc = desc.replace("%s%", skillconfig.desc_ex[0] + "");
		return desc;
	}

}
