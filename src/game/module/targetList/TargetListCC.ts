/**
 * 攻击目标
 * 暂时只能用在主城战，其他地方相用的话就麻烦了，这里嵌入了主城的逻辑
 */
class TargetListCC extends BaseSystem {

	/**正在攻击玩家的实体 masterHandle*/
	public attackMeHandles: number[];
	/**玩家可攻击的其他玩家实体 masterHandle*/
	public canAttackHandles: number[];

	private tipsCD: boolean;

	public masterAtkTarget: any = {};

	public constructor() {
		super();
		this.tipsCD = false;
		this.attackMeHandles = [];
		this.canAttackHandles = [];
		this.observe(GameLogic.ins().postEntityHpChange, this.attackAndShowTip);
		this.observe(BattleCC.ins().postEnterSuccess, this.campChange);
		this.observe(GameLogic.ins().postAllAtkTarget, this.updateAtkTarget);
		this.observe(GameLogic.ins().postEnterMap, this.onEnterMap);
	}

	/**
	 * 切换地图处理攻击列表
	 *
	 */
	private onEnterMap() {
		this.masterAtkTarget = {};
		this.attackMeHandles.length = 0;
		this.canAttackHandles.length = 0;

		TimerManager.ins().removeAll(this);
		ViewManager.ins().close(TargetListPanel);
		//防止卡机，导致未先执行场景判断而导致处理异常，这里再加延迟侦处理
		TimerManager.ins().doTimer(600, 1, () => {
			if (this.isShow) {
				TimerManager.ins().doTimer(1000, 0, this.update, this);
				this.update();
				ViewManager.ins().open(TargetListPanel);
			}
		}, this);
	}

	public get isShow(): boolean {
		return CityCC.ins().isCity ||
			BattleCC.ins().isBattle() ||
			PaoDianCC.ins().isPaoDian ||
			GwBoss.ins().isGwBoss ||
			GwBoss.ins().isGwTopBoss ||
			WJBattlefieldSys.ins().isWJBattle ||
			KFBossSys.ins().isKFBossBattle ||
			DevildomSys.ins().isDevildomBattle ||
			HefuBossCC.ins().isInHefuBoss ||
			KfArenaSys.ins().isKFArena;
	}

	private update() {
		if (!this.isShow) {//防止出现异常，未正常处理问题
			TimerManager.ins().removeAll(this);
			ViewManager.ins().close(TargetListPanel);
			return;
		}
		this.postChangeCanAttackHandle();
		this.updateAttackMe();
	}

	/** 阵营变更 */
	private campChange(): void {
		if (BattleCC.ins().isBattle()) {
			//实体名字变色
			let char: CharRole;
			let roleList = EntityManager.ins().getAllEntity();
			for (let i in roleList) {
				char = roleList[i];
				if (char && char.infoModel) {
					if (char.infoModel.type == EntityType.Role) {
						char.setCharName((char.infoModel as Role).guildAndName);
						char.updateNameColor();
					}
				}
			}
		}
	}


	public postChangeCanAttackHandle() {
		let char: CharRole;
		let roleList = EntityManager.ins().getAllEntity();
		this.canAttackHandles.length = 0;

		let infoModel: EntityModel;
		let addMonster: boolean = false;

		//当前场景下不添加怪物到可攻击列表
		let monsterCannotAttack = CityCC.ins().isCity || GwBoss.ins().isGwBoss
			|| GwBoss.ins().isGwTopBoss || KFBossSys.ins().isKFBossBattle
			|| DevildomSys.ins().isDevildomBattle
			|| KfArenaSys.ins().isKFArena || HefuBossCC.ins().isInHefuBoss;

		for (let i in roleList) {
			char = roleList[i];
			infoModel = char.infoModel;
			if (!infoModel) continue;

			if (infoModel.type == EntityType.Role) {
				//跨服3v3
				if (KfArenaSys.ins().isKFArena) {
					if ((<Role>infoModel).camp > 0 && (<Role>infoModel).camp != KfArenaSys.ins().myCampId)
						this.updateCanAttackHandle(infoModel.masterHandle, true);
				}
				else if (char.isSafety() == false && infoModel.getAtt(AttributeType.atHp) > 0) {
					//阵营战
					if (BattleCC.ins().isBattle()) {
						if ((<Role>infoModel).camp > 0 && (<Role>infoModel).camp != BattleCC.ins().camp)
							this.updateCanAttackHandle(infoModel.masterHandle, true);
					}
					//魔界入侵场景不显示同帮会的
					else if (DevildomSys.ins().isDevildomBattle) {
						if (!(<Role>infoModel).guildID || (<Role>infoModel).guildID && (<Role>infoModel).guildID != Guild.ins().guildID) {
							this.updateCanAttackHandle(char.infoModel.masterHandle, true);
						}
					}
					else
						this.updateCanAttackHandle(infoModel.masterHandle, true);
				}

			}
			else if (infoModel.type == EntityType.Monster && infoModel.getAtt(AttributeType.atHp) > 0 && !addMonster) {

				if (monsterCannotAttack) {
					continue;
				}

				let monsterConfig = GlobalConfig.MonstersConfig[infoModel.configID];
				if (!monsterConfig)
					continue;
				if (monsterConfig.type == MonsterType.Ring || monsterConfig.type == MonsterType.Summon)//烈焰戒指 道士召唤怪
					continue;

				if (!this.checkMonHead(monsterConfig))
					continue;

				//排除不可攻击的怪物
				if (GlobalConfig.CampBattleConfig.noAttack.indexOf(infoModel.configID) == -1) {
					addMonster = true;
					this.updateCanAttackHandle(infoModel.handle, true, true);
				}
			}

		}


		//策划特别要求，跨服boss场景比较特殊，需要一直显示旗子 ,没有次数就不显示
		if (KFBossSys.ins().isKFBossBattle && KFBossSys.ins().flagHandle && KFBossSys.ins().flagTimes > 0) {
			this.updateCanAttackHandle(KFBossSys.ins().flagHandle, true, true);
		}

	}

	private checkMonHead(config: MonstersConfig) {
		return !Assert(config.head, `怪物头像不存在1，id:${config.id},name:${config.name}`);
	}


	private updateAttackMe() {
		for (let masterHandle of this.attackMeHandles) {
			let chars = EntityManager.ins().getMasterList(masterHandle);
			if (!chars || chars.length == 0) {
				this.postTargetList(masterHandle, 0);
			}
			else {
				let isDead = true;
				for (let char of chars) {
					if (char && char.infoModel && char.infoModel.getAtt(AttributeType.atHp) > 0) {
						isDead = false;
						break;
					}
				}
				if (isDead)
					this.postTargetList(masterHandle, 0);
			}
		}
	}

	public clear() {
		this.attackMeHandles.length = 0;
		this.canAttackHandles.length = 0;
		GameLogic.ins().currAttackHandle = 0;
		UserBoss.ins().monsterID = 0;
	}

	private updateCanAttackHandle(handle: number, add: boolean, firstPos: boolean = false) {
		let rootHandle = EntityManager.ins().getRootMasterHandle(handle);
		if (rootHandle == 0 || rootHandle == Actor.handle) return;
		let idx = this.canAttackHandles.indexOf(rootHandle);
		if (add && idx == -1) {
			if (firstPos)
				this.canAttackHandles.unshift(rootHandle);
			else
				this.canAttackHandles.push(rootHandle);
		}
		else if (!add && idx != -1)
			this.canAttackHandles.splice(idx, 1);
	}

	public postTargetList(sourceHandle: number, targetHandle: number) {
		if (sourceHandle == 0 && targetHandle == 0)
			return;

		let rootSource = EntityManager.ins().getRootMasterHandle(sourceHandle);
		let rootTarget = EntityManager.ins().getRootMasterHandle(targetHandle);

		if (rootSource == rootTarget) return;

		if (rootSource == Actor.handle) {
			let target: CharRole = EntityManager.ins().getEntityByHandle(targetHandle) as CharRole;

			if (target && target.infoModel && target.infoModel.type == EntityType.CollectionMonst) return;//采集怪都不显示头像
			if (target && target.infoModel && target.infoModel.getAtt(AttributeType.atHp) > 0) {
				if (target.infoModel.type == EntityType.Monster) {
					let config = GlobalConfig.MonstersConfig[target.infoModel.configID];
					if (config) {
						if (config.type == MonsterType.Ring || config.type == MonsterType.Summon) {
							GameLogic.ins().postChangeTarget(target.infoModel.masterHandle);
						} else {
							GameLogic.ins().postChangeTarget(target.infoModel.handle);
						}


						if (!config.head) {
							let errTip: string = "";
							if (CityCC.ins().isCity) errTip += "isCity = true";
							if (PaoDianCC.ins().isPaoDian) errTip += "|isPaoDian = true";
							if (BattleCC.ins().isBattle()) errTip += "|isBattle = true";
							if (GwBoss.ins().isGwBoss) errTip += "|isGwBoss = true";
							if (GwBoss.ins().isGwTopBoss) errTip += "|isGwTopBoss = true";
							if (WJBattlefieldSys.ins().isWJBattle) errTip += "|isWJBattle = true";
							if (KFBossSys.ins().isKFBossBattle) errTip += "|isKFBossBattle = true";
							if (DevildomSys.ins().isDevildomBattle) errTip += "|isDevildomBattle = true";
							if (KfArenaSys.ins().isKFArena) errTip += "|isKFArena = true";
							if (HefuBossCC.ins().isInHefuBoss) errTip += "|isInHefuBoss = true";
							Assert(config.head, `postTargetList 怪物头像不存在，id:${config.id},name:${config.name},fbType:${GameMap.fbType},fbId:${GameMap.fubenID},ms:${target.infoModel.masterHandle} ${errTip}`);
						}
					}

				} else {
					GameLogic.ins().postChangeTarget(target.infoModel.masterHandle);
				}
				// GameLogic.ins().postChangeTarget(target.infoModel.type == EntityType.Monster ? target.infoModel.handle : target.infoModel.masterHandle);
			} else {
				GameLogic.ins().postChangeTarget(0);
				ViewManager.ins().close(TargetPlayerBigBloodPanel);
			}
			if (ViewManager.ins().isShow(TargetListPanel))
				(ViewManager.ins().getView(TargetListPanel) as TargetListPanel).showTarget(targetHandle != 0);

		}
		else if (rootTarget == 0) {
			let idx = this.attackMeHandles.indexOf(rootSource);
			if (idx != -1) this.attackMeHandles.splice(idx, 1);
		}
	}

	private attackAndShowTip([targetRole, sourceRole, type, value]: [CharRole, CharRole, number, number]): void {
		if (!this.isShow || !targetRole || !sourceRole || value <= 0)
			return;
		if (!targetRole.isMy && !sourceRole.isMy)
			return;

		let rootSource = EntityManager.ins().getRootMasterHandle(sourceRole.infoModel.handle);
		let rootTarget = EntityManager.ins().getRootMasterHandle(targetRole.infoModel.handle);

		//自己对别人造成伤害
		if (rootTarget != Actor.handle && rootSource == Actor.handle) {
			if (GameLogic.ins().currAttackHandle != 0 && !ViewManager.ins().isShow(TargetPlayerBigBloodPanel)) {
				if (BattleCC.ins().isBattle() || PaoDianCC.ins().isPaoDian)
					ViewManager.ins().open(TargetPlayerBigBloodPanel);
				else if ((CityCC.ins().isCity && CityCC.ins().cityBossId == 0) || (HefuBossCC.ins().isInHefuBoss && HefuBossCC.ins().hefuBossId == 0))
					ViewManager.ins().open(TargetPlayerBigBloodPanel);
			}
			return;
		}

		let idx = this.attackMeHandles.indexOf(rootSource);
		if (idx == -1 && rootTarget == Actor.handle && rootSource != Actor.handle && this.masterAtkTarget[rootSource] == rootTarget) {
			//加入被攻击列表
			if (sourceRole.infoModel.type == EntityType.Role) {
				this.attackMeHandles.push(rootSource);
				if (this.attackMeHandles.length > 0) {
					if (!ViewManager.ins().isShow(TargetListPanel)) {
						ViewManager.ins().open(TargetListPanel);
						CityCC.ins().postChangeAttStatue(1);
						HefuBossCC.ins().postChangeAttStatue(1);
					}
				}
				this.postTargetList(0, 0);
			}
		}
		//角色死亡，自动取消目标
		if (targetRole.infoModel.isMy && targetRole.infoModel.getAtt(AttributeType.atHp) <= 0 && !EntityManager.ins().getNoDieRole()) {
			if (ViewManager.ins().isShow(TargetListPanel))
				(ViewManager.ins().getView(TargetListPanel) as TargetListPanel).showTarget(false);
		}

	}

	private updateAtkTarget([sourceHandle, targetHandle]) {
		let sourceMaster = EntityManager.ins().getRootMasterHandle(sourceHandle);
		let targetMaster = EntityManager.ins().getRootMasterHandle(targetHandle);
		this.masterAtkTarget[sourceMaster] = targetMaster;
	}

	static ins(): TargetListCC {
		return super.ins() as TargetListCC;
	}

}

namespace GameSystem {
	export let  targetListCC = TargetListCC.ins.bind(TargetListCC);
}