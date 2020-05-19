/**
 * 遭遇他人
 */
class CharEncounter extends egret.DisplayObjectContainer implements IChar {
	/** 角色 */
	protected _role: CharRole;
	/** 怪物 */
	protected _monster: CharMonster;

	public posIndex: number;

	public infoModel: EncounterModel;

	private atkCount: number;

	private posCount: number;

	private skillData: SkillData;

	constructor() {
		super();
		this.atkCount = 0;
		this.posCount = 0;
		this.touchEnabled = false;
		this._role = new CharRole;
		this._role.touchEnabled = true;
		this._monster = new CharMonster;

		this._monster.x = this.x + 30;
		this._monster.y = this.y + 30;
		this._role.x = this.x;
		this._role.y = this.y;
	}

	private lastRunTime: number = 0;
	private atkTime: number = -1500;

	private autoAtk(): void {
		this.atkTime = egret.getTimer();
		this._role.stopMove();
		this.atkCount++;
		this._monster.dir = DirUtil.get8DirBy2Point(this._monster, this._role);
		this._role.AI_STATE = AI_State.Atk;
		let currTime: number = egret.getTimer();
		let inSleep: boolean = currTime - this.lastRunTime > 2000;
		this.lastRunTime = currTime;
		if (inSleep)
			return;

		let roleModel: Role = <Role>this._role.infoModel;
		if (roleModel == undefined) {
			Log.trace("遭遇敌人自动攻击异常，本角色model为空");
			return;
		}

		this.skillData = SkillData.getSkillByJob(roleModel.job);

		if (Math.random() * 10 > 9 && this.atkCount > 2) {
			this.killMonster();
		} else {
			//播放技能特效
			GameLogic.ins().playSkillEff(this.skillData, this._role, [this._monster]);
			this._monster.playAction(EntityAction.ATTACK);
			TimerManager.ins().doTimer(500, 1, () => {
				this._monster.playAction(EntityAction.STAND)
			}, this);
		}
	}

	public showPk() {
		this._role.dir = 3;
		this._monster.y = this.y + 30;
		this._monster.x = this.x + 30;
		this.x = this._role.x;
		this.y = this._role.y;
		this._role.stopMove();
		TimerManager.ins().removeAll(this);
		TimerManager.ins().doTimer(1500, 0, this.waitAtk, this);
	}

	public waitAtk() {
		let roleModel: Role = <Role>this._role.infoModel;
		if (roleModel == undefined) {
			Log.trace("遭遇敌人自动攻击异常，本角色model为空");
			return;
		}
		//播放技能特效
		GameLogic.ins().playSkillEff(this.skillData, this._role, [this._monster]);
		this._monster.playAction(EntityAction.ATTACK);
		TimerManager.ins().doTimer(500, 1, () => {
			this._monster.playAction(EntityAction.STAND)
		}, this);
	}


	private runToNewMonster() {
		if (this._role && this._role.infoModel) {
			this._monster.visible = true;
			this._role.infoModel.setAtt(AttributeType.atMoveSpeed, 3000);
			GameMap.moveEntity(this._role, this._monster.x, this._monster.y);
			this._role.AI_STATE = AI_State.Run;
		}
	}

	private killMonster() {
		if (!this._monster)return;
		this._role.AI_STATE = AI_State.Stand;
		this.posCount++;
		this._monster.visible = false;

		let len = UserFb.ins().encounterPos.length;
		let ran = Math.floor(Math.random() * len);
		let index = UserFb.ins().encounterPos.splice(ran, 1);

		this.atkCount = 0;
		UserFb.ins().encounterPos.push(this.posIndex);
		this.posIndex = index[0];

		let point = UserFb.ins().zyPos[index[0]];
		this._monster.x = point.x * GameMap.CELL_SIZE;
		this._monster.y = point.y * GameMap.CELL_SIZE;
		this._monster.playAction(EntityAction.STAND);
		this.atkTime = -1500;
	}

	private reach(): boolean {
		let dis = MathUtils.getDistance(this._monster.x, this._monster.y, this._role.x, this._role.y)
		return dis < 100;
	}

	private AI() {
		switch (this._role.AI_STATE) {
			case AI_State.Atk:
				if (egret.getTimer() - this.atkTime > 1500)
					this.autoAtk();
				break;
			case AI_State.Stand:
				this.runToNewMonster();
				break;
			case AI_State.Run:
				if (this.reach())
					this.autoAtk();
				else
					this.runToNewMonster();
				break;
		}
		// if (this.infoModel.firstData)
		// 	EntityManager.ins().encounterGuide(this);
	}

	private onTap(e: egret.TouchEvent): void {
		if (EncounterModel.redName >= GlobalConfig.SkirmishBaseConfig.maxPkval) {
			UserTips.ins().showTips(`PK值已满无法进行PK`);
			return;
		}
		// EntityManager.ins().createEncounter(this.infoModel.index);
		// e.stopPropagation();
		// UserFb.ins().encounterPos.push(this.posIndex);
	}

	public reset(): void {
		GameLogic.ins().addEntity(this._monster);
		GameLogic.ins().addEntity(this._role);
		this.atkCount = 0;
		this._role.AI_STATE = AI_State.Stand;
		this._role.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTap, this);

		TimerManager.ins().doTimer(100, 0, this.AI, this);

	}

	public destruct(): void {
		this._role.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTap, this);
		this._role.playAction(EntityAction.STAND);
		this._monster.playAction(EntityAction.STAND);
		// this._role.destruct();
		// this._monster.destruct();
		TimerManager.ins().removeAll(this);
		DisplayUtils.removeFromParent(this);
		DisplayUtils.removeFromParent(this._role);
		DisplayUtils.removeFromParent(this._monster);
		UserFb.ins().encounterPos.push(this.posIndex);
		ObjectPool.push(this);
	}

	public setData(model: EncounterModel): void {
		this.infoModel = model;

		if (UserFb.ins().guanqiaID > -1) {
			// let wave = Math.floor(UserFb.ins().waveMonsterId.length * Math.random());
			// let monsterModel: EntityModel = UserFb.ins().createMonster(UserFb.ins().waveMonsterId[wave]);
			// monsterModel.configID = UserFb.ins().waveMonsterId[wave];
			// // this._monster.initBody(RES_DIR_MONSTER + monsterModel.avatarFileName);
            //
			// this.posIndex = UserFb.ins().encounterPos.pop();
			// if (!this.posIndex) return;
			// let point = UserFb.ins().zyPos[this.posIndex];
			// this.x = point.x * GameMap.CELL_SIZE;
			// this.y = point.y * GameMap.CELL_SIZE;
			// this._role.x = this.x;
			// this._role.y = this.y;
			// this._monster.x = this.x + 30;
			// this._monster.y = this.y + 30;
		}

		this._role.infoModel = model.subRole[0];
		this._role.playAction(EntityAction.STAND);
		this._role.updateBlood(true);
		this._role.showBlood(true);
		this._role.updateNeiGong();
		this._role.updateModel();
		this._role.setCharName(this.infoModel.name);
	}

	public setPosition(x, y) {
		this.x = this._role.x = x;
		this.y = this._role.y = y;
		this._monster.x = this.x + 30;
		this._monster.y = this.y + 30;
	}

}