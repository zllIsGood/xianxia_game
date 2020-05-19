/*法宝跟随着走*/
class RingTurnDisplayer extends egret.DisplayObjectContainer {
	/** 法宝*/
	private mc: MovieClip;
	private ringInfo: ActorExRingConfig;
	private infomodel: EntityModel;

	/*法宝的一些轨迹算法*/
	private static TARGET_POINT_X: number = 95;//相对人物身上的位置x
	private static TARGET_POINT_Y: number = -40;//相对人物身上的位置y
	private static MAX_DIS: number = 60;
	private static STAR_ANGLE: number = 0;
	private static SPEED_RATIO: number = 0.015;

	private gTurnItem: egret.DisplayObjectContainer;
	private gFollowItem: egret.DisplayObjectContainer;
	private gCenterPos: egret.Point;
	private gAngle: number = 180;
	private gTurnTime: number;
	private gStopTime: number;
	private gHasReset: boolean = true;
	private gInitPos: boolean = true;
	private gOwnerLastX: number;
	private gOwnerLastY: number;
	private gOwner: CharRole;
	private gModelUrl: string;

	public effectX: number;//中心点位置
	public effectY: number;

	public constructor() {
		super();
		this.mc = new MovieClip;
		this.gFollowItem = new egret.DisplayObjectContainer();
		this.addChild(this.gFollowItem);
		this.gCenterPos = new egret.Point();
		this.gTurnItem = new egret.DisplayObjectContainer();
		this.gTurnItem.addChild(this.mc);
		this.gFollowItem.addChild(this.gTurnItem);
		TimerManager.ins().doTimer(20, 0, this.update, this)
	}

	//设置主角
	public setOwner(player: CharRole): void {
		this.gOwner = player;
		this.gTurnTime = 10000 + 10000 * Math.random() + egret.getTimer();
		this.gAngle = RingTurnDisplayer.STAR_ANGLE;
		this.gStopTime = 0;
	}

	private isMaxX: Boolean = false;
	private isMaxY: Boolean = false;

	/**
	 *更新
	 *
	 */
	public update(): void {
		if (this.gInitPos) {
			this.gFollowItem.x = RingTurnDisplayer.TARGET_POINT_X;
			this.gFollowItem.y = RingTurnDisplayer.TARGET_POINT_Y - this.gOwner.height;
			this.gInitPos = false;
		}
		else {
			this.gFollowItem.x = this.gFollowItem.x - (this.gOwner.x - this.gOwnerLastX);
			this.gFollowItem.y = this.gFollowItem.y - (this.gOwner.y - this.gOwnerLastY);
		}
		this.gCenterPos = new egret.Point(this.effectX, this.effectY);
		this.moveCenterPoint();
		this.gOwnerLastX = this.gOwner.x;
		this.gOwnerLastY = this.gOwner.y;
	}

	private gemPos1 = [64, -52, -68, -80, -84, -80, -64, -90, -50, -100, 40, -110, 64, -80, 64, -52];

	/**
	 *设置中心位置
	 * @param dir
	 *
	 */
	public setEffectXY(dir: number): void {
		// DebugUtils.log("位置dir" + dir);
		let sx: number = this.gemPos1[dir * 2];
		let sy: number = this.gemPos1[dir * 2 + 1];
		this.effectX = sx + Math.ceil(100 * Math.random() - 50);
		this.effectY = sy + Math.ceil(100 * Math.random() - 50);
	}

	/**
	 *像人物中心移动
	 *
	 */
	private moveCenterPoint(): void {
		let _local1: number;
		let _local2: number = this.gCenterPos.x - this.gFollowItem.x;
		if (_local2 != 0) {
			if (Math.abs(_local2) > RingTurnDisplayer.MAX_DIS) {
				_local1 = Math.ceil(Math.abs(_local2) * RingTurnDisplayer.SPEED_RATIO) * 2 * 3 / 2;
				if (_local2 > 0) {
					if (_local2 > _local1)
						this.gFollowItem.x = this.gFollowItem.x + _local1;
				}
				else if (_local2 < 0) {
					if (Math.abs(_local2) > _local1)
						this.gFollowItem.x = this.gFollowItem.x - _local1;
				}
			}
			else {
				this.isMaxX = false;
				_local1 = Math.ceil(Math.abs(_local2) * RingTurnDisplayer.SPEED_RATIO) * 3 / 2 * 1.35;
				if (_local2 > 0) {
					if (_local2 > _local1)
						this.gFollowItem.x = this.gFollowItem.x + _local1;

				}
				else if (_local2 < 0) {
					if (Math.abs(_local2) > _local1)
						this.gFollowItem.x = this.gFollowItem.x - _local1;
				}
			}
		}
		let _local3: number = this.gCenterPos.y - this.gFollowItem.y;
		if (_local3 != 0) {
			if (Math.abs(_local3) > RingTurnDisplayer.MAX_DIS) {
				_local1 = Math.ceil(Math.abs(_local3) * RingTurnDisplayer.SPEED_RATIO) * 2 * 3 / 2;
				if (_local3 >= 0) {
					if (_local3 > _local1)
						this.gFollowItem.y = this.gFollowItem.y + _local1;
				}
				else if (_local3 < 0) {
					if (Math.abs(_local3) > _local1)
						this.gFollowItem.y = this.gFollowItem.y - _local1;
				}
			}
			else {
				this.isMaxY = false;
				_local1 = Math.ceil(Math.abs(_local3) * RingTurnDisplayer.SPEED_RATIO) * 3 / 2 * 1.35;
				if (_local3 >= 0) {
					if (_local3 > _local1)
						this.gFollowItem.y = this.gFollowItem.y + _local1;
				}
				else if (_local3 < 0) {
					if (Math.abs(_local3) > _local1)
						this.gFollowItem.y = this.gFollowItem.y - _local1;
				}
			}
		}
	}

	private lastID: number;

	/**
	 *设置法宝
	 *
	 */
	public setModel(id: number, infoModel: EntityModel, topContainer: egret.DisplayObjectContainer): void {
		this.infomodel = infoModel;
		if (infoModel.masterHandle && infoModel.masterHandle == Actor.handle) {
			if (id < 0 || id == null)
				return;
			if (EntityManager.ins().getMainRole(0) && (EntityManager.ins().getMainRole(0).infoModel.handle != infoModel.handle))
				return;
		}
		if (infoModel.masterHandle && SpecialRing.ins().hasHanlder(infoModel.masterHandle)) {
			if (this.lastID != id) {
				this.showRing(id);
				this.lastID = id;
			}
			return;
		}
		this.showRing(id);
		topContainer.addChild(this);
	}

	/*显示戒指模型*/
	private showRing(id): void {
		this.mc.alpha = 1;
		this.ringInfo = GlobalConfig.ActorExRingConfig[id];
		let monConfig: MonstersConfig = GlobalConfig.MonstersConfig[this.ringInfo.avatarFileName];
		this.mc.playFile(`${RES_DIR_MONSTER}monster${monConfig.avatar}_0a`, -1);
	}

	/**
	 *清理
	 *
	 */
	public reset(): void {
		if (this.mc) {
			DisplayUtils.removeFromParent(this.mc);
		}
		SpecialRing.ins().delHanlder(this.infomodel.masterHandle);
		this.gOwnerLastX = 0;
		this.gOwnerLastY = 0;
		this.gCenterPos.x = 0;
		this.gCenterPos.y = 0;
		this.gHasReset = true;
		this.gInitPos = true;
		this.gModelUrl = "";
		TimerManager.ins().removeAll(this);
	}
}