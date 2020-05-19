/**
 *
 * @author
 *
 */
enum enPropEntity {
	P_ID = 0,   // 实体的id
	P_POS_X, // 位置 posx
	P_POS_Y, // 位置pos y
	P_MODELID, // 实体的模型ID
	P_ICON,  // 头像ID
	P_DIR,   // 实体的朝向
	P_MAX_ENTITY,
}

enum enPropAnimal {
	P_LEVEL = enPropEntity.P_MAX_ENTITY, // 等级
	P_HP, //血
	P_MP,  //蓝
	P_SPEED, //移动1格需要的时间，单位ms
	P_MAXHP, //最大血，也就是生命
	P_MAXMP,//最大蓝，也就是内力
	P_OUT_ATTACK, //外功攻击
	P_OUT_DEFENCE,//外功防御
	P_DEFCRITICALSTRIKES,//抗爆击值
	P_ALL_ATTACK, // 所有攻击力
	P_SUB_DEF, // 无视防御
	P_IN_ATTACK,//内功攻击
	P_IN_DEFENCE,//内功防御

	P_CRITICALSTRIKES,	// 爆击值
	P_DODGERATE, // 闪避值
	P_HITRATE,	// 命中值

	P_ATTACK_ADD,	// 伤害追加
	P_HP_RENEW,//HP恢复
	P_MP_RENEW,//MP恢复
	P_ATTACK_SPEED, //攻击速度

	P_IN_ATTACK_DAMAGE_ADD, // 承受内功伤害的数值提高
	P_OUT_ATTACK_DAMAGE_ADD,	// 承受外功伤害的数值提高
	P_THUNDER_ATTACK,	//雷攻
	P_THUNDER_DEFENCE,	//雷抗
	P_POISON_ATTACK,	//毒攻
	P_POISON_DEFENCE,	//毒抗
	P_ICE_ATTACK,		//冰攻
	P_ICE_DEFENCE,		//冰抗
	P_FIRE_ATTACK,		//火攻
	P_FIRE_DEFENCE,		//火抗
	P_STATE, //生物的状态,死亡，打坐等等

	P_BASE_MAXHP, //基础的最大血,等级带来的MaxHp,不包括buff，装备等附加的
	P_BASE_MAXMP, //基础的最大蓝,等级带来的MaxMp,不包括buff，装备等附加的

	P_STAND_POINT,	//立场，立场不为0且不相等的可以互相攻击

	P_MAX_ANIMAL,		//
}


enum enPropActor {
	P_WEAPON = enPropAnimal.P_MAX_ANIMAL,   //武器的外观属性
	P_MOUNT,	  //坐骑的外观属性
	P_DIZZY_RATE11,		 // 低2为攻击打出晕眩的几率,高2位是烦晕眩几率(取消
	P_DIZZY_TIME1,		// 攻击打出晕眩的时间（取消）
	P_HP_STORE,		//hp存量
	P_MP_STORE,		  //宠物的hp存量(旧:mp存量)
	P_SPIRIT,				 //精灵样式
	P_PK_MOD,   //玩家的PK模式
	P_STRONG_EFFECT, //强化特效
	P_WING, // 翅膀特效
	P_STAGE_EFFECT, //品质特效

	P_PET_HP_STORE,	 // 宠物药包
	PROP_ACTOR_XIUWEI_RENEW_RATE, //玩家的修为的恢复速度(取消）

	P_SEX, //性别
	P_VOCATION, //职业
	P_EXP, //经验值 number
	P_PK_VALUE = P_EXP + 2, //玩家的pk值(杀戮值)（已无用）
	P_BAG_GRID, //背包的格子数量
	P_WEEK_CHARM,  // 周魅力值
	P_BIND_COIN, //绑定金钱
	P_COIN, //非绑定金钱
	P_BIND_YB, //绑定元宝
	P_YB, //非绑定元宝
	P_SHENGWANG,  //玩家的声望
	P_CHARM, //魅力值，男的叫帅气值，女的叫魅力值
	P_SPIRIT_SLOT, //宝物开通的槽位的数目(貌似没用）
	P_RENOWN, //历练
	P_GUILD_ID, //帮派的ID
	P_TEAM_ID, //队伍的ID
	P_SOCIAL,// 社会关系的mask，是一些bit位合用的
	P_GUILD_EXP, //帮会贡献度
	P_LUCKY, //幸运值
	P_SYS_OPEN, // 开启系统的开放情况
	P_ROOT_EXP_POWER,	// 灵气增长的倍率
	P_CHANGE_MODEL,		 // 变身后的模型(不存盘)
	PROP_BANGBANGTANG_EXP, ////棒棒糖经验的增长的速度(这功能应该没用了）

	P_GIVE_YB, //元宝中有多少是赠送的元宝
	P_CRITICAL_STRIKE, //暴击的伤害百分比
	P_EXP_RATE,	 //玩家经验的增长的速度，默认是1倍的

	P_DEPOT_GRID,   // 仓库打开格子数量
	P_ANGER, // 怒气值
	P_ROOT_EXP,  // 灵气值
	P_ACHIEVEPOINT, //完成的成就个数(排行榜)
	P_ZYCONT,//阵营的贡献度(不要直接修改！！！ 调用Actor的接口ChangeZYCount进行修改)
	P_QQ_VIP,  // vip信息数据
	P_WING_ID,	// 翅膀id
	P_WING_SCORE,	// 翅膀评分
	P_PET_SCORE,	// 宠物评分
	PROP_ACTOR_VIPFLAG, // VIP开通标记，通过位掩码标记各种VIP类型。enVIPType定义着VIP类型，分别对应0-2位掩码。(好像没用）
	P_CAMP,			//玩家的阵营 1逍遥，2星尘，3逸仙
	P_PET_SLOT, //玩家开启的宠物槽位的数量（取消）
	P_HONOR,				//荣誉值
	P_QING_YUAN,  //情缘值
	PROP_ACTOR_DUR_KILLTIMES, //连斩的次数（取消）
	PROP_ACTOR_BASE_FIGHT, //今天获得的经验（取消）
	P_FIGHT_VALUE,  //战斗力
	P_MAX_RENOWN,   //玩家的最大的声望的数值
	P_RECHARGE,	// 玩家充值总金额
	P_VIP_LEVEL,  // 玩家的头衔,用于头衔系统，按位表示玩家是否有这个头衔，默认为0，取消
	P_BEAST_LEVEL,	// 玩家所在帮派的仙宗神兽等级(取消，这个放到PROP_FOOT_EFFECT)
	P_FOOT_EFFECT,  // 足迹
	P_EQUIP_SCORE,		//玩家的装备的总分
	P_HAIR_MODEL,  //时装帽外观
	P_BUBBLE,		// 气泡
	P_ACTOR_STATE,		//玩家的状态
	P_JINGJIE_TITLE,	//境界称号
	P_ZHUMOBI,			//诛魔币
	P_WARSPIRIT,		//天仙外观
	P_GUILDFB_SCORE,	//帮派副本积分
	P_SYS_OPENEX,		//开启系统补充

	P_MAX_ACTOR,
}


enum AttributeType {
	atHp = 0,	// 当前hp
	atMp = 1,		// 当前mp
	atMaxHp = 2,		// 生命上限
	atMaxMp = 3,		// 魔法上限
	atAttack = 4,	// 攻击
	atDef = 5,		  // 物理防御

	atRes = 6,		// 魔法防御
	atCrit = 7,		// 暴击率
	atTough = 8,	// 坚韧（抗暴）
	atMoveSpeed = 9,	// 移动速度
	atAttackSpeed = 10,	// 攻击速度

	atHpEx = 11,		// 倍率属性 10000= 100%
	atAtkEx = 12,	// 倍率属性 10000= 100%
	atStunPower = 13,	// 眩晕力
	atStunRes = 14,		// 眩晕抗性
	atStunTime = 15,		// 眩晕时间

	atDamageReduction = 16, // 伤害减免
	atCritHurt = 17,	   //暴击伤害
	atRegeneration = 18, // 每秒回复
	atCritEnhance = 19, // 暴击伤害加强
	atPenetrate = 20, // 穿透(无视百分比双防

	atRoleDamageEnhance = 21,   // 攻击玩家伤害加深
	atRoleDamageReduction = 22, // 受到玩家伤害减免

	atDefEx = 23,		           // 所有攻击都会触发暴击的概率，0-10000
	atResEx = 24,	           // atAllCrit触发后，持续的时间, 单位:毫秒

	cruNeiGong = 25,				//当前内功值25
	maxNeiGong = 26,				//当前内功最大值26
	neigongAbsorbHurt = 27,		//内功吸收伤害百分比27
	atJob1HpEx = 28,				//28,战士生效,对最大生命万份比倍率
	atJob2HpEx = 29,				//29,法师生效,对最大生命万份比倍率
	atJob3HpEx = 30,				//30,术士生效,对最大生命万份比倍率
	atNeiGongRestore = 31,   	//31,定时恢复内功值
	// atDamageEnhanceToWarrior,   // 攻击战士伤害加深
	// atDamageEnhanceToMage,   // 攻击法师伤害加深
	// atDamageEnhanceToTaoist,   // 攻击术士伤害加深
	// atDamageReductionByWarrior, // 受到战士伤害减免
	// atDamageReductionByMage, // 受到法师伤害减免
	// atDamageReductionByTaoist, // 受到术士伤害减免
	atVamirePro = 32, //诛仙装备，攻击时吸血的概率（万分比）
	atVamirePen = 33, //诛仙装备，攻击时吸血的傷害比例（万分比）
	atVamireCd = 34, //诛仙装备，攻击时吸血的CD（毫秒）

	atCursePro = 35, //诛仙装备，詛咒概率（万分比）
	atCurseCd = 36, //诛仙装备，詛咒CD（毫秒）
	atAttAddDamPro = 37, //37.攻击增加伤害的概率(万份比)(剑灵1)
	atAttAddDamVal = 38, //38.攻击增加伤害的值(剑灵1)
	atBeAttAddHpPro = 39,//39.受到攻击时候恢复生命的概率(万份比)(剑灵2)
	atBeAttAddHpVal = 40,//40.受到攻击时候恢复生命的值(剑灵2)
	atAttMbAddDamPen = 41,//41.对被晕眩的目标额外造成X%伤害提升(剑灵4)
	atHpLtAddBuff = 42,	//42.生命低于(万分比例)时,触发生命恢复buff(剑灵5)
	atAttHpLtPenAddDam = 43,//43.攻击生命低的目标增加伤害的血量比例(万份比)(剑灵6)
	atAttHpLtAddDamPen = 44,//44.攻击生命低的目标增加伤害比例(万份比)(剑灵6)

	atJob1AtkEx = 45,//战士物攻
	atJob2AtkEx = 46,//法师物攻
	atJob3AtkEx = 47,//术士物攻

	atJob1DefEx = 48,//战士防御
	atJob2DefEx = 49,//法师防御
	atJob3DefEx = 50,//术士防御

	atJob1ResEx = 51,//战士魔防
	atJob2ResEx = 52,//法师魔防
	atJob3ResEx = 53,//术士魔防

	atAttPerDamPan = 54, //54.命中时追加当前伤害50%的额外伤害的机率(万份比)(剑灵3)
	atYuPeiDeterDam = 55,//55.玉佩的威慑技能加深伤害万份比
	atCritEnhanceResist = 56, // 56,暴击伤害抵抗率
	atHolyDamege = 57,		//57.神圣伤害固定值
	atHuiXinDamage = 65,		// 65,会心伤害率(万份比)
	atNeiGongEx = 66, 		//66.内功倍率(万分比)
	atDeadLyPro = 67,		//67.致命一击概率
	atDeadLyMaster = 68,		//68.致命一击伤害精通率
	atDeadLyResist = 69,		//69.致命一击伤害抵抗率
	
	atBladeMailPro = 72,		//72.刃甲概率(万份比)
	atBladeMailPer = 73,		//73.刃甲反伤(万份比)
	atDefPen = 74,		//74.物防穿透(万份比)
	atResPen = 75,		//75.物防穿透(万份比)
	atDeadLyHurt = 76,		//76.致命一击附加伤害(固定值)
	atDeadLyHurtResist = 77,		//77.致命一击附加伤害减免(固定值)
	atCritHurtResist = 78,		//78.暴击附加伤害减免(固定值)

	atHearthDamege = 79, //79.心法3额外伤害(固定值)
	atHearthHurt = 80, //80.心法3额外伤害率(万份比)
	atHearthCount = 81, //81.心法3每N次触发79or80
	atZhuiMingPro = 82, //82.触发追命伤害的概率(万份比) 心法系统
	atZhuiMingVal = 83, //83.追命伤害(固定值)


	atHuanshouCrit = 157,					//幻兽暴击万分比
	atHuanshouCritHeal = 158,				//幻兽暴击治疗血量
	atHuanshouDoubleHitRate = 159,		//幻兽连击触发万分比
	atHuanshouAtkBuffRate = 160,			//幻兽攻击BUFF触发万分比
	atHuanshouAtkBuffValue = 161,			//幻兽攻击BUFF每次
	atStunResist = 162,			//限制抵抗属性
	atHuanShouSkillCount = 163,			//幻兽皮肤技能 -- 连续释放X次技能后触发效果
	atHuanShouSkillDamageEnhance = 164,			//幻兽皮肤技能 -- 幻兽技能伤害提高0.0X%
	atPenetrDefense = 165,//穿透抵抗
	atHolyDamage = 166,//幻兽神圣伤害
	atHolyReduce = 167,//幻兽神圣伤害减免--格挡

	atCount,
}
