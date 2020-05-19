/**
 *
 * @author
 *
 */
class DropHelp {

	/** 进行中 */
	public static starting: boolean;

	public static isWillBoss: boolean;

	private static completeFunc: { func: any, funcThis: any };

	/** 最后一个死亡的实体坐标 */
	public static tempDropPoint: egret.Point = new egret.Point();

	private static itemPos: { [key: string]: CharItem2 } = {};

	static dropContainer: egret.DisplayObjectContainer;
	static dropNameContainer: egret.DisplayObjectContainer;

	private static curTarget: CharItem2;
	/**
	 *  6   7   8
	 *  5   0   1
	 *  4   3   2
	 */
	private static orderX: number[] = [-1, 1, -1, 0, 1, -1, 0, 1];
	private static orderY: number[] = [0, 0, 1, 1, 1, -1, -1, -1];

	private static waitTime: number = 0;

	static init(parent: egret.DisplayObjectContainer, parName: egret.DisplayObjectContainer): void {
		this.dropContainer = parent;
		this.dropNameContainer = parName;
		// MessageCenter.ins().addListener(MessagerEvent.CREATE_DROP, this.addDrop, this);
		MessageCenter.addListener(Encounter.ins().postCreateDrop, this.addDrop, this);
	}

	static start(): void {
		//野外
		if (GameMap.sceneInMain() && !Encounter.ins().isEncounter()) {
			TimerManager.ins().doTimer(100, 0, this.findDrop, this);
		} else {
			TimerManager.ins().doTimer(300, 1, this.delayTweenItem, this);
		}
		// if (GameMap.fbType == UserFb.FB_TYPE_MATERIAL || (GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS && OpenSystem.ins().checkSysOpen(SystemType.QUICKDROP))
		// 	|| ((GameMap.fbType == UserFb.FB_TYPE_PERSONAL || Encounter.ins().isEncounter() || GameMap.fbType == UserFb.FB_TYPE_TIAOZHAN) && GameServer.serverOpenDay > 0)
		// ) {
		// 	TimerManager.ins().doTimer(800, 1, this.delayTweenItem, this);
		// } else {
		// 	TimerManager.ins().doTimer(100, 0, this.findDrop, this);
		// }
		this.starting = true;
	}

	static stop(): void {
		TimerManager.ins().removeAll(this);
		this.starting = false;
		// RoleAI.ins().isFindDrop = false;
	}

	private static delayTweenItem() {
		if (!DropHelp.getItemCount()) {
			this.checkDrop();
			return;
		}
		let entity = EntityManager.ins().getNoDieRole();
		if (!entity) {
			this.clearDrop();
			return;
		}
		let mylist = EntityManager.ins().getEntityByTeam(Team.My) as CharMonster[];


		for (let j = 0; j < mylist.length; j++) {

			let element = mylist[j];
			if (element.action != EntityAction.STAND && element.isPlaying)
				continue;

			element.playAction(EntityAction.STAND)
		}

		for (let key in this.itemPos) {
			DropHelp.tweenItem(this.itemPos[key], entity, key);
		}
	}

	private static tweenItem(item: CharItem2, role: CharRole, key: string): void {
		if (item == null) {
			DebugUtils.warn("掉落物Item=null，不能缓动！")
			return;
		}
		//将icon移到上层
		DisplayUtils.removeFromParent(item);
		item.setItemParent(DropHelp.dropNameContainer);

		let t = egret.Tween.get(item);
		let randowNum: number = Math.random() * 500 + 200;
		t.wait(randowNum).to({ x: role.x, y: role.y - 50 }, 450, egret.Ease.backIn).call(function (): void {
			egret.Tween.removeTweens(item);
			DisplayUtils.removeFromParent(item);
			item.destruct();
			delete DropHelp.itemPos[key];
			if (!DropHelp.getItemCount()) {
				DropHelp.checkDrop();
			}
		}, DropHelp);
	}

	static getItemCount() {
		return DropHelp.itemPos ? Object.keys(DropHelp.itemPos).length : 0;
	}

	/**
	 * 添加一个掉落物（格子坐标）会自动检测当前位置是否有掉落物，如果有掉落在附近的格子
	 * @param x_Grid
	 * @param y_Grid
	 * @param parent
	 * @param itemData
	 */
	static addDrop(arr: any[]): void {
		let x_Grid: number = arr[0], y_Grid: number = arr[1], itemData: RewardData = arr[2];

		let charItem: CharItem2 = ObjectPool.pop("CharItem2");
		charItem.setData(itemData);
		let x_g: number = 0;
		let y_g: number = 0;
		let i: number = 0;
		let flag: string = "|";
		if (this.itemPos[x_Grid + flag + y_Grid] || !GameMap.checkWalkable(x_Grid, y_Grid)) {
			for (i = 0; i < this.orderX.length; i++) {
				x_g = x_Grid + this.orderX[i];
				y_g = y_Grid + this.orderY[i];
				if (GameMap.checkWalkable(x_g, y_g) == false)
					continue;
				if (this.itemPos[x_g + flag + y_g] == null)
					break;
			}

			//超过9个，第二圈用遍历
			if (i >= this.orderX.length) {
				let index: number = 2;
				let b: Boolean = true;
				while (b) {
					for (let i = x_Grid - index; i < x_Grid + index && b; i++) {
						for (let j = y_Grid - index; j < y_Grid + index && b; j++) {
							x_g = i;
							y_g = j;
							if (GameMap.checkWalkable(x_g, y_g) == false)
								continue;
							if (this.itemPos[x_g + flag + y_g] == null)
								b = false;
						}
					}
					index++;
				}
			}
		}
		else {
			x_g = x_Grid;
			y_g = y_Grid;
		}


		charItem.x = GameMap.grip2Point(x_g);
		charItem.y = GameMap.grip2Point(y_g);

		this.itemPos[x_g + flag + y_g] = charItem;

		GameLogic.ins().addEntity(charItem);

		charItem.addRoatEffect();
		charItem.addFloatEffect();
	}

	/**
	 * 清理所有掉落的缓动
	 * @returns void
	 */
	private static clearAllDropTween(): void {
		if (!this.itemPos) return;
		let value: CharItem2 = null;
		for (let key in this.itemPos) {
			value = this.itemPos[key];
			if (value && value instanceof CharItem2) {
				value.removeRoatEffect();
			}
		}
	}

	/** 清空掉落物 */
	static clearDrop(): void {
		DropHelp.clearAllDropTween();
		this.stop();
		for (let key in this.itemPos) {
			DisplayUtils.removeFromParent(this.itemPos[key]);
			if (this.itemPos[key]) this.itemPos[key].destruct();
			ObjectPool.push(this.itemPos[key]);
			delete this.itemPos[key];
		}
		this.curTarget = null;

		if (this.completeFunc) {
			this.completeFunc.func.call(this.completeFunc.funcThis);
			this.completeFunc = null;
		}
	}

	private static lastPoint: egret.Point = new egret.Point();
	private static findDrop(): void {
		let role: CharRole = EntityManager.ins().getNoDieRole();

		if (!role) return;

		let mylist = EntityManager.ins().getEntityByTeam(Team.My) as CharMonster[];

		// if (this.curTarget)
		// 	if (!role || role.action == EntityAction.RUN || role.atking) {
		// 		if (role && role.action == EntityAction.RUN) {
		// 			//解决最小化后捡道具卡住问题
		// 			if (role.x == this.lastPoint.x && role.y == this.lastPoint.y) {
		// 				role.playAction(EntityAction.STAND);
		// 			} else {
		// 				this.lastPoint.x = role.x;
		// 				this.lastPoint.y = role.y;
		// 			}
		// 		}
		// 		return;
		// 	}
		// RoleAI.ins().isFindDrop = true;
		// if (mylist.length > 1) {
		// 	let len: number = SubRoles.ins().subRolesLen;
		// 	let index = 0;
		// 	let dirs = [-1, 1];
		for (let j = 0; j < mylist.length; j++) {

			let element = mylist[j];
			if (element == role || (element.action != EntityAction.STAND && element.isPlaying))
				continue;

			element.playAction(EntityAction.STAND)
		}


		if (egret.getTimer() - this.waitTime < 200) {
			return;
		}

		let target = null;
		if (this.curTarget) {
			target = this.curTarget;
			// if (MathUtils.getDistance(role.x, role.y, target.x, target.y) < GameMap.CELL_SIZE >> 1) {
			//拾取
			for (let i in this.itemPos) {
				if (this.itemPos[i] == target) {
					//清理缓存
					let dropItem: CharItem2 = this.itemPos[i];
					if (dropItem && dropItem instanceof CharItem2) {
						dropItem.removeRoatEffect();
					}
					//删除
					delete this.itemPos[i];
					break;
				}
			}

			egret.Tween.get(target).wait(100).call(() => {
				// DisplayUtils.removeFromParent(target);
				GameLogic.ins().postFlyItem(target);
				target = null;
			});

			this.curTarget = null;

			this.waitTime = egret.getTimer();
			return;
			// }
			// else
			// 	this.curTarget = null;
		}

		let tar = null;
		let xb: number = Number.MAX_VALUE;
		for (let i in this.itemPos) {
			target = this.itemPos[i];
			//计算距离
			let dist = MathUtils.getDistance(role.x, role.y, target.x, target.y);
			if (xb > dist) {
				xb = dist;
				tar = this.itemPos[i];
			}
		}
		if (tar) {
			this.curTarget = tar;
			// GameMap.moveEntity(role, tar.x, tar.y);
			//有掉落物，不处理下面的逻辑
			return;
		}
		this.checkDrop();
		if (GameMap.fubenID == 0) {
			UserFb.ins().sendGetReward();
		}
	}

	private static checkDrop() {
		if (!this.getItemCount()) {
			this.stop();
			if (this.completeFunc) {
				this.completeFunc.func.call(this.completeFunc.funcThis);
				this.completeFunc = null;
			}
			return;
		}
	}

	public static addCompleteFunc(f: Function, funcThis: any): void {
		this.completeFunc = { func: f, funcThis: funcThis };
	}
}
