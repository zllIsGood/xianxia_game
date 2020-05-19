class AttrSkills {

	/** 技能cd */
	public static skillCD: any = {};
	/** 公共CD */
	public static lastTimer: number = 0;

	private static bihuLv = {};


	/**幻兽技能有M%的几率造成致命一击，释放致命一击后恢复友方角色N点生命。
	注：恢复所有角色N点数生命。 */
	public static triggerHuanShouCrit(source: CharMonster): boolean {
		if (source.infoModel.type != EntityType.HuanShouMonster || !AIUtil.triggerAttr(source, AttributeType.atHuanshouCrit))
			return false;
		let value = source.infoModel.getAtt(AttributeType.atHuanshouCritHeal);
		if (value <= 0)
			return false;
		let chRole: CharRole = EntityManager.ins().getEntityByHandle(source.infoModel.masterHandle);
		if (!chRole)
			return false;
		let handle = chRole.infoModel.masterHandle;
		let list = EntityManager.ins().getCharRoleListBymasterhHandle(handle);
		let len: number = list.length;
		for (let i: number = 0; i < len; i++) {
			RoleAI.ins().showHram(false, DamageTypes.BLANK, list[i], source, -value, false);
		}
		return true;
	}
	
	/**幻兽释放技能有N%几率触发连击 */
	public static triggerHuanshouLianJi(source: CharMonster): boolean {
		return (source.infoModel.type == EntityType.HuanShouMonster && AIUtil.triggerAttr(source, AttributeType.atHuanshouDoubleHitRate));
	}

	/**幻兽攻击时有N%几率为己方一个角色叠加buff，增加攻击，最多叠加5层 */
	public static triggerHuanshouAtkBuff(source: CharMonster): void {
		if (source.infoModel.type != EntityType.HuanShouMonster || !AIUtil.triggerAttr(source, AttributeType.atHuanshouAtkBuffRate))
			return;
		let value = source.infoModel.getAtt(AttributeType.atHuanshouAtkBuffValue);
		if (value <= 0)
			return;

		let chRole: CharRole = EntityManager.ins().getEntityByHandle(source.infoModel.masterHandle);
		if (!chRole)
			return;
		let handle = chRole.infoModel.masterHandle;
		let list = EntityManager.ins().getCharRoleListBymasterhHandle(handle);
		let len: number = list.length;
		let index = Math.floor(Math.random() * len);

		chRole = list[index];
		if (!chRole)
			return;
		let effBuff: EntityBuff = chRole.buffList[EffectIds.efHSAtkBuff];
		let overlayCount = effBuff ? effBuff.overlayCount : 0;

		let config = UserSkill.ins().getAISkillEff(EffectIds.efHSAtkBuff);
		overlayCount = overlayCount < config.overlayLimit ? overlayCount + 1 : overlayCount;

		effBuff = ObjectPool.pop('EntityBuff');
		effBuff.effConfig = config;
		effBuff.overlayCount = overlayCount;
		effBuff.value = value * overlayCount;
		effBuff.addTime = egret.getTimer();
		effBuff.endTime = effBuff.addTime + config.duration;
		chRole.addBuff(effBuff);
		chRole.addEffect(EffectIds.efHSAtkBuff);
	}

	private static hsSkillCount = {};
	/**幻兽皮肤技能 -- 幻兽技能伤害提高0.0X% */
	public static triggeratHSDamageEnhance(source: CharMonster, damage: number): number {
		if (source.infoModel.type != EntityType.HuanShouMonster)
			return 0;
		let handle = source.infoModel.masterHandle;
		let count = this.hsSkillCount[handle];
		let tempCount = source.infoModel.getAtt(AttributeType.atHuanShouSkillCount);
		if (!count || count < tempCount) {
			this.hsSkillCount[handle] = count > 0 ? count + 1 : 1;
			return 0;
		}
		this.hsSkillCount[handle] = 0;
		let value = source.infoModel.getAtt(AttributeType.atHuanShouSkillDamageEnhance);

		return Math.floor(damage * value / 10000);
	}
}