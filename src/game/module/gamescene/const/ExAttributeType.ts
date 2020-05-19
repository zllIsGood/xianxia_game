/**
 * Created by Administrator on 2016/8/15.
 */
enum ExAttributeType {
	eatReflectProbability = 0,	// 0,反伤概率
	eatReflectRate, // 1,反伤比率
	eatIgnoreReflect, // 2,无视反伤
	eatGodBlessProbability, // 3,神佑触发 概率
	eatGodBlessRate, // 4,神佑复活万分比
	eatDeathCurseProbability, // 5,死咒触发概率
	eatDeathCurseDamageIncrease, //6,死咒增加伤害万份比
	eatDeathCurseTime,		//7.死咒效果展示时间
	eatAllCrit,		// 8.攻击会触发暴击的概率，0-10000
	eatAllCritTime,	// 9.AllCrit暴击触发后，持续的时间, 单位:秒
	eatBeHitTimesDodge,//10.受到X次攻击时必定闪避
	eatAttackTimesCrit,//11.攻击X次必定产生暴击（暴击）
	eatAttackAddHpProbability,//12.治疗戒指,攻击时候补血的概率
	eatAttackAddHpValue,//13.治疗戒指,攻击的时候补血数
	eatAddToWarriorDamageInc,//14.增加对战士的伤害万份比
	eatAddToMageDamageInc,//15.增加对法师的伤害万份比
	eatAddToTaoistDamageInc,//16.增加对术士的伤害万份比
	eatSubWarriorDamageInc,//17.减少战士受到的伤害万份比
	eatSubMageDamageInc,//18.减少法师受到的伤害万份比
	eatSubTaoistDamageInc,//19.减少术士受到的伤害万份比
	eatTogetherHitFree,//20.减少必杀受到的伤害万份比
	eatTogetherHitMonDamageInc,//21.必杀装备在必杀技能的时候对怪物的伤害万份比
	eatTogetherHitRoleDamageInc,//22.必杀装备在必杀技能的时候对玩家的伤害万分比
	eatTogetherHitCdSub,//23.必杀装备齐鸣效果减少必杀技能CD时间(万份比)
	eatAdditionalHarm,//24伤害增加固定值
	eatReductionHarm,//25伤害减免固定值
	eatMiss,//26闪避概率万分比
	eatBaseSkillExArg,// 27基础及能额外系数加成百分比
	eatMultipleCrit,//28多重暴击几率万分比
	eatMultipleCritCoeff,// 29幸运一击的伤害加深比率(万分比)
	atMultipleCritHurt,//30幸运一击的伤害加深固定值
	eatAddWarriorDamageInc,//31.增加战士的伤害万份比
	eatAddMageDamageInc,//32.增加法师的伤害万份比
	eatAddTaoistDamageInc,//33.增加术士的伤害万份比
	eatMultipleCritTime, //34.幸运一击的冷却时间
	eatAttackAddHpTime, //35治疗戒指,攻击的时候补血的冷却时间
	eatStunTime,	//36.晕眩冷却时间
	eatGodPowerCd,//37.神之力触发CD(冷却时间)
	eatGodPowerProbability, // 38,神之力触发概率
	eatGodPowerDamageIncrease, //39,神之力增加伤害万份比
	eatHpLtAddBuffId = 40,   //40.生命低于(万分比例)时,触发生命恢复buff(剑灵5)
	eatHpLtAddBuffCd = 41, //41.生命低于(万分比例)时,触发生命恢复buff CD
	eatHit = 42, //42.命中率万分比
	eatSkillVamirePro, //43.吸血万分比，针对特定技能
	eatWarriorPeakDamageInc,//44.战士神兵巅峰伤害万份比
	eatMagePeakDamageInc,//45.法师神兵巅峰伤害万份比
	eatTaoistPeakDamageInc,//46.术士神兵巅峰伤害万份比
	eatPetSkillLevel,//47.宠物专用技能等级
	eatPetAttackInc,//48.术士宠物攻击力加成万分比
	eatCount,
	eatCritHpLt, //54.产生暴击时生命低于(万分比例)暴击伤害提升(新玉佩)
	eatCritHpLtAddDamage, //55.产生暴击时生命低于(万分比例)暴击伤害提升率(新玉佩)
	eatMiJiZHDamPer,//59.追魂秘籍伤害百分比
	eatMiJiZHTime,//60.追魂秘籍冷却时间
}