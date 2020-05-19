/**
 * Created by MPeter on 2018/3/6.
 *  魔界入侵-复活界面
 */
class DevildomReliveWin extends BaseEuiView {
	public reliveBtn: eui.Button;
	public exitBtn: eui.Button;
	public killTips: eui.Label;
	public reliveTxt: eui.Label;
	public reliveTimesTxt: eui.Label;
	private remainM: number = 0;
	private alive: eui.Label;
	protected aliveNum: number;

	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "WorldBossGoldSkin";
		this.aliveNum = 0;
	}

	public open(...param): void {
		this.addTouchEvent(this.reliveBtn, this.onRelive);
		this.addTouchEvent(this.exitBtn, this.onTap);
		this.setWin(param[0], param[1]);
	}


	private setWin(cd, killerHandler: number): void {
		if (killerHandler > 0) {
			let killer = EntityManager.ins().getEntityByHandle(killerHandler);
			let str: string = "";
			if (killer) {
				let masterKiller = EntityManager.ins().getEntityByHandle(killer.infoModel.masterHandle);//如果是召唤兽 就是它主人的handler
				if (killer instanceof CharRole) {
					str = killer.infoModel.name;
				}
				else if (killer.infoModel.masterHandle && masterKiller) {
					str = `${masterKiller.infoModel.name}`;
				}
				else {
					str = `Boss${killer.infoModel.name}`;
				}
			}

			this.killTips.textFlow = TextFlowMaker.generateTextFlow1(`你被|C:${0x23C42A}&T:${str}|击败`)
			this.alive.visible = false;
			if (this.alive.visible)
				this.alive.text = `复活道具 ${this.aliveNum}/1`;
		}

		this.reliveBtn.label = `${GlobalConfig.DevilBossBase.rebornCost}原地复活`;
		this.reliveTimesTxt.text = cd + "秒";
		this.remainM = cd;
		TimerManager.ins().doTimer(1000, this.remainM, this.refushLabel, this, this.overTime, this);

	}


	private refushLabel(): void {
		this.remainM--;
		this.reliveTimesTxt.text = this.remainM + "秒";
	}

	private overTime(): void {
		ViewManager.ins().close(this);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.exitBtn:
				UserFb.ins().sendExitFb();
				break;
		}
	}

	protected onRelive(e: egret.TouchEvent): void {
		if (this.aliveNum) {
			DevildomSys.ins().sendClearReliveCD();
			return;
		}

		if (GlobalFun.checkMoney(GlobalConfig.DevilBossBase.rebornCost, MoneyConst.yuanbao, `元宝不足，无法立即复活`)) {
			DevildomSys.ins().sendClearReliveCD();
		}

	}
}
ViewManager.ins().reg(DevildomReliveWin, LayerManager.UI_Popup);
