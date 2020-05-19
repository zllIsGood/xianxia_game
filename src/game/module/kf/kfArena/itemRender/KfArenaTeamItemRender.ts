/**
 * Created by MPeter on 2018/3/22.
 * 跨服3v3 -队伍列表
 */
class KfArenaTeamItemRender extends BaseItemRender {
	//////////////////////////组件部分///////////////////////////
	public belongGroup: eui.Group;
	public roleHead: eui.Image;
	public deadMask: eui.Rect;
	public reliveWordImg: eui.Image;
	public countDown: eui.BitmapLabel;
	public bloodBar: eui.ProgressBar;
	public roleName: eui.Label;
	public clickEffc: MovieClip;
	//////////////////////////私有变量////////////////////////////
	/**复活CD*/
	private relCD: number;
	//////////////////////////公共变量////////////////////////////
	/**当前玩家的数据*/
	public roleDt: Role;

	public constructor() {
		super();
	}

	protected childrenCreated(): void {
		this.init();
	}


	

	public init() {
		
		this.bloodBar.slideDuration = 0;
		this.touchChildren = false;
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);

		this.clickEffc = new MovieClip;
		this.clickEffc.x = 32;
		this.clickEffc.y = 31;
		this.clickEffc.scaleX = this.clickEffc.scaleY = 0.85;

	}

	protected dataChanged(): void {
		if (!isNaN(this.data)) {
			if (this.data) {
				let charSource = EntityManager.ins().getEntityBymasterhHandle(this.data) || EntityManager.ins().getEntityByHandle(this.data);
				if (charSource && charSource.infoModel) {
					this.setData(charSource.infoModel);
					//敌人
					this.roleName.textColor = 0xff0000;
					this.bloodBar["thumb"]["source"] = "ttred2";
					//在安全区，显示复活点
					this.reliveWordImg.visible = charSource.infoModel.getAtt(AttributeType.atHp) > 0 && (<CharRole>charSource).isSafety();
				}
			}
		} else if (this.data instanceof Role) {
			//队友
			this.setData(this.data);
		}
	}

	/**
	 * 设置数据
	 * @param data[Role]
	 * */
	public setData(data: Role): void {
		this.roleDt = data;
		if (data) {
			this.roleHead.source = `main_role_head${data.job}`;
			this.roleName.text = data.getNameWithServer();
			this.upHp();
			// if (!TimerManager.ins().isExists(this.upHp, this))
			// 	TimerManager.ins().doTimer(1000, 3, this.upHp, this);
		}
	}

	/**开始复活*/
	private startRelive(): void {
		//复活中，不处理
		if (TimerManager.ins().isExists(this.onTime, this))return;
		this.countDown.visible = true;
		this.deadMask.visible = true;
		this.relCD = egret.getTimer() + (GlobalConfig.CrossArenaBase.rebornCd + 1) * 1000;
		TimerManager.ins().doTimer(1000, 20, this.onTime, this);
		this.countDown.text = GlobalConfig.CrossArenaBase.rebornCd + "";
	}

	private onTime(): void {
		let t = (this.relCD - egret.getTimer()) / 1000 >> 0;
		if (t > 0) {
			this.countDown.text = t + "";
		}
		else {
			this.onRelive();
			TimerManager.ins().remove(this.onTime, this);
		}
	}

	/**成功复活*/
	private onRelive(): void {
		this.countDown.visible = false;
		this.deadMask.visible = false;
		this.bloodBar.value = 100;
		this.bloodBar.maximum = 100;
	}

	/**更新血量*/
	@callLater
	public upHp(): void {
		if (!this.data)return;
		let roleList: CharRole[];
		if (!isNaN(this.data)) {
			roleList = EntityManager.ins().getMasterList(this.data);
		}
		else if (this.data instanceof Role) {
			roleList = EntityManager.ins().getMasterList(this.data.masterHandle);
		}
		if (!roleList || roleList.length == 0) return;


		let len = roleList.length;
		let hpValue: number = 0;
		let hpTotal: number = 0;
		for (let i = 0; i < len; i++) {
			let role = roleList[i]
			if (role instanceof CharRole) {
				let curHp = role.infoModel.getAtt(AttributeType.atHp) || 0;
				let maxHp = role.infoModel.getAtt(AttributeType.atMaxHp) || 0;
				hpValue += curHp;
				hpTotal += maxHp;
			}
		}
		this.bloodBar.value = hpValue;
		this.bloodBar.maximum = hpTotal;
		if (hpValue <= 0) this.startRelive();

	}

	public close(...param): void {
		TimerManager.ins().removeAll(this);
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.data = null;
	}


	public onTap(e: egret.TouchEvent): void {
		if (!isNaN(this.data)) {
			SysSetting.ins().setValue("mapClickTx", 0);
			SysSetting.ins().setValue("mapClickTy", 0);

			this.showEffect();

			if (!KfArenaSys.ins().checkFBOperat(KfArenaSys.ins().flagHandle == parseInt(this.data)))return;
			let target = EntityManager.ins().getEntityByHandle(this.data) || EntityManager.ins().getEntityBymasterhHandle(this.data);
			if (target && target.isSafety()) {
				UserTips.ins().showTips(`|C:${ColorUtil.RED}&T:此玩家在复活点，不可攻击！|`);
				return;
			}

			let role: CharRole = EntityManager.ins().getNoDieRole();
			if (role && role.isSafety()) {
				let targetPos: XY = GlobalConfig.CrossArenaBase.readyPos[KfArenaSys.ins().readyIndex - 1].tranferPoint;
				GameMap.moveTo((targetPos.x + 0.5) * GameMap.CELL_SIZE >> 0, (targetPos.y) * GameMap.CELL_SIZE >> 0);
				//注册一个委托任务
				EntrustManager.ins().regEntrusTask(EntrustType.Transfer, this.touchDo, this);
				return;
			}

			this.touchDo();
		}
		else if (this.data instanceof Role) {
			//队友，则查看信息
			UserReadPlayer.ins().sendFindPlayer(KfArenaSys.ins().getActorIdByName(this.data.name), this.data.name);
		}

	}

	private touchDo(): void {
		if (KfArenaSys.ins().flagHandle == parseInt(this.data)) {
			if (KfArenaSys.ins().flagCD - egret.getTimer() > 0) {
				UserTips.ins().showTips(`|C:${ColorUtil.RED}&T:天书未刷新！|`);
				return
			}

			KfArenaSys.ins().sendCollectFlag();//跨服竞技场采旗


		} else GameLogic.ins().postChangeAttrPoint(this.data);
	}


	public showEffect(): void {
		this.clickEffc.playFile(RES_DIR_EFF + "tapCircle", 1);
		this.addChild(this.clickEffc);
	}
}