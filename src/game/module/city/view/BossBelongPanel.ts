/**主城战的归属界面 */
class BossBelongPanel extends BaseEuiView {

	public attackBtnGroup: eui.Group;
	public attackBoss1: BossUIBtnItem;
	public attackPlayer1: BossUIBtnItem;
	public belongGroup: eui.Group;
	public roleHead1: eui.Image;
	public neigongBar0: eui.ProgressBar;
	public bloodBar0: eui.ProgressBar;
	public belongNameTxt1: eui.Label;
	public attguishu1: eui.Button;

	public constructor() {
		super();

		this.skinName = `BossBelongSkin`;
		this.bloodBar0.labelDisplay.visible = false;
		this.attackBoss1.data = "attbossup";
	}

	public open(...param: any[]): void {
		this.observe(UserBoss.ins().postBelongChange, this.updateBelong);
		this.observe(GameLogic.ins().postChangeTarget, this.updateTarget);
		this.observe(MapView.onGridClick, this.mapClick);
		this.observe(GameLogic.ins().postEnterMap, () => { this.attackBoss1.data = "attbossup"; this.attackPlayer1.data = "attgsup"; });//这就是死亡处理
		this.addTouchEvent(this.belongGroup, this.onTap)
		this.addTouchEvent(this.attguishu1, this.onTap);
		this.addTouchEvent(this.attackBoss1, this.onTap);
		this.addTouchEvent(this.attackPlayer1, this.onTap);
		this.updateBelong();

		TimerManager.ins().remove(this.updateBelong, this);
		TimerManager.ins().doTimer(200, 0, this.updateBelong, this);
	}

	private mapClick({target, x, y}): void {
		this.attackBoss1.data = "attbossup";
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.attguishu1:
				if (UserBoss.ins().attHandle == Actor.handle) {
					if (KFBossSys.ins().isKFBossBattle) {
						KFBossSys.ins().sendCleanBelong();
					}
					else if (DevildomSys.ins().isDevildomBattle) {
						DevildomSys.ins().sendCleanBelong();
					} else {
						UserBoss.ins().sendCleanBelong();
					}

					break;
				}
			case this.attackBoss1:
				this.attrBoss();
				break;
			case this.belongGroup:
			case this.attackPlayer1:
				if (UserBoss.ins().attHandle == 0) {
					UserTips.ins().showTips("|C:0xFFFF00&T:该BOSS无归属者,快去抢夺!|");
					return;
				}
				if (UserBoss.ins().attHandle == Actor.handle || UserBoss.ins().attHandle == GameLogic.ins().currAttackHandle)
					return;
				if (!UserBoss.ins().canClick)
					return;
				GameLogic.ins().postChangeAttrPoint(UserBoss.ins().attHandle);
				this.setBtnState();
				break;
		}


	}

	public attrBoss() {
		GameLogic.ins().postChangeAttrPoint(UserBoss.ins().bossHandler);
		this.attackBoss1.data = "attbossing";
		this.attackPlayer1.data = "attgsup";
	}

	private updateTarget(): void {
		this.setBtnState();
	}

	private setBtnState(): void {
		if (UserBoss.ins().attHandle == Actor.handle) {
			
			if (GwBoss.ins().isGwBoss || KFBossSys.ins().isKFBossBattle || DevildomSys.ins().isDevildomBattle) {
				this.attguishu1.label = `取消归属`;
			} else {
				this.attguishu1.visible = false;
			}

			this.attackPlayer1.currentState = "attgsdis";
		} else {
			this.attguishu1.visible = true;
			this.attguishu1.label = `抢夺归属`;

			if (GameLogic.ins().currAttackHandle && GameLogic.ins().currAttackHandle != UserBoss.ins().bossHandler) {
				this.attackPlayer1.currentState = "attgsing";
			} else {
				this.attackPlayer1.currentState = "attgsup";
			}
		}


		if(GameLogic.ins().currAttackHandle && GameLogic.ins().currAttackHandle == UserBoss.ins().bossHandler) {
			this.attackBoss1.data = "attbossing";
		} else {
			this.attackBoss1.data = "attbossup";
		}
	}

	private updateBelong(): void {
		this.updateTarget();
		let roleList: CharRole[] = EntityManager.ins().getEntitysBymasterhHandle(UserBoss.ins().attHandle);
		if (roleList && roleList.length > 0) {
			let len = roleList.length
			let hpValue: number = 0;
			let hpTotal: number = 0;

			let neigongValue: number = 0;
			let neigongTotal: number = 0;
			let mainRoleInfo: Role;
			for (let i = 0; i < len; i++) {
				let role = roleList[i]
				if (role) {
					let curHp = role.infoModel.getAtt(AttributeType.atHp) || 0;
					let maxHp = role.infoModel.getAtt(AttributeType.atMaxHp) || 0;
					hpValue += curHp;
					hpTotal += maxHp;

					let curNeigong = role.infoModel.getAtt(AttributeType.cruNeiGong) || 0;
					let maxNeigong = role.infoModel.getAtt(AttributeType.maxNeiGong) || 0;
					neigongValue += curNeigong;
					neigongTotal += maxNeigong;
					if (i == 0) {
						mainRoleInfo = <Role>role.infoModel;
					}
				}
			}

			this.belongGroup.visible = (hpValue > 0 && UserBoss.ins().winner == "");
			let color: number = Actor.handle != UserBoss.ins().attHandle ? ColorUtil.ROLENAME_COLOR_YELLOW : ColorUtil.ROLENAME_COLOR_GREEN;
			let tname: string = mainRoleInfo.name;
			let strlist = tname.split("\n");
			if (strlist[1])
				tname = strlist[1];
			else
				tname = strlist[0];

			tname = StringUtils.replaceStr(tname, "0xffffff", color + "");
			this.belongNameTxt1.textFlow = TextFlowMaker.generateTextFlow(`|C:${color}&T:${tname}`);
			// this.roleHead1.source = `yuanhead${mainRoleInfo.job}${mainRoleInfo.sex}`;
			this.roleHead1.source = `main_role_head${mainRoleInfo.job}`
			this.bloodBar0.maximum = hpTotal;
			this.bloodBar0.value = hpValue;

			this.neigongBar0.maximum = neigongTotal;
			this.neigongBar0.value = neigongValue;
			// this.attguishu1.visible = Actor.handle != UserBoss.ins().attHandle;
		} else {
			this.belongGroup.visible = false;
			this.attackPlayer1.data = "attgsup";
		}
	}
}

namespace GameSystem {
	export let  bossBelongPanel = () => {
		ViewManager.ins().reg(BossBelongPanel, LayerManager.Main_View);
	}
}