/**主逻辑管理器 */
class GameLogic extends BaseSystem {

	private heartBeatTimer: any;
	/**挂机状态 */
	private hookState: number;
	/**挂机状态 */
	public static HOOK_STATE_HOOK: number = 0;
	/**寻敌状态 */
	public static HOOK_STATE_FIND_ENMENY: number = 1;

	/**刷怪半径 */
	public MONSTER_RADIUS: number = 2;
	//刷怪格子范围
	public MONSTER_LEN: number = this.MONSTER_RADIUS * 2 + 1;
	/**刷怪半径格子表 */
	private radiusMap: number[][];

	/**是否开启屏蔽功能*/
	public static IS_OPEN_SHIELD: boolean = true;

	public static SERVER_VER: string = '';

	public constructor() {
		super();

		this.sysId = PackageID.Default;
		this.regNetMsg(2, this.postChildRole);
		this.regNetMsg(3, this.postEnterMap);
		this.regNetMsg(4, this.postCOEntity);
		this.regNetMsg(5, this.doGoldChange);
		this.regNetMsg(8, this.doSubRoleAtt);
		this.regNetMsg(9, this.postHpChange);
		this.regNetMsg(10, this.doRemoveEntity);
		this.regNetMsg(11, this.doMoveEntity);
		this.regNetMsg(12, this.doStopMoveEntity);
		this.regNetMsg(13, this.doSyncPos);
		this.regNetMsg(15, this.postMpChange);
		this.regNetMsg(17, this.doTips);
		this.regNetMsg(18, this.doFirstRegister);
		this.regNetMsg(20, this.doDieNotice);
		this.regNetMsg(21, this.postGuildChange);
		this.regNetMsg(22, this.postRename);
		this.regNetMsg(24, this.postOtherAttChange);
		this.regNetMsg(25, this.doPaoPao);
		this.regNetMsg(26, this.doNeiGongChange);
		this.regNetMsg(27, this.doSubRoleExtAtt);
		this.regNetMsg(31, this.doFindPath);
		this.regNetMsg(32, this.doBloodNumShow);
		this.regNetMsg(33, this.doChangeTarget);
		this.regNetMsg(34, this.doAddMonsterConfig);
		this.regNetMsg(35, this.doZeroInit);
		this.regNetMsg(38, this.doServerVer);
		KeyboardUtils.ins().addKeyDown(this.test, this);

		this.radiusMap = [];
		let len: number = this.MONSTER_RADIUS * 2 + 1;
		for (let i: number = 0; i < len; i++) {
			this.radiusMap[i] = [];
		}
	}

	public static ins(): GameLogic {
		return super.ins() as GameLogic;
	}

	protected initLogin() {
		this.sendHeartbeat();
	}

	/**发送创建子角色 */
	public sendNewRole(job: number, sex: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeByte(job);
		bytes.writeByte(sex);
		this.sendToServer(bytes);
	}

	public sendHeartbeat(): void {
		if (this.heartBeatTimer)
			return;

		let f = () => {
			let bytes: GameByteArray = this.getBytes(255);
			this.sendToServer(bytes);
		};

		if (LocationProperty.isNotNativeMode) {
			this.heartBeatTimer = window.setInterval(f,30000);
		}
		else{
			this.heartBeatTimer = new egret.Timer(1000 * 30);
			this.heartBeatTimer.addEventListener(egret.TimerEvent.TIMER, f, this);
			this.heartBeatTimer.start();
		}
	}

	public sendGMCommad(str: string): void {
		let bytes: GameByteArray = this.getBytes(0);
		bytes.writeString(str);
		this.sendToServer(bytes);
	}

	/**
	 * 子角色列表
	 * 0-2
	 * @param bytes
	 */
	postChildRole(bytes: GameByteArray) {
		SubRoles.ins().doSubRole(bytes);
	}

	/**
	 * 进入场景
	 * 0-3
	 * @param bytes
	 */
	public postEnterMap(bytes: GameByteArray): void {
		window['showGame']();
		//清空掉落物 将上次未捡完的道具拾取否则会出现掉落物品不发拾取确认消息
		DropHelp.clearDrop();

		GameMap.parser(bytes);

		RoleAI.ins().clear();

		MonsterSpeak.ins().clear();

		MineFight.ins().stop();
		MineData.ins().removeAll();

		// 销毁角色足迹。。。
		let charrole = EntityManager.ins().getAllCharRole()
		for (let i = 0; i < charrole.length; i++) {
			charrole[i].removeFootPrint();
		}

		//移除所有实体
		EntityManager.ins().removeAll();
		//移除全体人员移动的监听
		TimerManager.ins().removeAll(GameMap);
		TimerManager.ins().removeAll(SkillEffPlayer);
		// TimerManager.ins().remove(this.shakeMapView, this);
		//清空掉落物
		// DropHelp.clearDrop();
		//清空
		this.gamescene.map.clearAllLayer();
		//切换场景
		this.gamescene.map.changeMap();

		if (GameMap.fubenID == 0) {
			UserFb.ins().pkGqboss = false;
			//重新显示野外boss
			if (Encounter.ins().willBossID) {
				Encounter.ins().createBoss();
				PlayFun.ins().upDataWillBoss(Encounter.ins().willBossID);
			}
		} else if (GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS) {

		}
		else {
			ViewManager.ins().closeTopLevel();
		}
		//关闭boss血条面板
		ViewManager.ins().close(BossBloodPanel);
		ViewManager.ins().close(TargetPlayerBigBloodPanel);

		GuildWar.ins().getModel().clearGuildWarList();
		UserBoss.ins().clearWorldBossList();
		TargetListCC.ins().clear();

		if (!SoundUtil.WINDOW_OPEN && (GameMap.lastFbId != GameMap.fubenID || GameMap.fubenID)) {
			SoundUtil.ins().playEffect(SoundUtil.SCENE);
		}

		WeatherFactory.stopWeather();
		let config: ScenesConfig = GlobalConfig.ScenesConfig[GameMap.mapID];
		if (config && config.weather) {
			let w = WeatherFactory.getWeather(config.weather);
			if (w) {
				w.playWeather();
			}
		}

		let uTask = UserTask.ins();
		if (GameMap.fbType == UserFb.FB_TYPE_STORY && uTask.taskTrace && uTask.taskTrace.id != 100001) {
			uTask.checkTrace();
		}

	}

	/**
	 * 处理创建场景实体
	 * 0-4
	 * @param bytes
	 */
	postCOEntity(bytes: GameByteArray): EntityModel {
		let entityType: number = bytes.readShort();
		let handler: number = bytes.readDouble();
		bytes.position -= 10;
		let model: EntityModel;
		let target: CharMonster;
		if (entityType == EntityType.Monster || entityType == EntityType.CollectionMonst || entityType == EntityType.HuanShouMonster) {
			target = EntityManager.ins().getEntityByHandle(handler);
			if (target) {
				model = (<CharMonster>target).infoModel;
				model.parser(bytes);
			} else {
				model = new EntityModel;
				model.parser(bytes);
				if (GameMap.sceneInMine()) {
					target = this.createEntityByModel(model, Team.NotAI) as CharMonster;
				} else {
					target = this.createEntityByModel(model) as CharMonster;
				}
			}
			if (entityType != EntityType.HuanShouMonster) {
				// if (BattleCC.ins().isBattle())
					// BattleCC.ins().addMonsterList(model.handle);
			}
		}
		else if (entityType == EntityType.Role) {
			model = new Role;
			model.parserBase(bytes);
			(<Role>model).parserOtherRole(bytes,true);
			if (model.masterHandle && model.masterHandle == Actor.handle || !GameMap.sceneInMine()) {
				target = this.createEntityByModel(model) as CharMonster;
			} else {
				target = this.createEntityByModel(model, Team.NotAI) as CharMonster;
			}
		} else if (entityType == EntityType.LadderPlayer) {
			model = new Role;
			model.parserBase(bytes);
			(<Role>model).parserOtherRole(bytes,false);
			if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
				model.masterHandle = model.handle;
			}
			target = this.createEntityByModel(model) as CharMonster;

			let pos = AIUtil.checkJump(target);
			if (pos) {
				GameLogic.ins().sendReqJump(model.handle, { x: target.x, y: target.y }, pos)
			}

		} else if (entityType == EntityType.DropItem) {
			model = new CharModel();
			model.parserBase(bytes);
			(<CharModel>model).parserItemData(bytes);
			this.createEntityByModel(model);
		}

		this.afterCOEntity(entityType, model, target);

		return model;
	}

	private afterCOEntity(entityType: number, model: EntityModel, target) {
		if (!model) return;
		if (entityType == EntityType.Monster || entityType == EntityType.CollectionMonst) {
			if (GameMap.fbType == UserFb.FB_TYPE_EXP) {
				UserFb.ins().expMonterCount += 1;
			}
			if (GameMap.sceneInMine()) {
				if (target) target.visible = false;
			}
			MonsterSpeak.ins().trigger(model.configID, SpeakType.appear);
		} else if (entityType == EntityType.Role) {
			if (GuildWar.ins().getModel().checkinAppoint() || GameMap.fbType == UserFb.FB_TYPE_ZHUANSHENGBOSS) {
				if ((<Role>model).guildID != Guild.ins().guildID) {
					GuildWar.ins().getModel().changecanPlayList(model.masterHandle);
				} else {
					GuildWar.ins().getModel().setMyGuildNum(model.masterHandle);
				}
			}
			if (MineFight.ins().isFighting && target) {
				target.visible = false;
			}
		} else if (entityType == EntityType.LadderPlayer) {
			if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
				UserFb.ins().guideBossPlayerId = model.configID;
				UserFb.ins().guideBossPlayerJob = (model as Role).job;
				UserFb.ins().guideBossPlayerSex = (model as Role).sex;
				UserFb.ins().guideBossPlayerName = model.name;
				if (UserFb.ins().guideBossKill == 0) {
					UserBoss.ins().postBelongChange(model.masterHandle);
				}
			}
		}
	}

	/**
	 * 处理金钱变化
	 * 0-5
	 * @param bytes
	 */
	private doGoldChange(bytes: GameByteArray): void {
		let type: number = bytes.readShort();
		if (type == 1) {
			let newGold: number = bytes.readNumber();
			Actor.ins().postGoldChange(newGold);
		} else if (type == 4) {
			let num: number = bytes.readNumber();
			Actor.ins().postSoulChange(num);
		} else if (type == 7) {
			Actor.ins().postFeatsChange(bytes.readNumber());
		} else if (type == 9) {
			//符文系统-碎片读取
			let oldRune = Actor.runeShatter;
			Actor.runeShatter = bytes.readNumber();
			if (Actor.runeShatter - oldRune > 0) {
				UserTips.ins().showTips(`获得|C:0x35e62d&T:符文精华x${Actor.runeShatter - oldRune}|`);
			}

			this.postRuneShatter();
		} else if (type == MoneyConst.piece) {
			//符文系统- 符文兑换消耗
			let oldValue: number = Actor.runeExchange;
			Actor.runeExchange = bytes.readNumber();
			if (oldValue && Actor.runeExchange - oldValue > 0) {
				UserTips.ins().showTips(`|C:0xFFD700&T:获得${Actor.runeExchange - oldValue}${RewardData.getCurrencyName(MoneyConst.piece)}|`);
			}

			this.postRuneExchange();
		} else if (type == 11) {
			//必杀装备碎片
			let together: number = bytes.readNumber();
			Actor.ins().postUpdateTogeatter(together, 1);
		} else if (type == 12) {
			let together: number = bytes.readNumber();
			Actor.ins().postUpdateTogeatter(together, 2);
		}
		else if (type == MoneyConst.weiWang)
			Actor.ins().postWeiWang(bytes.readNumber());
		else {
			let newYb: number = bytes.readNumber();
			Actor.ins().postYbChange(newYb);
		}
	}

	public postRuneShatter(): void {

	}

	public postRuneExchange(): void {

	}

	public postLevelBarChange(lv: number) {
		return lv;
	}

	/**
	 * 处理属性变化
	 * 0-8
	 * @param bytes
	 */
	private doSubRoleAtt(bytes: GameByteArray): void {
		SubRoles.ins().doSubRoleAtt(bytes);
	}

	/**
	 * 处理血量更新
	 * 0-9
	 * @param bytes
	 */
	public postHpChange(bytes: GameByteArray): [CharMonster, number, number] | boolean {
		let handle = bytes.readDouble();
		let hp = bytes.readDouble();
		let target: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		if (!target) return false;
		let oldHp = target.infoModel.getAtt(AttributeType.atHp);
		target.infoModel.setAtt(AttributeType.atHp, hp);
		target.updateBlood();
		if (hp <= 0) {

			RoleAI.ins().checkPlayDieSound(target);

			DropHelp.tempDropPoint.x = Math.floor(target.x / GameMap.CELL_SIZE);
			DropHelp.tempDropPoint.y = Math.floor(target.y / GameMap.CELL_SIZE);

			if (target.infoModel.masterHandle == Actor.handle)
				this.postMoveCamera();
		}
		else {
			//修复玩家复活不显示名字和血条bug
			if (target.infoModel.type == EntityType.Role && !(target as CharRole).nameVisible)
				(target as CharRole).showNameAndHp();
		}
		return [target, hp, oldHp];
	}

	//处理内功当前值更新
	private doNeiGongChange(bytes: GameByteArray): void {
		// console.log("处理内功当前值更新 ======================================");
		let handle: number = bytes.readDouble();
		//内功当前值
		let neigong: number = bytes.readDouble();
		//是否飘字
		// let flow: boolean = bytes.readBoolean();
		let target: CharRole = EntityManager.ins().getEntityByHandle(handle) as CharRole;
		// egret.log("nnnn:" + neigong)
		if (target && target.infoModel) {
			target.infoModel.setAtt(AttributeType.cruNeiGong, neigong);
			target.updateNeiGong();
		}
	}

	/**派发实体血量变更 */
	public postEntityHpChange(target: CharMonster, source: CharMonster, type: DamageTypes, value: number): any {
		if ((source && source.team == Team.My) || (target && target.team == Team.My)) {
			if (type == DamageTypes.Heji) {
				let gsv = ViewManager.ins().getView(GameSceneView) as GameSceneView;
				DisplayUtils.shakeItHeji(gsv.map, 30, 700);

			}
		}
		return [target, source, type, value];
	}

	/**
	 * 移除实体
	 * 0-10
	 * @param bytes
	 */
	private doRemoveEntity(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let type: number = bytes.readShort();
		let entity: CharMonster = EntityManager.ins().getEntityByHandle(handle);
		if (!entity) return;

		if (type == 2) {
			entity.stopMove();
			entity.playAction(EntityAction.STAND);
			egret.Tween.removeTweens(entity);
			egret.Tween.get(entity).to({ alpha: 0 }, 2000).call(() => {
				EntityManager.ins().removeByHandle(handle, true, true);
			}, this);

		} else if (entity instanceof CharRole) {
			if (entity.infoModel && entity.infoModel.type == EntityType.LadderPlayer) {
				if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) { //引导boss副本，假人死亡特殊处理
					if (UserFb.ins().guideBossKill == 0) { //死亡第一次移除
						this.removeEntity(handle);
						UserBoss.ins().postBelongChange(Actor.handle, handle, entity.infoModel.name);
						UserFb.ins().guideBossKill += 1;
					} else { //死亡第二次不移除
						EntityManager.ins().removeByHandle(handle, false, true);
						// entity.onDead(() => {
						// 	entity.deadDelay();
						// });
						GuideUtils.ins().clickOut();
						UserFb.ins().guideBossKill += 1;
						UserBoss.ins().weixieList.length = 0;
						UserBoss.ins().postHasAttackChange(0);
					}
				} else {
					this.removeEntity(handle);
				}
			} else {
				EntityManager.ins().removeByHandle(handle);
			}
		} else if (entity instanceof CharItem2) {
			EntityManager.ins().removeByHandle(handle);
		} else {
			this.removeEntity(handle);
			if (entity && entity.team != Team.My) {
				let isPlayStand = false;
				//怪物杀死完后站立动作
				let nextList = EntityManager.ins().screeningTargetByPos(entity, true);
				if (!nextList || nextList.length == 0) {
					isPlayStand = true;
				} else {
					if (GameMap.fbType == UserFb.FB_TYPE_GUILD_WAR) {
						if (!GameLogic.ins().currAttackHandle || !EntityManager.ins().getEntityByHandle(GameLogic.ins().currAttackHandle) || EntityManager.ins().getEntityByHandle(GameLogic.ins().currAttackHandle).infoModel.getAtt(AttributeType.atHp) <= 0) {
							isPlayStand = true;
						}
					}
				}

				if (isPlayStand) {
					let mylist = EntityManager.ins().getEntityByTeam(Team.My);
					for (let char of mylist) {
						if (char.action != EntityAction.RUN) char.playAction(EntityAction.STAND);
					}
				}

				if (GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS || GameMap.fbType == UserFb.FB_TYPE_TIAOZHAN) {
					if (entity.parent) {
						let point = entity.parent.localToGlobal(entity.x, entity.y);
						UserFb.ins().postExpFly(point, 50);
					}
				}
			}

			if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
				UserBoss.ins().attHandle = 0;
				if (UserFb.ins().guideBossKill) {
					UserBoss.ins().winner = Actor.myName;
				}
				GuideUtils.ins().clickOut();
				GameLogic.ins().postChangeTarget(0);
			}
		}

		this.postRemoveEntity(handle, entity);
	}

	public postRemoveEntity(handle, entity) {
		return [handle, entity];
	}

	private removeEntity(handle) {
		let entity: CharMonster = EntityManager.ins().getEntityByHandle(handle);
		if (entity && entity.infoModel.getAtt(AttributeType.atHp) <= 0) {
			EntityManager.ins().removeByHandle(handle, false, true);
			// entity.playAction(EntityAction.HIT);
			entity.stopMove();
			entity.onDead(() => {
				entity.deadDelay();
				entity.dieTweenObj.factor = 0;
				let dis = GameMap.CELL_SIZE * 1.5;
				let p: { x: number, y: number }[] = [];
				p[0] = { x: entity.x, y: entity.y };
				let dir = entity.dir;
				p[2] = DirUtil.getGridByDir(dir, 3, entity);
				p[1] = { x: Math.min(p[0].x + (p[2].x - p[0].x) * 3 / 5), y: Math.min(p[2].y, p[0].y - dis / 2) }
				let t = egret.Tween.get(entity.dieTweenObj, {
					onChange: (arg) => {
						//死亡击飞
						let value = entity.dieTweenObj.factor;
						entity.x = Math.pow(1 - value, 2) * p[0].x + 2 * value * (1 - value) * p[1].x + Math.pow(value, 2) * p[2].x;
						entity.y = Math.pow(1 - value, 2) * p[0].y + 2 * value * (1 - value) * p[1].y + Math.pow(value, 2) * p[2].y;
					}, onChangeObj: this
				});
				t.to({ factor: 1 }, 500).to({ alpha: 0 }, 1000).call(() => {
					DisplayUtils.removeFromParent(entity);
				});
			});
		} else {
			EntityManager.ins().removeByHandle(handle, true, true);
		}
	}

	/**
	 * 实体移动
	 * 0-11
	 * @param bytes
	 */
	private doMoveEntity(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let target: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		if (!target) return;
		let tx = bytes.readInt();
		let ty = bytes.readInt();

		GameMap.moveEntity(target, tx, ty, true);//是否直线行走，无视障碍物

	}

	/**
	 * 停止实体移动
	 * 0-12
	 * @param bytes
	 */
	private doStopMoveEntity(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let target: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		if (target && target.infoModel.getAtt(AttributeType.atHp) > 0) {
			target.stopMove();
			target.playAction(EntityAction.STAND);

			let lastX = target.x;
			let lastY = target.y;

			target.x = bytes.readInt();
			target.y = bytes.readInt();

			// if(target==EntityManager.ins().getNoDieRole()) {
			// 	console.log("0-12:",target.x,target.y);
			// }
			// let pos = AIUtil.checkJump(target);
			// if (pos) {
			// 	GameLogic.ins().sendReqJump(handle, { x: target.x, y: target.y }, pos)
			// }
		}
	}

	/**
	 * 同步实体坐标
	 * 0-13
	 * @param bytes
	 */
	private doSyncPos(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let target: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		let type: number = bytes.readShort();
		if (target) {
			target.stopMove();
			// 0 瞬移
			// 1 野蛮冲撞
			// 2 被击退
			// 3 跳跃
			let t: egret.Tween;
			switch (type) {
				case 0:
					target.playAction(EntityAction.STAND);
					target.x = bytes.readInt();
					target.y = bytes.readInt();
					//同步坐标时，需要调用下移动摄像机，并延迟下一帧处理，因为死亡时移动会有问题
					if (target.isMy) {
						egret.callLater(this.postMoveCamera, this);
						if (target == EntityManager.ins().getNoDieRole())
							this.syncMyPos({x: target.x, y: target.y});
					}
					break;

				case 1:
					target.playAction(EntityAction.RUN);
					t = egret.Tween.get(target.moveTweenObj);
					t.to({
						"x": bytes.readInt(),
						"y": bytes.readInt()
					}, bytes.readInt()).call(() => {
						target.playAction(EntityAction.STAND);
					});
					break;

				case 2:
					// debug.warn("0-13击退怪物:" + target.infoModel.name + "id:" + target.infoModel.configID);
					target.playAction(EntityAction.STAND);
					t = egret.Tween.get(target.moveTweenObj);
					t.to({
						"x": bytes.readInt(),
						"y": bytes.readInt()
					}, bytes.readInt());
					break;
				case 3:
					let [x, y, time] = [bytes.readInt(), bytes.readInt(), bytes.readInt()];
					target.playAction(EntityAction.FLY);
					target.drawJumpShadow(100, Math.floor(time / 100));
					DirUtil.baserMove(target, { x: x, y: y }, time)
					break;
			}
		}
	}

	/**派发同步实体坐标消息 */
	public postMoveCamera(): [number, number, number, number] | boolean {
		let entity = EntityManager.ins().getNoDieRole();
		if (!entity) return false;
		return [entity.x, entity.y, GameMap.mapID, GameMap.fubenID];
	}

	/**
	 * 请求服务器时间
	 * 0-14
	 */
	public sendSyncServerTime(): void {
		this.sendBaseProto(14);
	}

	/**
	 * 处理MP
	 *
	 * 0-15
	 * @param bytes
	 */
	postMpChange(bytes: GameByteArray) {
		let handle: number = bytes.readDouble();
		let mp: number = bytes.readDouble();
		let target: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		let model: EntityModel;
		if (target) {
			target.infoModel.setAtt(AttributeType.atMp, mp);
			model = target.infoModel;
		}

		return model;
	}

	public postExpMc(mon: CharMonster): CharMonster {
		return mon;
	}

	public syncMyPos(pos: XY): XY {
		return pos;
	}

	/**
	 * 显示服务器提示
	 * 0-17
	 * @param bytes
	 */
	private doTips(bytes: GameByteArray): void {
		let strTips: string = GlobalConfig.ServerTips[bytes.readInt()].tips;
		UserTips.ins().showTips(strTips);
	}

	/**
	 * 第一次登陆
	 * 0-18
	 */
	private doFirstRegister(bytes: GameByteArray): void {
		let type = bytes.readShort();
		if (type == 1) {
			ViewManager.ins().open(WelcomeWin);
		} else if (type == 2) {
			ViewManager.ins().open(StoryFinishWin);
		}

	}

	/**
	 * 领取第一次登陆奖励
	 * 0-18
	 */
	public sendFirstRegisterReward(index: number): void {
		let bytes = this.getBytes(18);
		bytes.writeShort(index);
		this.sendToServer(bytes);
	}

	/**
	 * 处理玩家死亡提示
	 * 0-20
	 */
	private doDieNotice(bytes: GameByteArray): void {
		//在转生boss里面死亡提示
		// if (ZsBoss.ins().isZsBossFb(GameMap.fubenID)) {
		// 	UserTips.ins().showTips("你被击败，请等待复活");
		// }
	}

	/**
	 * 处理玩家仙盟变化
	 * 0-21
	 */
	public postGuildChange(bytes: GameByteArray): [number, string] {
		return [bytes.readInt(), bytes.readString()];
	}


	//其他玩家更新属性 0-24
	public postOtherAttChange(bytes: GameByteArray): CharMonster {
		let target: CharMonster = EntityManager.ins().getEntityByHandle(bytes.readDouble());
		if (!target || !target.infoModel)
			return null;

		let len: number = bytes.readShort();
		for (let i: number = 0; i < len; i++)
			target.infoModel.setAtt(bytes.readInt(), bytes.readDouble());

		return target;
	}

	//泡泡提示 0-25
	private doPaoPao(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let id: number = bytes.readInt();
		let target: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		let config = GlobalConfig.BubbleConfig[id];
		if (config.type == 1){
			if (target) target.addPaoPao(id);
		} else{
			BubbleFactory.ins().playBubbleEffect(id)
		}
	}

	/**
	 * 处理扩展属性变化
	 * 0-27
	 * @param bytes
	 */
	private doSubRoleExtAtt(bytes: GameByteArray): void {
		SubRoles.ins().doSubRoleExtAtt(bytes);
	}


	/**
	 * 请求改名
	 * 0-22
	 */
	public sendRename(name: string): void {
		let bytes: GameByteArray = this.getBytes(22);
		bytes.writeString(name);
		this.sendToServer(bytes);
	}

	/**
	 * 改名结果
	 * 0-22
	 */
	public postRename(bytes: GameByteArray): void {
		let result: number = bytes.readByte();
		if (result == 0) {
			GameSocket.ins().close();
			ViewManager.ins().close(RenameWin);
			debug.log('改名成功，重新登录即可生效！');
			location.reload();
		}
		else {
			RoleMgr.ins().showErrorTips(result);
		}
	}

	//正在攻击目标handle
	public currHandle: number = 0;
	//玩家正在攻击目标 masterHandle
	public currAttackHandle: number = 0;

	/**
	 * 改变物体目标
	 * 0-25
	 */
	public postChangeAttrPoint(handle: number): void {
		let bytes: GameByteArray = this.getBytes(25);
		bytes.writeDouble(handle);
		this.sendToServer(bytes);
		GuildWar.ins().getModel().clickTime = 1;
	}

	/**
	 * 问客户端寻路
	 * 0-31
	 */
	private doFindPath(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let sx: number = Math.floor(bytes.readInt() / GameMap.CELL_SIZE);
		let sy: number = Math.floor(bytes.readInt() / GameMap.CELL_SIZE);
		let endX = bytes.readInt();
		let endY = bytes.readInt();
		let tx: number = Math.floor(endX / GameMap.CELL_SIZE);
		let ty: number = Math.floor(endY / GameMap.CELL_SIZE);
		let path: AStarNode[] = GameMap.getPatch(sx, sy, tx, ty);
		if (!path) {
			// Assert(false, `0-31 寻路异常，mapId:${GameMap.mapID},fbid:${GameMap.fubenID},fbType:${GameMap.fbType},sx:${sx},sy:${sy},tx:${tx},ty:${ty}`);
		}
		this.sendFindPathToServer(handle, path);
	}

	/**
	 *回复寻路结果
	 * isLastGrip 最后一个是否是格子坐标 true是，false是像素坐标
	 * 0-31
	 */
	public sendFindPathToServer(handle: number, path: AStarNode[], isLastGrip: boolean = true): void {
		let len: number = path ? path.length : 0;
		let bytes: GameByteArray = this.getBytes(31);
		bytes.writeDouble(handle);
		bytes.writeInt(len);
		for (let i: number = 0; i < len; i++) {
			if (i == 0 && !isLastGrip) {
				bytes.writeInt(path[i].nX);
				bytes.writeInt(path[i].nY);
			} else {
				bytes.writeInt(path[i].nX * GameMap.CELL_SIZE + (GameMap.CELL_SIZE >> 1));
				bytes.writeInt(path[i].nY * GameMap.CELL_SIZE + (GameMap.CELL_SIZE >> 1));

				// let t = EntityManager.ins().getEntityByHandle(handle);
				// if(t == EntityManager.ins().getNoDieRole()){
				// 	console.log("0-31:",path[i].nX * GameMap.CELL_SIZE + (GameMap.CELL_SIZE >> 1),path[i].nY * GameMap.CELL_SIZE + (GameMap.CELL_SIZE >> 1));
				// }
			}

		}
		this.sendToServer(bytes);
	}

	/**
	 * 扣血飘字
	 * 0-32
	 */
	private doBloodNumShow(bytes: GameByteArray): void {
		let targetHandle: number = bytes.readDouble();
		let sourceHandle: number = bytes.readDouble();
		let value = Math.ceil(bytes.readDouble()) * -1;
		let type: number = bytes.readUnsignedInt();
		// egret.log(value);
		let charSource: CharMonster = EntityManager.ins().getEntityByHandle(sourceHandle) as CharMonster;
		if (!charSource) {
			//debug.error(`找不到handle:${sourceHandle}的施法者`);
			return;
		}
		let charTarget: CharMonster = EntityManager.ins().getEntityByHandle(targetHandle) as CharMonster;
		if (!charTarget) {
			//debug.error(`找不到handle:${targetHandle}的目标者`);
			return;
		}


		charTarget.doHitAction()
		GameLogic.ins().postEntityHpChange(charTarget, charSource, type, value);
	}

	/**
	 * 0-33
	 * @param bytes
	 */
	public doChangeTarget(bytes: GameByteArray): any {
		let sourceHandle: number = bytes.readDouble();
		let targetHandle: number = bytes.readDouble();

		this.postAllAtkTarget(sourceHandle, targetHandle);

		let char: CharMonster = EntityManager.ins().getEntityByHandle(sourceHandle);
		if (char && char.infoModel && char.infoModel.masterHandle == Actor.handle)
			this.postAtkTarget(targetHandle);

		if (CityCC.ins().isCity || TargetListCC.ins().isShow || BattleCC.ins().isBattle() || PaoDianCC.ins().isPaoDian || GwBoss.ins().isGwBoss || GwBoss.ins().isGwTopBoss) {
			TargetListCC.ins().postTargetList(sourceHandle, targetHandle);
			return;
		}

		if (GameMap.fbType != UserFb.FB_TYPE_GUILD_WAR
			&& GameMap.fbType != UserFb.FB_TYPE_ZHUANSHENGBOSS
			&& GameMap.fbType != UserFb.FB_TYPE_ALLHUMENBOSS
			&& GameMap.fbType != UserFb.FB_TYPE_HOMEBOSS
			&& GameMap.fbType != UserFb.FB_TYPE_GUIDEBOSS || targetHandle == 0) {
			if (EntityManager.ins().getEntityByHandle(sourceHandle) == EntityManager.ins().getNoDieRole())
				GameLogic.ins().currAttackHandle = targetHandle;
			return
		}

		let target: CharRole = EntityManager.ins().getEntityByHandle(targetHandle) as CharRole;
		if (target && target.infoModel && target.infoModel.masterHandle > 0) {
			let source: CharRole = EntityManager.ins().getEntityByHandle(sourceHandle) as CharRole;
			if (source && source.infoModel && source.infoModel.masterHandle == Actor.handle) {
				this.postChangeTarget(target.infoModel.masterHandle);
			}

			if (source && source.infoModel) {
				let sources: CharRole[] = EntityManager.ins().getMasterList(source.infoModel.masterHandle);
				if (target.infoModel.masterHandle == Actor.handle && sources) {
					for (let k in sources) {
						if (!(sources[k] instanceof CharRole)) continue;
						sources[k].setNameTxtColor(ColorUtil.ROLENAME_COLOR_YELLOW);
					}
					if (GameMap.fbType == UserFb.FB_TYPE_GUIDEBOSS) {
						if (UserBoss.ins().weixieList[0] != source.infoModel.masterHandle) {
							let tname: string = source.infoModel.name;
							if (source.infoModel.type == EntityType.LadderPlayer) {
								let strlist = tname.split("\n");
								if (strlist[1])
									tname = strlist[1];
								else
									tname = strlist[0];

								tname = StringUtils.replaceStr(tname, "0xffffff", ColorUtil.ROLENAME_COLOR_GREEN + "");
							}
							if (UserFb.ins().guideBossKill) UserTips.ins().showCenterTips(`受到|C:0x35e62d&T:${tname}|玩家的攻击，点击右边头像进行反击`);
						}
						UserBoss.ins().weixieList.length = 0;
						UserBoss.ins().changeWeiXieList(source.infoModel.masterHandle);
						UserBoss.ins().postHasAttackChange(0);
					}
				}
			}
		}
		else {
			let sourceHd: CharRole = EntityManager.ins().getEntityByHandle(sourceHandle) as CharRole;
			if (sourceHd && sourceHd.infoModel) {
				if (sourceHd.infoModel.masterHandle == Actor.handle) {
					if (target && target.infoModel) {
						this.postChangeTarget(target.infoModel.masterHandle);
					} else {
						this.postChangeTarget(0);
					}
				}
			}
		}
	}

	//masterHandle
	public postChangeTarget(handle): void {
		GameLogic.ins().currAttackHandle = handle;
	}

	//atkHandle
	public postAtkTarget(handle): void {
		this.currHandle = handle;
	}

	//所有攻击目标
	public postAllAtkTarget(sourceHandle, targetHandle) {
		return [sourceHandle, targetHandle];
	}

	private test(keyCode: number): void {
		if (keyCode == Keyboard.BRACE_R) {

		}
		if (keyCode == Keyboard.BRACE_L) {
		}
		if (keyCode == Keyboard.BACKSLASH) {
		}

		if (keyCode == Keyboard.I) {
			
		}
		if (keyCode == Keyboard.O) {

		}
		if (keyCode == Keyboard.P) {

		}
		if (keyCode == Keyboard.SPACE) {
			RoleAI.ins().togglePause();
		}
		if (keyCode == Keyboard.BACK_QUOTE && this.gamescene) {
			this.gamescene.input.visible = true;
		}
		if (keyCode == Keyboard.ENTER && this.gamescene && this.gamescene.input.visible) {
			this.sendGMCommad(this.gamescene.input.text);
		}
	}

	/** 开始挑战boss */
	public startPkBoss(): void {
		UserFb.ins().autoPk();
	}

	/**
	 * 创建实体（依赖数据结构）
	 */
	public createEntityByModel<T extends egret.DisplayObject>(model: any, ...param: any[]): T {
		let target = EntityManager.ins().createEntity(model, param);
		if (target)
			this.addEntity(target);
		return <T>target;
	}

	public addEntity(target: egret.DisplayObject): void {
		if (target instanceof CharRole) {
			target.showBlood(target.isMy || target.team == Team.WillEntity);
			target.showNeigong(target.isMy);
		}
		this.gamescene.map.addEntity(target);
	}

	/**
	 * 播放技能特效
	 * @param skill 技能配置
	 * @param self 技能释放者
	 * @param target 技能目标者
	 * @return 持续时间
	 */
	public playSkillEff(skill: SkillData, self: CharMonster, targets: CharMonster[], hitFun: (probability?: number) => void = null): number {
		let rtn = 300;

		if (skill.wordEff && self.team == Team.My) {
			UserSkill.ins().postShowSkillWord(skill.wordEff + "");

			if (UserSkill.ins().hejiLevel > 0) {
				let key = Math.floor(skill.id / 1000);
				if (key == 71 || key == 72 || key == 73) {
					UserSkill.ins().hejiEnable = false;
					UserSkill.ins().setHejiCD(-1);
					UserSkill.ins().postHejiRemove();
				}
			}
		}

		if ((targets.length == 1 && self != targets[0]) || targets.length > 1) {
			//计算方向
			self.dir = DirUtil.get8DirBy2Point(self, targets[0]);
		}

		if (skill && skill.actionType) {
			self.playAction(skill.actionType, self instanceof CharRole ? null : () => {
				if (self.action != EntityAction.DIE) {
					self.playAction(EntityAction.STAND);
				}
			});

			/**突进技能 */
			if (self instanceof CharRole && skill.index == 8) {
				(<CharRole>self).drawJumpShadow();
			}
		}

		if (!ViewManager.ins().isShow(GameSceneView)) {
			return 0;
		}

		// if (self && self.team == Team.My) {
		// 	if (skill.repelDistance) {
		// 		TimerManager.ins().doTimer(350, 1, this.shakeMapView, this);
		// 	}
		// }

		let showList = [14];
		let skillId = Math.floor(skill.configID / 1000);
		//当人数过多时候，技能与我无关的屏蔽技能效果
		if (showList.indexOf(skillId) < 0 && !EntityManager.ins().checkShowSkillEffect()) {
			//boss攻击不屏蔽
			if (self.infoModel.masterHandle && !self.isMy && !targets[0].isMy) {
				return;
			}
		}

		if (skill.effectId) {
			//使用了烈焰印记技能
			if (self.infoModel.type == EntityType.Monster) {
				if (GlobalConfig.FlameStamp.skillId.indexOf(skill.configID) != -1)
					self.usedLyMarkSkill();
			}
			SkillEffPlayer.play(skill.effectId, self, [targets[0]], hitFun);
		} else {
			if (hitFun) {
				hitFun();
			}
			return 0;
		}
		switch (skill.effType) {
			case EffectType.AnyAngle:
				return 700;
		}
		return rtn;
	}

	// private shakeMapView() {
	// 	let gsv = ViewManager.ins().getView(GameSceneView) as GameSceneView;
	// 	DisplayUtils.shakeIt(gsv.map, 5, 250, 2);
	// }

	// private outMc: MovieClip;

	public addOutEff(xPos: number, yPos: number): CharMonster {
		let transModel = new TransferModel();
		transModel.configID = 0;
		transModel.x = xPos;
		transModel.y = yPos;
		transModel.type = EntityType.Transfer;
		return EntityManager.ins().createEntity(transModel) as CharMonster;

		// this.outMc = this.outMc || new MovieClip;
		// this.outMc.scaleX = this.outMc.scaleY = 1;
		// this.outMc.playFile(RES_DIR_EFF + "movestand", -1);
		// this.outMc.x = xPos;
		// this.outMc.y = yPos;
		// SkillEffPlayer.bottomLayer.addChild(this.outMc);
	}

	public removeOutEff() {
		EntityManager.ins().removeTransferById(0);
	}

	private get gamescene(): GameSceneView {
		return ViewManager.ins().getView(GameSceneView) as GameSceneView;
	}

	//当前刷怪的索引..
	public rPosindex: number[] = [];
	/**为了输出一些错误配置的信息 */
	private runTime: number = 0;//运行次数
	private guanqiaId: number = 0;//当前关卡id
	/**创建关卡的怪物 */
	public createGuanqiaMonster(isAll: boolean = true, isElite: boolean = false): void {
		this.guanqiaId = UserFb.ins().guanqiaID;
		if (!GameMap.sceneInMain()) return;
		let count: number = Math.ceil(UserFb.ins().waveMonsterCount * Math.random());
		let monsterTypeLen = UserFb.ins().waveMonsterId.length;

		//精英怪数量
		let eliteCount = EntityManager.ins().getEntityByMonsterId(UserFb.ins().eliteMonsterId).length;

		//最大怪物数量限制 为10个
		let monsterCount = EntityManager.ins().getTeamCount(Team.Monster) - eliteCount;
		if (monsterCount > 3 && !isElite) {
			return;
		}
		count = 10 - monsterCount;

		for (let i = 0; i < monsterTypeLen; i++) {

			let len: number = isAll ? UserFb.ins().rPos[i].length : 1;
			if (len > 3) {
				len = 3;
			}
			count = Math.ceil(count / len);

			let eliteBoo: boolean = isElite;
			for (let j: number = 0; j < len; j++) {
				this.runTime = 0;
				if (!this.rPosindex[i] || this.rPosindex[i] >= UserFb.ins().rPos[i].length)//循环
					this.rPosindex[i] = 0;
				let index: number = this.rPosindex[i];
				let radiusMap: number[][] = [];
				let p = UserFb.ins().rPos[i][index];

				if (!GameMap.checkWalkable(p.x, p.y)) {
					console.log("出生点配置在不可行走区域内");
				}

				let startX: number = p.x - this.MONSTER_RADIUS;//从左上开始计算
				let startY: number = p.y - this.MONSTER_RADIUS;//从左上开始计算
				this.writeMap(radiusMap, startX, startY, count);
				for (let tempX: number = 0; tempX < this.MONSTER_LEN; tempX++) {
					for (let tempY: number = 0; tempY < this.MONSTER_LEN; tempY++) {
						if (!radiusMap[tempX]) continue;
						let tempP: number = radiusMap[tempX][tempY];
						if (!tempP) continue;
						let model: EntityModel;
						if (isElite && eliteBoo && eliteCount < 5) {
							model = UserFb.ins().createMonster(UserFb.ins().eliteMonsterId);
							model.isElite = true;
							eliteBoo = false;
							eliteCount += 1;
						} else {
							let monId: number = UserFb.ins().waveMonsterId[i];
							model = UserFb.ins().createMonster(monId);
						}
						model.x = (startX + tempX) * GameMap.CELL_SIZE + (GameMap.CELL_SIZE >> 1);
						model.y = (startY + tempY) * GameMap.CELL_SIZE + (GameMap.CELL_SIZE >> 1);
						if (!GameMap.checkWalkableByPixel(model.x, model.y)) {
							model.x = p.x * GameMap.CELL_SIZE;
							model.y = p.y * GameMap.CELL_SIZE;
						}
						let wp = isNaN(UserFb.ins().wanderpercent) ? 5000 : UserFb.ins().wanderpercent;
						//是否为主动怪
						model.isWander = Math.random() * 10000 < wp;
						//初始怪物全部为巡逻状态AI_State.Patrol
						let monster = this.createEntityByModel<CharMonster>(model);
						monster.AI_STATE = AI_State.Patrol;
						if (model.effect) monster.addHalo(GlobalConfig.EffectConfig[model.effect].fileName);
					}
				}
				this.rPosindex[i]++;
			}
		}
		if (GameMap.sceneInMain()) RoleAI.ins().start();
	}

	private writeMap(map: number[][], startX: number, startY: number, count: number): void {
		this.runTime++;
		if (this.runTime > 200) {
			debug.log(`关卡${this.guanqiaId}的刷怪点可能在不可行区域内,请策划检查`);
			return;
		}
		let tx: number = MathUtils.limitInteger(0, this.MONSTER_LEN - 1);
		let ty: number = MathUtils.limitInteger(0, this.MONSTER_LEN - 1);
		if (!map[tx])
			map[tx] = [];
		if (!map[tx][ty]) {
			let canMove: boolean = GameMap.checkWalkable(startX + tx, startY + ty);
			if (canMove) {
				map[tx][ty] = 1;
				count--;
			}
			if (count > 0)
				this.writeMap(map, startX, startY, count);
		} else {
			this.writeMap(map, startX, startY, count);
		}
	}

	/**
	 * 派发挂机状态变更
	 * @param value 为Logicmanager中的静态值
	 */
	public postHookStateChange(value: number): number {
		this.hookState = value;
		return value;
	}


	/**派发实体移动 */
	/** 是否格子移动*/
	public postMoveEntity(entity: CharMonster, asNode: AStarNode[], isGrip: boolean = true): Array<any> {
		return [entity, asNode, isGrip];
	}


	/** 计算真实属性值（含增益buff） */
	static calculateRealAttribute(target: CharMonster, type: AttributeType, passiveAttr: any = {}): number {
		let value: number = target.infoModel.getAtt(type);
		let buffs: any = target.buffList;
		let buff: EntityBuff;
		for (let i in buffs) {
			buff = buffs[i];
			if (buff.effConfig.type == SkillEffType.AdditionalAttributes
				&& buff.effConfig.args.d == type) {//增益属性匹配
				value += buff.value;
			}
		}
		let exValue = passiveAttr[type] ? passiveAttr[type] : 0;
		return value + exValue;
	}

	//基本属性触发
	public static triggerAttr(selfTarget: CharMonster, type: AttributeType, passiveAttr: any = {}): boolean {
		let attrValue: number = selfTarget.infoModel.attributeData[type];
		attrValue += passiveAttr[type] ? passiveAttr[type] : 0;
		if (attrValue) {
			let r: number = Math.random();
			if (r < attrValue / 10000) {
				return true;
			}
		}
		return false;
	}

	public static triggerExAttr(selfTarget: CharMonster, type: ExAttributeType): boolean {
		let attrValue: number = selfTarget.infoModel.attributeExData[type];
		if (attrValue) {
			let r: number = Math.random();
			if (r < attrValue / 10000) {
				return true;
			}
		}
		return false;
	}

	//计算是否暴击
	public static triggerCrit(selfTarget: CharMonster, target: CharMonster, addValue: number = 0): boolean {
		let crit = selfTarget.infoModel.getAtt(AttributeType.atCrit);
		if (selfTarget.buffList[60003]) {
			let skillEff: EffectsConfig = selfTarget.buffList[60003].effConfig;
			crit = crit + Math.floor(skillEff.args.c / 10000 * crit);
		}
		let attrValue: number = crit - target.infoModel.getAtt(AttributeType.atTough) + addValue;
		if (attrValue > 0) {
			let r = Math.random();
			if (r < attrValue / 10000) {
				return true;
			}
		}
		return false;
	}

	//计算是否闪避
	public static triggerMiss(selfTarget: CharMonster, target: CharMonster): boolean {
		let hit = selfTarget.infoModel.getExAtt(ExAttributeType.eatHit);
		let miss = target.infoModel.getExAtt(ExAttributeType.eatMiss);
		let min = Math.min(miss - hit, 4000);
		if (min > 0) {
			let r: number = Math.random();
			if (r < min / 10000) {
				return true;
			}
		}
		return false;
	}


	public static triggerValue(value: number): boolean {
		if (value) {
			let r: number = Math.random();
			if (r < value / 10000) {
				return true;
			}
		}
		return false;
	}

	public postViewOpen(b: number): number {
		return b;
	}

	private doAddMonsterConfig(bytes: GameByteArray) {
		let config: MonstersConfig[] = JSON.parse(bytes.readString());
		for (let i in config) {
			GlobalConfig.MonstersConfig[i] = config[i];
		}
	}

	/**
	 * 0-35
	 * @param bytes
	 */
	private doZeroInit(bytes: GameByteArray) {
		GameApp.ins().postZeroInit();
	}

	/**
	 * 更新阵营
	 * 0-36
	 * @param bytes
	 */
	public postChangeCamp(bytes: GameByteArray): void {
		let handle: number = bytes.readDouble();
		let target: CharMonster = EntityManager.ins().getEntityByHandle(handle) as CharMonster;
		if (target && target.infoModel) {
			(<Role>target.infoModel).camp = bytes.readInt();

			if (target.infoModel.masterHandle == Actor.handle) {
				BattleCC.ins().camp = (<Role>target.infoModel).camp;
				BattleCC.ins().postEnterSuccess();
			}

			target.setCharName((<Role>target.infoModel).guildAndName);
			(<CharRole>target).updateNameColor();
		}
	}

	
	/**
	 * 0-38
	 * @param bytes
	 */
	private doServerVer(bytes: GameByteArray) {
		GameLogic.SERVER_VER = bytes.readString();
	}

	/**
	 * 玄玉 判断
	 */
	public static skyBallCheck(target: CharMonster): boolean {
		if (this.triggerExAttr(target, ExAttributeType.eatAllCrit)) {
			let effBuff: EntityBuff;
			effBuff = ObjectPool.pop('EntityBuff');
			effBuff.effConfig = GlobalConfig.EffectsConfig[SkillConst.EFF_SKY_BALL];
			effBuff.addTime = egret.getTimer();
			effBuff.endTime = effBuff.addTime + target.infoModel.getExAtt(ExAttributeType.eatAllCritTime);
			target.addBuff(effBuff);
			return true;
		}
		return false;
	}

	/**
	 * 抽取成公用方法, 移动物品图标到背包
	 * @param itemicon 物品图标
	 */
	public flyItem(itemicon: ItemIcon) {
		let flyItem: eui.Image = new eui.Image(itemicon.imgIcon.source);
		flyItem.x = itemicon.imgIcon.x;
		flyItem.y = itemicon.imgIcon.y;
		flyItem.width = itemicon.imgIcon.width;
		flyItem.height = itemicon.imgIcon.height;
		flyItem.scaleX = itemicon.imgIcon.scaleX;
		flyItem.scaleY = itemicon.imgIcon.scaleY;
		itemicon.imgIcon.parent.addChild(flyItem);
		this.postFlyItemEx(flyItem);
	}

	public postFlyItem(item: CharItem2): CharItem2 {
		return item;
	}

	public postFlyItemEx(item: egret.DisplayObject): egret.DisplayObject {
		return item;
	}

	public postFlyItemTop(item: ItemBase): ItemBase {
		return item;
	}


	/*** 停止服务端AI */
	public stopAI(): void {
		this.sendBaseProto(33);
	}

	/**副本内，请求服务端跳跃 */
	public sendReqJump(handle: number, orgPos: XY, targetPos: XY) {
		let bytes = this.getBytes(37);
		bytes.writeDouble(handle);
		bytes.writeInt(orgPos.x);
		bytes.writeInt(orgPos.y);
		bytes.writeInt(targetPos.x);
		bytes.writeInt(targetPos.y);
		this.sendToServer(bytes);
	}
}

namespace GameSystem {
	export let  gamelogic = GameLogic.ins.bind(GameLogic);
}