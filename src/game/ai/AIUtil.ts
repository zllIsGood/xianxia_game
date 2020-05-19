/**
 * Ai工具
 */
class AIUtil extends BaseClass {


	public static ins(...args: any[]): AIUtil {
		return super.ins(args) as AIUtil;
	}

	/**
	 * 使用技能
	 * @param self 技能使用者
	 * @param enemy 技能作用者
	 * @param skill 使用的技能
	 * @return 是否造成伤害
	 */
	userSkill(self: CharMonster, enemy: CharMonster, skill: SkillData, hitFun: (probability?: number) => void = null): boolean {
		if (self != enemy) {
			//计算方向
			self.dir = DirUtil.get8DirBy2Point(self, enemy);
		}

		if (!skill)
			return false;

		//播放技能特效
		GameLogic.ins().playSkillEff(skill, self, [enemy], hitFun);

		if (self.action != EntityAction.FLY && skill.teleport == 0 && skill.repelDistance == 0)
			self.stopMove();

		if (self.infoModel.type == EntityType.Monster && GameMap.fbType == UserFb.FB_TYPE_STORY) {
			let cfg: qipaoConfig = GlobalConfig.qipaoConfig[self.infoModel.configID];
			if (cfg && MathUtils.limitInteger(0, 100) < 30) {
				let rnd = MathUtils.limitInteger(0, cfg.news.length - 1)
				self.addPaoPao(cfg.news[rnd]);
			}
		}

		if (!SoundUtil.WINDOW_OPEN && skill.sound && self.team == Team.My && self.infoModel["index"] == 0) {
			SoundUtil.ins().playEffect(skill.sound);
		}
		return true;
	}

	/**
	 * 伤害
	 * @self 伤害源
	 * @enemy 伤害目标
	 * @type 暴击类型
	 * @damage 伤害值
	 */
	hram(self: CharMonster, enemy: CharMonster, type: DamageTypes, damage: number = 0) {

		//显示对象血条扣血
		enemy.hram(damage);
		//飘血
		GameLogic.ins().postEntityHpChange(enemy, self, type, damage);
		//死亡
		if (enemy.getHP() <= 0) {
			if (this.relive(enemy)) {
				return;
			}
		}
	}

	relive(enemy: CharMonster): boolean {
		if (enemy instanceof CharRole && !enemy.hasBuff(52001)) {
			let stunp: number = (<Role>enemy.infoModel).attributeExData[ExAttributeType.eatGodBlessProbability];
			let r: number = Math.random();
			if (r < stunp / 10000) {
				//复活
				enemy.reset();
				enemy.removeAllBuff();
				r = enemy.infoModel.getAtt(AttributeType.atMaxHp) * (<Role>enemy.infoModel).attributeExData[ExAttributeType.eatGodBlessRate] / 10000;
				enemy.hram(r);
				return true;
			}
		}
		return false;
	}

	public static dead(target: CharMonster, callback: Function = null): void {
		target.AI_STATE = AI_State.Die;
		let em: EntityManager = EntityManager.ins();
		em.removeByHandle(target.infoModel.handle, false, GameMap.fbType == UserFb.FB_TYPE_EXP);
		// target.onDead();
		/**用计时器回收对象 */
		egret.Tween.get(target.dieTweenObj).wait(5000).call(() => {
			DisplayUtils.removeFromParent(target);
			if (callback) {
				callback();
			}
		}, this)
	}

	/**检查对象是否可跳跃 */
	public static checkJump(target: CharMonster): XY {
		let rtn: XY = null;
		let config: ScenesConfig = GlobalConfig.ScenesConfig[GameMap.mapID];
		for (let i = 0; config && config.jumpList && i < config.jumpList.length; i++) {
			let node1 = config.jumpList[i][0];
			let node2 = config.jumpList[i][1];
			let tXY = { x: GameMap.point2Grip(target.x), y: GameMap.point2Grip(target.y) };
			if (tXY.x == node1.x && tXY.y == node1.y) {
				rtn = { x: node2.x * GameMap.CELL_SIZE, y: node2.y * GameMap.CELL_SIZE };
				break;
			}
		}
		return rtn;
	}

	//基本属性触发
	public static triggerAttr(selfTarget: CharMonster, type: AttributeType, passiveAttr: any = {}, exAttr: any = null): boolean {
		let attrValue: number = selfTarget.infoModel.attributeData[type];
		attrValue += passiveAttr[type] ? passiveAttr[type] : 0;
		attrValue += exAttr ? exAttr : 0;
		if (attrValue) {
			let r: number = Math.random();
			if (r < attrValue / 10000) {
				return true;
			}
		}
		return false;
	}
}